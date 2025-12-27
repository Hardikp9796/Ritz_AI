@echo off
title POCKETO POS - Setup for New PC
color 0B
echo ========================================
echo   POCKETO POS - NEW PC SETUP
echo ========================================
echo.
echo This will set up your POS on this computer.
echo First time setup takes 15-20 minutes.
echo.
pause

cd /d "%~dp0"

REM Check Python
echo.
echo [1/4] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not installed!
    echo.
    echo Download from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation!
    echo.
    pause
    exit /b 1
)
echo Python OK!

REM Check Node.js
echo.
echo [2/4] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed!
    echo.
    echo Download from: https://nodejs.org/
    echo Install and restart this script.
    echo.
    pause
    exit /b 1
)
echo Node.js OK!

REM Setup Backend
echo.
echo [3/4] Setting up Backend (3 minutes)...
cd backend

if not exist venv (
    echo Creating Python environment...
    python -m venv venv
)

echo Installing packages...
call venv\Scripts\activate
pip install --quiet fastapi uvicorn motor python-dotenv pydantic pymongo razorpay

if not exist .env (
    (
        echo MONGO_URL=mongodb://localhost:27017
        echo DB_NAME=pocketo_pos
        echo CORS_ORIGINS=http://localhost:3000
        echo RAZORPAY_KEY_ID=
        echo RAZORPAY_KEY_SECRET=
    ) > .env
)

cd ..
echo Backend setup complete!

REM Setup Frontend
echo.
echo [4/4] Setting up Frontend (15 minutes)...
cd frontend

echo Installing packages (this takes time, please wait)...
call npm install --legacy-peer-deps --loglevel error

if not exist .env (
    echo REACT_APP_BACKEND_URL=http://localhost:8001 > .env
)

cd ..
echo Frontend setup complete!

REM Create data folder
if not exist data mkdir data

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Your POS is ready on this PC!
echo.
echo Next: Double-click FINAL_START.bat to launch
echo.
pause
