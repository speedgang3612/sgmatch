import os
import subprocess
import sys

GIT = r"C:\Program Files\Git\cmd\git.exe"
REPO_DIR = r"c:\Users\김범준\Desktop\SG Match"

def run(args, cwd=None):
    cmd = [GIT] + args if args[0] != "system" else args[1:]
    result = subprocess.run(
        cmd,
        cwd=cwd or REPO_DIR,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    if result.stdout:
        print(result.stdout.strip())
    if result.stderr:
        print(result.stderr.strip())
    return result.returncode

print("=== Step 1: git 버전 확인 ===")
run(["--version"])

print("\n=== Step 2: git 사용자 설정 (없으면 설정) ===")
run(["config", "--global", "user.name", "김범준"])
run(["config", "--global", "user.email", "admin@sgmatch.co.kr"])
run(["config", "--global", "core.autocrlf", "true"])

print("\n=== Step 3: git init ===")
run(["init", "-b", "main"])

print("\n=== Step 4: .gitignore 확인 ===")
# .gitignore가 있으면 OK
gitignore_path = os.path.join(REPO_DIR, ".gitignore")
print(f".gitignore exists: {os.path.exists(gitignore_path)}")

print("\n=== Step 5: git add ===")
run(["add", "."])

print("\n=== Step 6: 스테이징 상태 확인 ===")
run(["status", "--short"])

print("\n=== Step 7: 첫 커밋 ===")
run(["commit", "-m", "feat: initial commit - SG Match platform"])

print("\n=== 완료! 이제 GitHub에 push할 준비가 되었습니다 ===")
