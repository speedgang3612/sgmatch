"""
OpenRouter AI API connection test (local only, NOT pushed to GitHub)
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("APP_AI_BASE_URL", "")
API_KEY = os.getenv("APP_AI_KEY", "")

print("=" * 60)
print("  OpenRouter AI API Connection Test")
print("=" * 60)

missing = []
if not BASE_URL:
    missing.append("APP_AI_BASE_URL")
if not API_KEY:
    missing.append("APP_AI_KEY")

if missing:
    print(f"[FAIL] Missing env vars: {', '.join(missing)}")
    sys.exit(1)

print(f"  Base URL : {BASE_URL}")
print(f"  API Key  : {API_KEY[:16]}{'*' * (len(API_KEY) - 16)}")
print()

try:
    from openai import OpenAI
    client = OpenAI(api_key=API_KEY, base_url=BASE_URL.rstrip("/"))
    print("[OK] OpenAI client (OpenRouter) created successfully")
except Exception as e:
    print(f"[FAIL] Client creation failed: {e}")
    sys.exit(1)

# Test: short chat completion with cheapest model
print("[INFO] Calling deepseek/deepseek-chat (non-streaming)...")
try:
    response = client.chat.completions.create(
        model="deepseek/deepseek-chat",
        messages=[
            {"role": "user", "content": "Say 'OpenRouter OK' in exactly 3 words."}
        ],
        max_tokens=20,
        temperature=0,
    )
    content = response.choices[0].message.content or ""
    model_used = response.model
    print(f"[OK] Response received")
    print(f"     Model : {model_used}")
    print(f"     Reply : {content.strip()}")
    if response.usage:
        print(f"     Tokens: {response.usage.total_tokens} total")
except Exception as e:
    print(f"[FAIL] API call failed: {e}")
    sys.exit(1)

print()
print("=" * 60)
print("  [SUCCESS] OpenRouter API connection test complete")
print("=" * 60)
