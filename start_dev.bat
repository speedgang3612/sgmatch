@echo off
chcp 65001 > nul
echo.
echo ========================================
echo   SG Match - 개발 서버 시작
echo ========================================
echo.

:: 백엔드 서버 → 새 창으로 실행
echo [1/2] 백엔드 서버 시작 중... (포트 8000)
start "SG Match Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 --env-file .env"

:: 잠시 대기
timeout /t 3 /nobreak > nul

:: 프론트엔드 서버 → 새 창으로 실행
echo [2/2] 프론트엔드 서버 시작 중... (포트 3000)
start "SG Match Frontend" cmd /k "cd /d "%~dp0frontend" && pnpm dev"

echo.
echo ========================================
echo   서버 시작 완료!
echo.
echo   메인 페이지  : http://localhost:3000
echo   회원가입     : http://localhost:3000/register
echo   요금제       : http://localhost:3000/pricing
echo   라이더       : http://localhost:3000/rider
echo   업체         : http://localhost:3000/agency
echo   관리자       : http://localhost:3000/admin
echo.
echo   API 서버     : http://localhost:8000
echo   API 문서     : http://localhost:8000/docs
echo ========================================
echo.
pause
