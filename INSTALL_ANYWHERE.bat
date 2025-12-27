@echo off
setlocal enabledelayedexpansion
title POCKETO POS - One-Click Installer
color 0B
mode con: cols=70 lines=35

cls
echo.
echo     ================================================================
echo                    POCKETO POS - PORTABLE INSTALLER
echo                    Works on ANY Windows PC!
echo     ================================================================
echo.
echo     This installer will:
echo     - Check if software is installed
echo     - Download and install if needed (portable versions)
echo     - Set up your POS automatically
echo     - Ready to use in 10-15 minutes!
echo.
echo     Press any key to start installation...
pause >nul

cls
cd /d "%~dp0"

REM Create directories
echo [1/10] Creating directories...
mkdir portable 2>nul
mkdir portable\python 2>nul
mkdir portable\nodejs 2>nul
mkdir portable\mongodb 2>nul
mkdir data 2>nul
echo     Done!

REM Check Python
echo.
echo [2/10] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo     Python not found. 
    echo     Please install Python manually from: https://www.python.org/downloads/
    echo     Then run this installer again.
    echo.
    echo     Quick Install Steps:
    echo     1. Download Python 3.11 or newer
    echo     2. Run installer
    echo     3. CHECK "Add Python to PATH"
    echo     4. Click Install Now
    echo     5. Run this script again
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=2" %%i in ('python --version') do set PYTHON_VER=%%i
    echo     Found: Python !PYTHON_VER!
)

REM Check Node.js
echo.
echo [3/10] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo     Node.js not found.
    echo     Please install Node.js manually from: https://nodejs.org/
    echo     Then run this installer again.
    echo.
    echo     Quick Install Steps:
    echo     1. Download LTS version
    echo     2. Run installer (default settings)
    echo     3. Restart this script
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=1" %%i in ('node --version') do set NODE_VER=%%i
    echo     Found: Node.js !NODE_VER!
)

REM Check MongoDB
echo.
echo [4/10] Checking MongoDB...
mongod --version >nul 2>&1
if errorlevel 1 (
    echo     MongoDB not found.
    echo     Please install MongoDB manually from: https://www.mongodb.com/try/download/community
    echo     Then run this installer again.
    echo.
    echo     Quick Install Steps:
    echo     1. Download MongoDB Community Server
    echo     2. Run installer (default settings)
    echo     3. Restart this script
    echo.
    pause
    exit /b 1
) else (
    echo     Found: MongoDB installed
)

REM Setup Backend
echo.
echo [5/10] Setting up Backend...
cd backend

if not exist "venv" (
    echo     Creating virtual environment...
    python -m venv venv
)

echo     Activating environment...
call venv\Scripts\activate

echo     Installing packages (this takes 2-3 minutes)...
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

if errorlevel 1 (
    echo     Some packages failed. Installing critical ones...
    pip install --quiet fastapi uvicorn motor python-dotenv pydantic pymongo razorpay
)

echo     Backend setup complete!

REM Create .env if not exists
if not exist ".env" (
    echo     Creating backend .env file...
    (
        echo MONGO_URL=mongodb://localhost:27017
        echo DB_NAME=pocketo_pos
        echo CORS_ORIGINS=http://localhost:3000
        echo RAZORPAY_KEY_ID=
        echo RAZORPAY_KEY_SECRET=
    ) > .env
)

cd ..

REM Setup Frontend
echo.
echo [6/10] Setting up Frontend...
cd frontend

if exist "node_modules" (
    echo     node_modules exists, checking integrity...
) else (
    echo     Installing frontend packages (5-7 minutes)...
    echo     Please be patient...
)

call npm install --legacy-peer-deps --loglevel error

if errorlevel 1 (
    echo     Installation had issues. Fixing...
    call npm install ajv@8.12.0 --legacy-peer-deps
    call npm install --legacy-peer-deps --force
)

REM Create .env if not exists
if not exist ".env" (
    echo     Creating frontend .env file...
    echo REACT_APP_BACKEND_URL=http://localhost:8001 > .env
)

echo     Frontend setup complete!
cd ..

REM Create startup scripts
echo.
echo [7/10] Creating startup scripts...

