"""
core/supabase.py

Supabase 클라이언트 초기화 및 JWT 토큰 검증 모듈.

- verify_supabase_token(): Supabase JWT 검증
  1) SUPABASE_JWT_SECRET 있으면 HS256 로컬 검증 (audience 검증 완화)
  2) 없으면 JWKS 공개키 방식 (ES256/RS256) 검증 with 10분 캐시
- get_supabase_admin(): Admin 작업용 Supabase 클라이언트 반환
"""

import logging
import os
import time
from functools import lru_cache
from typing import Any, Dict, List, Optional

from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError

logger = logging.getLogger(__name__)

# Supabase JWT 알고리즘
_SUPABASE_JWT_ALGORITHM_HS = "HS256"
_SUPABASE_JWT_ALGORITHMS_ASYMMETRIC = ["RS256", "ES256"]

# JWKS 캐시 (10분)
_jwks_cache: Dict[str, Any] = {}
_jwks_cache_time: float = 0
_JWKS_CACHE_TTL = 600  # 초


class SupabaseTokenError(Exception):
    """Supabase JWT 검증 실패 예외."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


# ---------------------------------------------------------------------------
# HS256 검증 (SUPABASE_JWT_SECRET 기반)
# ---------------------------------------------------------------------------

def _get_supabase_jwt_secret() -> str:
    """SUPABASE_JWT_SECRET 환경변수를 읽어 반환한다."""
    secret = os.environ.get("SUPABASE_JWT_SECRET", "")
    if not secret:
        raise SupabaseTokenError(
            "SUPABASE_JWT_SECRET 환경변수가 설정되지 않았습니다."
        )
    return secret


def _verify_hs256(token: str) -> Dict[str, Any]:
    """HS256 (symmetric) 방식으로 JWT를 검증한다. audience 검증은 완화."""
    secret = _get_supabase_jwt_secret()
    payload = jwt.decode(
        token,
        secret,
        algorithms=[_SUPABASE_JWT_ALGORITHM_HS],
        options={"verify_aud": False},  # aud 검증 완화 — Supabase multi-env 대응
    )
    return payload


# ---------------------------------------------------------------------------
# JWKS 검증 (ES256 / RS256 비대칭키 방식)
# ---------------------------------------------------------------------------

def _fetch_jwks(jwks_url: str) -> Dict[str, Any]:
    """JWKS 엔드포인트에서 공개키 목록을 가져온다 (10분 캐시)."""
    global _jwks_cache, _jwks_cache_time

    now = time.time()
    if _jwks_cache and now - _jwks_cache_time < _JWKS_CACHE_TTL:
        return _jwks_cache

    try:
        import httpx  # runtime import — 선택적 의존성
        resp = httpx.get(jwks_url, timeout=5.0)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        _jwks_cache_time = now
        logger.info("JWKS 캐시 갱신 완료: %s", jwks_url)
        return _jwks_cache
    except Exception as exc:
        logger.error("JWKS 가져오기 실패: %s", exc)
        raise SupabaseTokenError("JWKS 공개키를 가져오는 데 실패했습니다.") from exc


def _verify_jwks(token: str) -> Dict[str, Any]:
    """JWKS 공개키(ES256/RS256)로 JWT를 검증한다."""
    supabase_url = os.environ.get("SUPABASE_URL", "")
    if not supabase_url:
        raise SupabaseTokenError("SUPABASE_URL 환경변수가 설정되지 않았습니다.")

    jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
    jwks = _fetch_jwks(jwks_url)

    # JWT 헤더에서 kid / alg 추출
    try:
        header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise SupabaseTokenError("JWT 헤더 파싱 실패") from exc

    kid: Optional[str] = header.get("kid")
    alg: str = header.get("alg", "RS256")

    # kid 일치하는 키 선택
    matching_key = None
    keys: List[Dict[str, Any]] = jwks.get("keys", [])
    for k in keys:
        if kid is None or k.get("kid") == kid:
            matching_key = k
            break

    if not matching_key:
        raise SupabaseTokenError("JWKS에서 일치하는 공개키를 찾을 수 없습니다.")

    payload = jwt.decode(
        token,
        matching_key,
        algorithms=[alg],
        options={"verify_aud": False},  # aud 검증 완화
    )
    return payload


# ---------------------------------------------------------------------------
# 공개 인터페이스
# ---------------------------------------------------------------------------

def verify_supabase_token(token: str) -> Dict[str, Any]:
    """
    Supabase JWT 토큰을 검증하고 payload를 반환한다.

    검증 순서:
    1. SUPABASE_JWT_SECRET 있으면 → HS256 로컬 검증 (빠름, 네트워크 불필요)
    2. 없으면 → SUPABASE_URL 기반 JWKS 공개키 검증 (ES256/RS256)

    Raises:
        SupabaseTokenError: 토큰이 유효하지 않거나 만료된 경우
    """
    try:
        secret = os.environ.get("SUPABASE_JWT_SECRET", "")

        if secret:
            payload = _verify_hs256(token)
        else:
            payload = _verify_jwks(token)

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


# ---------------------------------------------------------------------------
# Admin 클라이언트
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# 유틸리티
# ---------------------------------------------------------------------------

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
