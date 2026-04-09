import urllib.request
import sys

# 백엔드 헬스 체크
try:
    r = urllib.request.urlopen('http://localhost:8000/health', timeout=5)
    print("Backend OK:", r.status, r.read().decode())
except Exception as e:
    print("Backend FAIL:", e)

# 백엔드 루트
try:
    r = urllib.request.urlopen('http://localhost:8000/', timeout=5)
    print("Backend root OK:", r.status, r.read().decode())
except Exception as e:
    print("Backend root FAIL:", e)

# 프론트엔드
try:
    r = urllib.request.urlopen('http://localhost:3000', timeout=5)
    print("Frontend OK:", r.status)
except Exception as e:
    print("Frontend FAIL:", e)
