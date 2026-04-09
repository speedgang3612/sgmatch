import hashlib
import logging
from datetime import datetime
from typing import Optional

from core.auth import AccessTokenError, decode_access_token
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from schemas.auth import UserResponse

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# 토큰 블랙리스트 (인메모리)
# ⚠️ 서버 재시작 시 초기화됨. 운영 환경에서는 Redis 또는 DB 테이블로 전환 권장.
# ---------------------------------------------------------------------------
_revoked_tokens: set[str] = set()


def revoke_token(token: str) -> None:
    """토큰을 블랙리스트에 추가한다 (로그아웃 시 호출)."""
    _revoked_tokens.add(token)


def is_token_revoked(token: str) -> bool:
    """토큰이 블랙리스트에 있는지 확인한다."""
    return token in _revoked_tokens


bearer_scheme = HTTPBearer(auto_error=False)


async def get_bearer_token(
    request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> str:
    """Extract bearer token from Authorization header."""
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials

    logger.debug("Authentication required for request %s %s", request.method, request.url.path)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication credentials were not provided")


async def get_current_user(token: str = Depends(get_bearer_token)) -> UserResponse:
    """Dependency to get current authenticated user via JWT token."""
    # 블랙리스트 등록된 토큰 거부
    if is_token_revoked(token):
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
