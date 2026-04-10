"""
Supabase DB 연결 직접 테스트 스크립트
URL 파싱 없이 asyncpg에 각 파라미터를 명시적으로 전달하여
연결 문제의 정확한 원인을 파악합니다.
"""
import asyncio
import asyncpg


async def test_connection():
    host = "aws-1-ap-northeast-2.pooler.supabase.com"
    port = 5432
    user = "postgres.cllkngzimyeezdymnzov"
    password = "BeomJun3612"
    database = "postgres"

    print(f"[TEST] 연결 시도: {user}@{host}:{port}/{database}")

    # 시도 1: ssl=False
    print("\n--- 시도 1: ssl=False ---")
    try:
        conn = await asyncpg.connect(
            host=host, port=port, user=user,
            password=password, database=database, ssl=False,
        )
        print("[OK] ssl=False 연결 성공!")
        version = await conn.fetchval("SELECT version()")
        print(f"[OK] PostgreSQL: {version[:60]}")
        await conn.close()
        return
    except Exception as e:
        print(f"[FAIL] {type(e).__name__}: {e}")

    # 시도 2: ssl='require'
    print("\n--- 시도 2: ssl='require' ---")
    try:
        conn = await asyncpg.connect(
            host=host, port=port, user=user,
            password=password, database=database, ssl='require',
        )
        print("[OK] ssl=require 연결 성공!")
        version = await conn.fetchval("SELECT version()")
        print(f"[OK] PostgreSQL: {version[:60]}")
        await conn.close()
        return
    except Exception as e:
        print(f"[FAIL] {type(e).__name__}: {e}")

    # 시도 3: port 6543 (Session mode), ssl=False
    print("\n--- 시도 3: port 6543, ssl=False ---")
    try:
        conn = await asyncpg.connect(
            host=host, port=6543, user=user,
            password=password, database=database, ssl=False,
        )
        print("[OK] port=6543, ssl=False 연결 성공!")
        version = await conn.fetchval("SELECT version()")
        print(f"[OK] PostgreSQL: {version[:60]}")
        await conn.close()
        return
    except Exception as e:
        print(f"[FAIL] {type(e).__name__}: {e}")

    print("\n[RESULT] 모든 연결 시도 실패. 비밀번호 재확인 필요.")



if __name__ == "__main__":
    asyncio.run(test_connection())
