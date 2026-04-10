import hashlib
import logging
from datetime import datetime
from typing import Optional

from core.auth import AccessTokenError, decode_access_token
from core.database import get_db
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from models.auth import RevokedToken
from schemas.auth import UserResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# 토큰 블랙리스트 — DB 기반 (서버 재시작 후에도 유지)
# ---------------------------------------------------------------------------


def _hash_token(token: str) -> str:
    """토큰을 SHA-256으로 해시하여 DB 저장 전 민감 정보를 제거한다."""
    return hashlib.sha256(token.encode()).hexdigest()


bearer_scheme = HTTPBearer(auto_error=False)


async def revoke_token(token: str, db: AsyncSession, expires_at: Optional[datetime] = None) -> None:
    """토큰을 DB 블랙리스트에 추가한다 (로그아웃 시 호출)."""
    token_hash = _hash_token(token)
    # 이미 등록된 경우 무시
    existing = await db.execute(select(RevokedToken).where(RevokedToken.token_hash == token_hash))
    if existing.scalar_one_or_none() is None:
        db.add(RevokedToken(token_hash=token_hash, expires_at=expires_at))
        await db.commit()


async def is_token_revoked(token: str, db: AsyncSession) -> bool:
    """토큰이 DB 블랙리스트에 있는지 확인한다."""
    token_hash = _hash_token(token)
    result = await db.execute(
        select(RevokedToken).where(RevokedToken.token_hash == token_hash)
    )
    return result.scalar_one_or_none() is not None


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
    # DB 블랙리스트 확인
    if await is_token_revoked(token, db):
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