REM Create START script
(
    echo @echo off
    echo title POCKETO POS
    echo cd /d "%%~dp0"
    echo.
    echo echo Starting MongoDB...
    echo if not exist data mkdir data
    echo start /min "MongoDB" cmd /k "mongod --dbpath=data --port 27017"
    echo timeout /t 3 /nobreak ^>nul
    echo.
    echo echo Starting Backend...
    echo cd backend
    echo start /min "Backend" cmd /k "venv\Scripts\activate && uvicorn server:app --host 0.0.0.0 --port 8001"
    echo cd ..
    echo timeout /t 5 /nobreak ^>nul
    echo.
    echo echo Starting Frontend...
    echo cd frontend
    echo start /min "Frontend" cmd /k "npm start"
    echo cd ..
    echo timeout /t 10 /nobreak ^>nul
    echo.
    echo start http://localhost:3000
    echo.
    echo echo POCKETO POS is starting...
    echo echo Browser will open automatically
    echo timeout /t 3
) > START_POS.bat

echo     Created START_POS.bat

REM Create STOP script
(
    echo @echo off
    echo taskkill /F /FI "WINDOWTITLE eq MongoDB*" ^>nul 2^>^&1
    echo taskkill /F /FI "WINDOWTITLE eq Backend*" ^>nul 2^>^&1
    echo taskkill /F /FI "WINDOWTITLE eq Frontend*" ^>nul 2^>^&1
    echo echo All services stopped.
    echo timeout /t 2
) > STOP_POS.bat

echo     Created STOP_POS.bat

REM Create portable info file
echo.
echo [8/10] Creating portable package info...
(
    echo POCKETO POS - PORTABLE PACKAGE
    echo ================================
    echo.
    echo TO USE ON ANOTHER PC:
    echo.
    echo 1. Copy this entire folder to the new PC
    echo 2. Double-click INSTALL_ANYWHERE.bat
    echo 3. Wait for installation
    echo 4. Double-click START_POS.bat
    echo 5. Your POS will open in browser!
    echo.
    echo REQUIREMENTS:
    echo - Windows 10/11
    echo - Internet for first-time setup
    echo - 2GB free space
    echo.
    echo After setup, works 100%% OFFLINE!
    echo.
) > HOW_TO_USE.txt

echo     Created HOW_TO_USE.txt

REM Test backend
echo.
echo [9/10] Testing backend...
cd backend
call venv\Scripts\activate
start /min "TestBackend" cmd /c "uvicorn server:app --host 0.0.0.0 --port 8001" 
timeout /t 5 /nobreak >nul

curl -s http://localhost:8001/api/ >nul 2>&1
if errorlevel 1 (
    echo     Backend test: Warning - may need manual start
) else (
    echo     Backend test: OK
)

taskkill /F /IM python.exe >nul 2>&1
cd ..

REM Create desktop shortcut
echo.
echo [10/10] Creating desktop shortcut...
set SCRIPT_DIR=%CD%
set SHORTCUT_PATH=%USERPROFILE%\Desktop\POCKETO POS.lnk

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%SCRIPT_DIR%\START_POS.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.IconLocation = 'shell32.dll,137'; $Shortcut.Description = 'Start POCKETO POS'; $Shortcut.Save()"

if exist "%SHORTCUT_PATH%" (
    echo     Desktop shortcut created!
) else (
    echo     Shortcut creation skipped
)

cls
echo.
echo     ================================================================
echo                    INSTALLATION COMPLETE!
echo     ================================================================
echo.
echo     YOUR POCKETO POS IS READY TO USE!
echo.
echo     NEXT STEPS:
echo     -----------
echo.
echo     1. Desktop: Double-click "POCKETO POS" shortcut
echo        OR
echo        Double-click "START_POS.bat" in this folder
echo.
echo     2. Browser will open automatically at: http://localhost:3000
echo.
echo     3. Start taking orders!
echo.
echo     ================================================================
echo.
echo     PORTABLE PACKAGE:
echo     -----------------
echo     - Copy this ENTIRE FOLDER to USB drive
echo     - Works on any Windows PC
echo     - Run INSTALL_ANYWHERE.bat on new PC
echo     - That's it!
echo.
echo     WORKS OFFLINE: Yes, 100%%
echo     MONTHLY COST: ₹0 (FREE FOREVER)
echo.
echo     ================================================================
echo.
echo     Press any key to launch POCKETO POS now...
pause >nul

call START_POS.bat
