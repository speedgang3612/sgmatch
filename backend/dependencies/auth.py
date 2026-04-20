import hashlib
import logging
from datetime import datetime, timezone
from typing import Optional

from core.auth import AccessTokenError, decode_access_token
from core.database import get_db
from core.redis import get_redis
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from schemas.auth import UserResponse
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# 토큰 블랙리스트 — Redis 기반 (TTL 자동 만료)
# ---------------------------------------------------------------------------

_BLACKLIST_PREFIX = "revoked:"
_DEFAULT_TTL_SECONDS = 86400  # 24시간 (JWT 기본 만료와 동일)


def _hash_token(token: str) -> str:
    """토큰을 SHA-256으로 해시하여 Redis 저장 전 민감 정보를 제거한다."""
    return hashlib.sha256(token.encode()).hexdigest()


bearer_scheme = HTTPBearer(auto_error=False)


async def revoke_token(token: str, expires_at: Optional[datetime] = None) -> None:
    """토큰을 Redis 블랙리스트에 추가한다 (로그아웃 시 호출).

    TTL은 expires_at 기준으로 자동 계산된다.
    expires_at이 없으면 기본 24시간 TTL 적용.
    """
    redis = await get_redis()
    token_hash = _hash_token(token)
    key = f"{_BLACKLIST_PREFIX}{token_hash}"

    # TTL 계산
    if expires_at:
        now = datetime.now(timezone.utc)
        ttl = int((expires_at - now).total_seconds())
        if ttl <= 0:
            return  # 이미 만료된 토큰 — 저장 불필요
    else:
        ttl = _DEFAULT_TTL_SECONDS

    await redis.setex(key, ttl, "1")


async def is_token_revoked(token: str) -> bool:
    """토큰이 Redis 블랙리스트에 있는지 확인한다.

    Redis 오류 시 fail-open 처리 (False 반환) — JWT 서명 검증이 1차 방어선.
    """
    try:
        redis = await get_redis()
        token_hash = _hash_token(token)
        key = f"{_BLACKLIST_PREFIX}{token_hash}"
        return await redis.exists(key) > 0
    except Exception as e:
        logger.warning("Redis 오류로 토큰 블랙리스트 확인 불가, fail-open 처리: %s", e)
        return False


async def get_bearer_token(
    request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> str:
    """Extract bearer token from Authorization header."""
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials

    logger.debug("Authentication required for request %s %s", request.method, request.url.path)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication credentials were not provided")


async def get_current_user(
    token: str = Depends(get_bearer_token),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Dependency to get current authenticated user via JWT token."""
    # Redis 블랙리스트 확인
    if await is_token_revoked(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="토큰이 만료되었습니다. 다시 로그인해 주세요.",
        )
    try:
        payload = decode_access_token(token)
    except AccessTokenError as exc:
        # Log error type only, not the full exception which may contain sensitive token data
        logger.warning("Token validation failed: %s", type(exc).__name__)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=exc.message)

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")

    last_login_raw = payload.get("last_login")
    last_login = None
    if isinstance(last_login_raw, str):
        try:
            last_login = datetime.fromisoformat(last_login_raw)
        except ValueError:
            # Log user hash instead of actual user ID to avoid exposing sensitive information
            user_hash = hashlib.sha256(str(user_id).encode()).hexdigest()[:8] if user_id else "unknown"
            logger.debug("Failed to parse last_login for user hash: %s", user_hash)

    return UserResponse(
        id=user_id,
        email=payload.get("email", ""),
        name=payload.get("name"),
        role=payload.get("role", "user"),
        last_login=last_login,
    )


async def get_admin_user(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Dependency to ensure current user has admin role."""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


# ---------------------------------------------------------------------------
# Supabase JWT 기반 인증 Dependency
# ---------------------------------------------------------------------------
# 기존 get_current_user() (자체 JWT) 와 병행 사용 가능.
# Supabase Auth로 로그인한 사용자는 이 함수를 통해 인증한다.
# ---------------------------------------------------------------------------

from core.supabase import SupabaseTokenError, extract_app_role, verify_supabase_token  # noqa: E402


async def get_current_user_supabase(
    token: str = Depends(get_bearer_token),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Supabase JWT 토큰으로 현재 인증된 유저를 반환한다.

    - Authorization: Bearer <supabase_access_token> 헤더에서 토큰 추출
    - SUPABASE_JWT_SECRET으로 로컬 검증 (네트워크 불필요)
    - payload의 app_metadata.role 또는 user_metadata.role을 앱 role로 사용
    """
    try:
        payload = verify_supabase_token(token)
    except SupabaseTokenError as exc:
        logger.warning("Supabase 토큰 검증 실패: %s", exc.message)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=exc.message,
        )

    user_id: str = payload.get("sub", "")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 인증 토큰입니다.",
        )

    email: str = payload.get("email", "")
    role: str = extract_app_role(payload)
    user_meta: dict = payload.get("user_metadata") or {}
    name: str = (
        user_meta.get("full_name")
        or user_meta.get("name")
        or user_meta.get("display_name")
        or ""
    )

    user_hash = hashlib.sha256(user_id.encode()).hexdigest()[:8]
    logger.debug("Supabase 인증 성공 (user_hash: %s, role: %s)", user_hash, role)

    return UserResponse(
        id=user_id,
        email=email,
        name=name,
        role=role,
        last_login=None,
    )


async def get_admin_user_supabase(
    current_user: UserResponse = Depends(get_current_user_supabase),
) -> UserResponse:
    """Supabase JWT 기반 — admin role 확인 Dependency."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 권한이 필요합니다.",
        )
    return current_user
