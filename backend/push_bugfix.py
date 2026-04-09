import subprocess

GIT = r"C:\Program Files\Git\cmd\git.exe"
REPO = r"c:\Users\김범준\Desktop\SG Match"

def run(args):
    r = subprocess.run([GIT]+args, cwd=REPO, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.stdout: print(r.stdout.strip())
    if r.stderr: print(r.stderr.strip())
    return r.returncode

run(["add",
     "frontend/src/pages/RiderDashboard.tsx",
     "frontend/src/pages/AgencyDashboard.tsx",
     "frontend/src/App.tsx",
     "frontend/src/pages/RiderSaved.tsx",
     "frontend/src/pages/RiderApplications.tsx",
     "frontend/src/pages/RiderProfile.tsx",
     "frontend/src/pages/RiderSupport.tsx",
     "frontend/src/pages/AgencyAnalytics.tsx",
     "frontend/src/pages/AgencyPromotions.tsx"])
run(["status", "--short"])
code = run(["commit", "-m", "fix: 심각한 버그 5개 수정 (버튼 핸들러, 라우트 등록)"])
if code == 0:
    run(["push", "origin", "main"])
    print("✅ 완료!")
else:
    print("Nothing to commit")
