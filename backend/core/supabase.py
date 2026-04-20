"""
core/supabase.py

Supabase 클라이언트 초기화 및 JWT 토큰 검증 모듈.

- verify_supabase_token(): Supabase JWT를 SUPABASE_JWT_SECRET으로 로컬 검증
  → 네트워크 왕복 없음, 빠름
- get_supabase_admin(): Admin 작업용 Supabase 클라이언트 반환
  → 유저 조회, 강제 로그아웃 등 서버-사이드 관리 작업에 사용
"""

import logging
import os
from functools import lru_cache
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError

logger = logging.getLogger(__name__)

# Supabase JWT 알고리즘은 항상 HS256
_SUPABASE_JWT_ALGORITHM = "HS256"


class SupabaseTokenError(Exception):
    """Supabase JWT 검증 실패 예외."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


def _get_supabase_jwt_secret() -> str:
    """SUPABASE_JWT_SECRET 환경변수를 읽어 반환한다."""
    secret = os.environ.get("SUPABASE_JWT_SECRET", "")
    if not secret:
        raise SupabaseTokenError(
            "SUPABASE_JWT_SECRET 환경변수가 설정되지 않았습니다."
        )
    return secret


def verify_supabase_token(token: str) -> Dict[str, Any]:
    """
    Supabase JWT 토큰을 SUPABASE_JWT_SECRET으로 검증하고 payload를 반환한다.

    Supabase JWT payload 주요 필드:
    - sub      : 유저 UUID (Supabase user id)
    - email    : 이메일
    - role     : 'authenticated' (Supabase 기본값)
    - user_metadata.role : 앱 커스텀 role (admin / agency / user 등)
    - exp      : 만료 시각 (UNIX timestamp)
    - aud      : 'authenticated'

    Raises:
        SupabaseTokenError: 토큰이 유효하지 않거나 만료된 경우
    """
    try:
        secret = _get_supabase_jwt_secret()
        payload = jwt.decode(
            token,
            secret,
            algorithms=[_SUPABASE_JWT_ALGORITHM],
            audience="authenticated",
        )
        user_id = payload.get("sub", "unknown")
        logger.debug("Supabase 토큰 검증 성공 (sub: %s...)", str(user_id)[:8])
        return payload

    except ExpiredSignatureError as exc:
        logger.info("Supabase 토큰 만료")
        raise SupabaseTokenError("토큰이 만료되었습니다. 다시 로그인해 주세요.") from exc

    except JWTError as exc:
        logger.warning("Supabase 토큰 검증 실패: %s", type(exc).__name__)
        raise SupabaseTokenError("유효하지 않은 인증 토큰입니다.") from exc

    except SupabaseTokenError:
        raise

    except Exception as exc:
        logger.error("Supabase 토큰 처리 중 예기치 않은 오류: %s", exc)
        raise SupabaseTokenError("인증 처리 중 오류가 발생했습니다.") from exc


@lru_cache(maxsize=1)
def get_supabase_admin():
    """
    Supabase Admin 클라이언트를 반환한다 (최초 1회만 생성, 이후 캐시).

    SUPABASE_SERVICE_ROLE_KEY가 없으면 None을 반환한다.
    Admin 클라이언트가 필요한 기능(유저 강제 삭제 등)에서만 사용하세요.
    """
    supabase_url = os.environ.get("SUPABASE_URL", "")
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

    if not supabase_url or not service_role_key:
        logger.warning(
            "SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않아 "
            "Admin 클라이언트를 초기화하지 않습니다."
        )
        return None

    try:
        from supabase import Client, create_client  # type: ignore

        client: Client = create_client(supabase_url, service_role_key)
        logger.info("Supabase Admin 클라이언트 초기화 완료")
        return client
    except Exception as exc:
        logger.error("Supabase Admin 클라이언트 초기화 실패: %s", exc)
        return None


def extract_app_role(supabase_payload: Dict[str, Any]) -> str:
    """
    Supabase JWT payload에서 앱 커스텀 role을 추출한다.

    우선순위:
    1. app_metadata.role  (Supabase 대시보드/Admin API로 설정한 값)
    2. user_metadata.role (클라이언트에서 설정한 값)
    3. 기본값 'user'
    """
    app_meta = supabase_payload.get("app_metadata") or {}
    user_meta = supabase_payload.get("user_metadata") or {}

    return (
        app_meta.get("role")
        or user_meta.get("role")
        or "user"
    )
