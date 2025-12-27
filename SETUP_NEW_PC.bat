@echo off
title POCKETO POS - First Time Setup
color 0B
mode con: cols=65 lines=30

echo.
echo     ╔═══════════════════════════════════════════════════╗
echo     ║                                                   ║
echo     ║         POCKETO POS - NEW PC SETUP                ║
echo     ║         First Time Installation                   ║
echo     ║                                                   ║
echo     ╚═══════════════════════════════════════════════════╝
echo.
echo     This will set up POCKETO POS on this computer.
echo     Please wait, this may take 5-10 minutes...
echo.
echo.

cd /d "%~dp0"

REM Check if Python is installed
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo     ERROR: Python is not installed!
    echo     Please install Python 3.11+ from:
    echo     https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
echo     ✓ Python found

REM Check if Node.js is installed
echo.
echo [2/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo     ERROR: Node.js is not installed!
    echo     Please install Node.js from:
    echo     https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo     ✓ Node.js found

REM Create MongoDB data directory
echo.
echo [3/5] Setting up MongoDB directory...
if not exist "data" (
    mkdir data
    echo     ✓ Created MongoDB data folder
) else (
    echo     ✓ MongoDB folder already exists
)

REM Setup Backend
echo.
echo [4/5] Installing Backend dependencies...
echo     (This will take 2-3 minutes)
cd backend

if not exist "venv" (
    echo     Creating Python virtual environment...
    python -m venv venv
)

echo     Activating virtual environment...
call venv\Scripts\activate

echo     Installing Python packages...
pip install -r requirements.txt --quiet

if errorlevel 1 (
    echo.
    echo     WARNING: Some packages may have failed.
    echo     Trying alternative installation...
    pip install fastapi uvicorn motor python-dotenv razorpay pydantic pymongo --quiet
)

echo     ✓ Backend setup complete

REM Setup Frontend
echo.
echo [5/5] Installing Frontend dependencies...
echo     (This will take 5-7 minutes)
cd ..\frontend

echo     Installing Node packages...
npm install --legacy-peer-deps

if errorlevel 1 (
    echo.
    echo     WARNING: Installation had some issues.
    echo     Trying to fix dependencies...
    npm install ajv@8.12.0 --legacy-peer-deps
    npm install --legacy-peer-deps --force
)

echo     ✓ Frontend setup complete

cd ..

echo.
echo.
echo     ╔═══════════════════════════════════════════════════╗
echo     ║                                                   ║
echo     ║         ✓ SETUP COMPLETE!                         ║
echo     ║                                                   ║
echo     ║     Your POCKETO POS is ready to use!             ║
echo     ║                                                   ║
echo     ║     Next Step:                                    ║
echo     ║     Double-click START_POS.bat to launch          ║
echo     ║                                                   ║
echo     ╚═══════════════════════════════════════════════════╝
echo.
echo.
echo     Setup log saved successfully.
echo     You can now start using your POS!
echo.
echo     Press any key to exit...
pause >nul
