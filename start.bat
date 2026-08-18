@echo off
title CareerSync Launcher
echo ========================================================
echo               CareerSync Application Launcher
echo ========================================================
echo.

echo Starting Backend API Server (FastAPI)...
start "CareerSync Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend Web App (Next.js)...
start "CareerSync Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo Both servers are launching in separate windows!
echo.
echo   Frontend App : http://localhost:3000
echo   Backend API  : http://127.0.0.1:8000
echo   API Docs     : http://127.0.0.1:8000/docs
echo.
echo Demo Accounts:
echo   Candidate : candidate@example.com  / password123
echo   Recruiter : recruiter@example.com  / password123
echo ========================================================
echo.
pause
