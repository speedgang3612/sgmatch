import os
import pathlib
import subprocess

# PATH에서 git 찾기
result = subprocess.run(["where", "git"], capture_output=True, text=True, shell=True)
if result.stdout.strip():
    print("git in PATH:", result.stdout.strip())
else:
    print("git not in PATH")

# 일반적인 설치 경로 확인
candidates = [
    r"C:\Program Files\Git\cmd\git.exe",
    r"C:\Program Files (x86)\Git\cmd\git.exe",
    r"C:\Users\김범준\AppData\Local\Programs\Git\cmd\git.exe",
]
for p in candidates:
    if pathlib.Path(p).exists():
        print("FOUND:", p)
    else:
        print("NOT FOUND:", p)
