@echo off
setlocal
echo ========================================================
echo   EduPredict AI - Student Marks Prediction System
echo   Launching Application Services
echo ========================================================

:: Check if virtual environment exists
if not exist "%~dp0venv\Scripts\python.exe" (
    echo [INFO] Virtual environment not found. Running setup first...
    call "%~dp0scripts\setup.bat"
    if %errorlevel% neq 0 (
        echo [ERROR] Setup failed.
        pause
        exit /b 1
    )
)

:: Check if ML model artifacts exist
if not exist "%~dp0backend\artifacts\historical_model.joblib" (
    echo [INFO] ML artifacts missing. Running training pipeline...
    call "%~dp0scripts\train_model.bat"
)

echo Starting Backend Service (FastAPI at http://localhost:8000)...
start "EduPredict AI - Backend API" cmd /k "cd /d "%~dp0" && call "%~dp0scripts\start_backend.bat""

:: Give backend 2 seconds to initialize
timeout /t 2 /nobreak >nul

echo Starting Frontend Service (Vite React at http://localhost:5173)...
start "EduPredict AI - Frontend" cmd /k "cd /d "%~dp0" && call "%~dp0scripts\start_frontend.bat""

echo.
echo ========================================================
echo   EduPredict AI is now running!
echo   Frontend Dashboard: http://localhost:5173
echo   Backend Swagger UI: http://localhost:8000/docs
echo   Health Check:       http://localhost:8000/api/health
echo ========================================================
echo.
echo Keep both terminal windows open while using the system.
echo Press any key to exit this launcher window.
pause >nul
