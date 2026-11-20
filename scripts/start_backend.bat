@echo off
setlocal
cd /d "%~dp0.."
set PYTHONPATH=.
set TEMP=%~dp0..\.tmp
set TMP=%~dp0..\.tmp
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
"%~dp0..\venv\Scripts\python" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
