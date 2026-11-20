@echo off
setlocal
cd /d "%~dp0..\frontend"
set TEMP=%~dp0..\.tmp
set TMP=%~dp0..\.tmp
echo Starting React Vite Frontend on http://localhost:5173 ...
node ./node_modules/vite/bin/vite.js --port 5173
