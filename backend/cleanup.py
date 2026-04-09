import subprocess
import os

GIT = r"C:\Program Files\Git\cmd\git.exe"
REPO = r"c:\Users\김범준\Desktop\SG Match"

# 임시 스크립트 파일들 삭제
temp_files = [
    r"c:\Users\김범준\Desktop\SG Match\backend\find_git.py",
    r"c:\Users\김범준\Desktop\SG Match\backend\git_setup.py",
    r"c:\Users\김범준\Desktop\SG Match\backend\github_push.py",
    r"c:\Users\김범준\Desktop\SG Match\backend\git_push_delete.py",
]

for f in temp_files:
    if os.path.exists(f):
        os.remove(f)
        print(f"Deleted: {os.path.basename(f)}")

# git add + commit + push
def run(args):
    r = subprocess.run(
        [GIT] + args, cwd=REPO,
        capture_output=True, text=True, encoding="utf-8", errors="replace"
    )
    if r.stdout: print(r.stdout.strip())
    if r.stderr: print(r.stderr.strip())
    return r.returncode

run(["add", "-A"])
run(["status", "--short"])
code = run(["commit", "-m", "chore: clean up temporary dev scripts"])
if code == 0:
    run(["push", "origin", "main"])
    print("Done! Temp files cleaned and pushed.")
else:
    print("Nothing to commit, already clean.")
