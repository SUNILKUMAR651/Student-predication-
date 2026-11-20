@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   EduPredict AI — Environment Setup Script (Windows)
echo ========================================================
echo.

:: Set local temporary directories to D: drive
if not exist "%~dp0..\.tmp" mkdir "%~dp0..\.tmp"
if not exist "%~dp0..\.tmp\pip_cache" mkdir "%~dp0..\.tmp\pip_cache"
if not exist "%~dp0..\.tmp\npm_cache" mkdir "%~dp0..\.tmp\npm_cache"

set TEMP=%~dp0..\.tmp
set TMP=%~dp0..\.tmp
set PIP_CACHE_DIR=%~dp0..\.tmp\pip_cache
set npm_config_cache=%~dp0..\.tmp\npm_cache

:: Check Python
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in system PATH.
    echo Please install Python 3.11 from https://www.python.org/
    exit /b 1
)
echo [OK] Python detected.

:: Check Node
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in system PATH.
    echo Please install Node.js (v18+) from https://nodejs.org/
    exit /b 1
)
echo [OK] Node.js detected.

:: Create Python Virtual Environment
if not exist "%~dp0..\venv\Scripts\python.exe" (
    echo [INFO] Creating Python virtual environment in venv...
    python -m venv "%~dp0..\venv"
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to create virtual environment.
        exit /b 1
    )
)
echo [OK] Python virtual environment ready.

:: Install Python Dependencies
echo [INFO] Installing Python backend dependencies...
"%~dp0..\venv\Scripts\pip" install --cache-dir "%~dp0..\.tmp\pip_cache" -r "%~dp0..\backend\requirements.txt"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install Python dependencies.
    exit /b 1
)
echo [OK] Python dependencies installed successfully.

:: Install Frontend Dependencies
echo [INFO] Installing frontend dependencies...
cd /d "%~dp0..\frontend"
call npm install --cache "%~dp0..\.tmp\npm_cache"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend npm dependencies.
    exit /b 1
)
echo [OK] Frontend packages installed successfully.

:: Train ML models if artifacts do not exist
if not exist "%~dp0..\backend\artifacts\historical_model.joblib" (
    echo [INFO] Training initial machine learning models...
    cd /d "%~dp0.."
    "%~dp0..\venv\Scripts\python" -m backend.ml.train
)

:: Build Frontend production dist
echo [INFO] Building frontend production bundle...
cd /d "%~dp0..\frontend"
call node ./node_modules/vite/bin/vite.js build

echo.
echo ========================================================
echo   Setup Completed Successfully!
echo   To launch the application, run: scripts\run.bat or run.bat
echo ========================================================
exit /b 0
