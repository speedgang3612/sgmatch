"""Redis 클라이언트 싱글톤 — 토큰 블랙리스트용

Upstash Redis에 연결하여 JWT 토큰 해시를 저장/조회한다.
서버 종료 시 close_redis()로 연결을 정리한다.
"""
import logging

import redis.asyncio as aioredis

from core.config import settings

logger = logging.getLogger(__name__)

_redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    """Redis 클라이언트를 반환한다 (lazy init, 싱글톤)."""
    global _redis_client
    if _redis_client is None:
        if not settings.redis_url:
            raise RuntimeError("REDIS_URL 환경변수가 설정되지 않았습니다.")
        _redis_client = aioredis.from_url(
            settings.redis_url,
            decode_responses=True,
        )
        logger.info("Redis 클라이언트 초기화 완료")
    return _redis_client


async def close_redis() -> None:
    """Redis 연결을 종료한다."""
    global _redis_client
    if _redis_client is not None:
        try:
            await _redis_client.aclose()
            logger.info("Redis 연결 종료 완료")
        except Exception as e:
            logger.warning("Redis 연결 종료 실패: %s", e)
        finally:
            _redis_client = None
