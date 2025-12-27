@echo off
title POCKETO POS - Starting...
color 0A
mode con: cols=60 lines=20

echo.
echo     ╔════════════════════════════════════════════╗
echo     ║                                            ║
echo     ║         POCKETO POS LAUNCHER               ║
echo     ║         Pizza Stall Management             ║
echo     ║                                            ║
echo     ╚════════════════════════════════════════════╝
echo.
echo.

cd /d "%~dp0"

echo [1/4] Checking MongoDB...
sc query MongoDB | find "RUNNING" >nul 2>&1
if errorlevel 1 (
    echo     Starting MongoDB service...
    net start MongoDB >nul 2>&1
    if errorlevel 1 (
        echo     MongoDB not installed as service.
        echo     Starting MongoDB manually...
        if not exist "data" mkdir data
        start "POCKETO-MongoDB" /min cmd /c "mongod --dbpath=data --port 27017"
        timeout /t 3 /nobreak >nul
    )
) else (
    echo     ✓ MongoDB already running
)

echo.
echo [2/4] Starting Backend Server...
cd backend
if not exist "venv" (
    echo     ERROR: Virtual environment not found!
    echo     Please run SETUP_NEW_PC.bat first
    pause
    exit /b 1
)

start "POCKETO-Backend" cmd /k "title POCKETO Backend && venv\Scripts\activate && uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
echo     ✓ Backend starting on port 8001...

timeout /t 5 /nobreak >nul

echo.
echo [3/4] Starting Frontend...
cd ..
cd frontend

if not exist "node_modules" (
    echo     ERROR: Node modules not found!
    echo     Please run SETUP_NEW_PC.bat first
    pause
    exit /b 1
)

start "POCKETO-Frontend" cmd /k "title POCKETO Frontend && npm start"
echo     ✓ Frontend starting on port 3000...

echo.
echo [4/4] Opening browser...
timeout /t 10 /nobreak >nul
start http://localhost:3000

echo.
echo     ╔════════════════════════════════════════════╗
echo     ║                                            ║
echo     ║     ✓ POCKETO POS IS NOW RUNNING!          ║
echo     ║                                            ║
echo     ║     Browser will open automatically        ║
echo     ║     URL: http://localhost:3000             ║
echo     ║                                            ║
echo     ║     Keep this window MINIMIZED             ║
echo     ║     (Don't close it!)                      ║
echo     ║                                            ║
echo     ╚════════════════════════════════════════════╝
echo.
echo.
echo     Press any key to exit this launcher window...
echo     (Backend and Frontend will keep running)
echo.
pause >nul
