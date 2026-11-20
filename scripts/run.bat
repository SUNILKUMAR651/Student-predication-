@echo off
setlocal

echo ========================================================
echo   EduPredict AI — Application Launcher
echo ========================================================
echo.

set TEMP=%~dp0..\.tmp
set TMP=%~dp0..\.tmp

:: Check if trained artifacts exist
if not exist "%~dp0..\backend\artifacts\historical_model.joblib" (
    echo [WARNING] Model artifacts not found. Training models first...
    call "%~dp0train_model.bat"
)

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "EduPredict AI - FastAPI Backend" cmd /k "cd /d %~dp0.. && set PYTHONPATH=. && .\venv\Scripts\python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting React Frontend on http://localhost:5173 ...
start "EduPredict AI - Vite Frontend" cmd /k "cd /d %~dp0..\frontend && node ./node_modules/vite/bin/vite.js --port 5173"

echo.
echo ========================================================
echo   EduPredict AI is running!
echo   Frontend Web Dashboard: http://localhost:5173
echo   Production Full-Stack:  http://127.0.0.1:8000
echo   API Interactive Docs:   http://127.0.0.1:8000/docs
echo ========================================================
echo Press any key to stop this launcher window (services will stay running in their windows).
pause >nul
