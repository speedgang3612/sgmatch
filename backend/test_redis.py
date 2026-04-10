"""Upstash Redis 연결 테스트 스크립트"""
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()


async def test_redis():
    import redis.asyncio as aioredis

    url = os.environ.get("REDIS_URL", "")
    print(f"[TEST] REDIS_URL: {url[:30]}...")

    try:
        r = aioredis.from_url(url, decode_responses=True)
        pong = await r.ping()
        print(f"[OK] PING → {pong}")

        # SET/GET 확인
        await r.setex("test:sgmatch", 10, "hello")
        val = await r.get("test:sgmatch")
        print(f"[OK] SET/GET → {val}")

        # 정리
        await r.delete("test:sgmatch")
        await r.aclose()
        print("[OK] Redis 연결 성공!")
    except Exception as e:
        print(f"[FAIL] {type(e).__name__}: {e}")


if __name__ == "__main__":
    asyncio.run(test_redis())
