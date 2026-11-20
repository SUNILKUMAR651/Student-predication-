@echo off
setlocal

echo ========================================================
echo   EduPredict AI — Train Machine Learning Models
echo ========================================================
echo.

set TEMP=%~dp0..\.tmp
set TMP=%~dp0..\.tmp

cd /d "%~dp0.."
set PYTHONPATH=.
"%~dp0..\venv\Scripts\python" -m backend.ml.train

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Training pipeline completed!
    echo Artifacts saved in backend\artifacts\
) else (
    echo.
    echo [ERROR] Training pipeline failed with exit code %ERRORLEVEL%.
)
