@echo off
title Solvant Proof-to-Scale OS Launcher
echo ========================================================
echo   SOLVANT PROOF-TO-SCALE OS -- ENTERPRISE AI ADOPTION
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting FastAPI Backend on 0.0.0.0:8000...
start "Solvant Backend" /min cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Vite Frontend on 0.0.0.0:3000...
start "Solvant Frontend" /min cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Opening Prototype in Default Browser...
start "" "http://localhost:3000/"

echo.
echo ========================================================
echo   Prototype is running and accessible at:
echo   - Localhost: http://localhost:3000/
echo   - Local Network (Wi-Fi): http://10.11.35.133:3000/
echo   - Backend API Docs: http://localhost:8000/docs
echo ========================================================
echo.
pause
