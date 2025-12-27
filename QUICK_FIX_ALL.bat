@echo off
title POCKETO POS - Quick Fix (20 min)
color 0A
cd /d "%~dp0"

echo ========================================
echo   POCKETO POS - QUICK FIX
echo   This will take 15-20 minutes
echo ========================================
echo.

REM Create .env files
echo [1/6] Creating configuration files...

REM Backend .env
(
echo MONGO_URL=mongodb://localhost:27017
echo DB_NAME=pocketo_pos
echo CORS_ORIGINS=http://localhost:3000
echo RAZORPAY_KEY_ID=
echo RAZORPAY_KEY_SECRET=
) > backend\.env
echo     Backend .env created

REM Frontend .env
echo REACT_APP_BACKEND_URL=http://localhost:8001 > frontend\.env
echo     Frontend .env created

REM Create data folder
echo.
echo [2/6] Creating database folder...
if not exist data mkdir data
echo     Done

REM Fix Backend
echo.
echo [3/6] Fixing backend...
cd backend
if exist venv (
    echo     Backend already set up
) else (
    echo     Setting up backend (2 min)...
    python -m venv venv
    call venv\Scripts\activate
    pip install --quiet fastapi uvicorn motor python-dotenv pydantic pymongo razorpay
)
cd ..

REM Fix Frontend
echo.
echo [4/6] Fixing frontend (10-15 min - please wait)...
cd frontend

echo     Installing critical package...
call npm install @craco/craco --legacy-peer-deps --loglevel error

echo     Installing all packages...
call npm install --legacy-peer-deps --force --loglevel error

cd ..

REM Check MongoDB
echo.
echo [5/6] Checking MongoDB...
mongod --version >nul 2>&1
if errorlevel 1 (
    echo     WARNING: MongoDB not installed!
    echo.
    echo     OPTION 1: Install MongoDB now
    echo     Download: https://www.mongodb.com/try/download/community
    echo     Run installer, then restart this script
    echo.
    echo     OPTION 2: Use FREE Preview Version
    echo     URL: https://pizzastallpos.preview.emergentagent.com
    echo     Works perfectly, no installation needed!
    echo.
    choice /C 12 /M "Press 1 to exit and install MongoDB, or 2 to open Preview URL"
    if errorlevel 2 (
        start https://pizzastallpos.preview.emergentagent.com
        echo.
        echo     Opening FREE preview version in browser...
        echo     Use this while you install MongoDB!
        timeout /t 5
        exit /b 0
    )
    exit /b 1
) else (
    echo     MongoDB found!
)

REM Create simple START script
echo.
echo [6/6] Creating START_POS.bat...
(
echo @echo off
echo cd /d "%%~dp0"
echo if not exist data mkdir data
echo start /min "MongoDB" cmd /k "mongod --dbpath=data"
echo timeout /t 3 /nobreak ^>nul
echo cd backend
echo start "Backend" cmd /k "venv\Scripts\activate && uvicorn server:app --host 0.0.0.0 --port 8001"
echo cd ..\frontend
echo start "Frontend" cmd /k "npm start"
echo timeout /t 15 /nobreak ^>nul
echo start http://localhost:3000
) > START_POS.bat

echo     Created!

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo   Next: Double-click START_POS.bat
echo.
echo   Or use FREE Preview:
echo   https://pizzastallpos.preview.emergentagent.com
echo.
pause
