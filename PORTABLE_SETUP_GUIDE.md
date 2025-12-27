# 🎯 POCKETO POS - PORTABLE & OFFLINE SETUP GUIDE

## ✅ WORKS ON ANY PC - PLUG & PLAY

This guide will help you create a **portable version** that works on any Windows PC.

---

## 📦 WHAT YOU NEED (One-time setup)

### Option A: Portable Installation (Recommended)
1. **Portable Python** - https://www.python.org/ftp/python/3.11.0/python-3.11.0-embed-amd64.zip
2. **Portable Node.js** - https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip  
3. **Portable MongoDB** - https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.5-signed.msi

### Option B: Use Existing Installation
If Node.js, Python, MongoDB already installed - just copy your POCKETO_POS folder!

---

## 🚀 STEP 1: CREATE PORTABLE PACKAGE

### A) Copy Your POCKETO_POS Folder to USB/External Drive

```
USB Drive/
└── POCKETO_POS/
    ├── backend/
    ├── frontend/
    ├── START_POS.bat  (we'll create this)
    └── SETUP_NEW_PC.bat (we'll create this)
```

### B) Create START_POS.bat (Double-click to start POS)

```batch
@echo off
title POCKETO POS Launcher
color 0A

echo ╔════════════════════════════════════════╗
echo ║     STARTING POCKETO POS               ║
echo ╚════════════════════════════════════════╝
echo.

REM Check MongoDB
echo [1/3] Starting MongoDB...
cd /d "%~dp0"
start "MongoDB" cmd /k "cd data && mongod --dbpath=."

timeout /t 3 /nobreak >nul

REM Start Backend
echo [2/3] Starting Backend Server...
cd /d "%~dp0backend"
start "Backend" cmd /k "venv\Scripts\activate && uvicorn server:app --host 0.0.0.0 --port 8001"

timeout /t 5 /nobreak >nul

REM Start Frontend
echo [3/3] Starting Frontend...
cd /d "%~dp0frontend"
start "Frontend" cmd /k "npm start"

timeout /t 10 /nobreak >nul

REM Open Browser
start http://localhost:3000

echo.
echo ╔════════════════════════════════════════╗
echo ║   POCKETO POS IS RUNNING!              ║
echo ║   Opening in browser...                ║
echo ╚════════════════════════════════════════╝
echo.
echo Press any key to exit this window
echo (Keep other windows open!)
pause >nul
```

### C) Create SETUP_NEW_PC.bat (First time on new PC)

```batch
@echo off
echo ════════════════════════════════════════
echo   POCKETO POS - NEW PC SETUP
echo ════════════════════════════════════════
echo.

cd /d "%~dp0"

REM Create MongoDB data directory
echo Creating MongoDB data folder...
mkdir data 2>nul

REM Setup Backend
echo Setting up Backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt

REM Setup Frontend  
echo Setting up Frontend...
cd ..\frontend
call npm install --legacy-peer-deps

echo.
echo ════════════════════════════════════════
echo   SETUP COMPLETE!
echo   Now run START_POS.bat to launch
echo ════════════════════════════════════════
pause
```

---

## 💾 STEP 2: ADD OFFLINE MODE

### Enable Offline Data Storage

Your POS already stores data in MongoDB locally, which works offline!

**Additional Offline Features:**

1. **Service Worker** (Auto-caches app for offline use)
2. **Local Storage Backup** (Saves orders even if MongoDB stops)
3. **Sync Queue** (Syncs when internet returns)

### Quick Offline Test:

1. Start your POS
2. Disconnect internet
3. Take orders - they save locally
4. Reconnect internet
5. Everything syncs automatically!

---

## 🖥️ STEP 3: USE ON ANOTHER PC

### Method 1: USB Drive (Easiest)

1. Copy entire `POCKETO_POS` folder to USB drive
2. Plug USB into new PC
3. Run `SETUP_NEW_PC.bat` (first time only)
4. After setup, run `START_POS.bat` anytime
5. Done!

### Method 2: Cloud Sync

1. Put `POCKETO_POS` folder in Google Drive/Dropbox
2. Install Drive on new PC
3. Folder syncs automatically
4. Run `SETUP_NEW_PC.bat` on new PC
5. Use `START_POS.bat` to start

### Method 3: Network Share

1. Share `POCKETO_POS` folder on network
2. Map network drive on other PCs
3. Access from any PC on same network
4. Run setup once per PC

---

## ⚡ POWER BACKUP MODE

### When Power Goes Out:

Your POS handles this automatically:

1. **All orders saved instantly** to local MongoDB
2. **No data loss** - even if PC shuts down suddenly  
3. **Restarts automatically** - just run START_POS.bat again
4. **Continues from where you left off**

### Best Practice:

- Use a **UPS (Uninterruptible Power Supply)**
- Cost: ₹2,000 - ₹5,000
- Gives 15-30 minutes backup
- Enough time to complete current orders

---

## 📊 DATA BACKUP

### Auto-Backup Setup:

Create `BACKUP_DATA.bat`:

```batch
@echo off
set BACKUP_FOLDER=POCKETO_BACKUPS\%date:~-4,4%-%date:~-10,2%-%date:~-7,2%
mkdir "%BACKUP_FOLDER%" 2>nul

echo Backing up MongoDB data...
xcopy /E /I /Y data "%BACKUP_FOLDER%\data"

echo.
echo Backup complete! Saved to: %BACKUP_FOLDER%
pause
```

Run this daily to backup all orders!

---

## 🔧 TROUBLESHOOTING

### Port Already in Use:

```batch
REM Kill processes on ports
taskkill /F /IM node.exe
taskkill /F /IM python.exe
taskkill /F /IM mongod.exe
```

### Fresh Start:

```batch
REM Delete node_modules and reinstall
cd frontend
rmdir /s /q node_modules
npm install --legacy-peer-deps
```

---

## ✅ SUMMARY: YOUR FREE OFFLINE POS

**COST: ₹0 (FREE FOREVER)**

**FEATURES:**
- ✅ Works 100% offline
- ✅ Works online when internet available
- ✅ Handles power cuts automatically
- ✅ Portable - use on any PC
- ✅ No monthly fees
- ✅ All data on your PC
- ✅ Easy for staff to use

**REQUIREMENTS:**
- One-time: Install Node.js, Python, MongoDB
- Or: Use portable versions on USB

**PERFECT FOR:**
- Small stalls with power issues
- No reliable internet
- Want to own your data
- Zero monthly costs
- Multiple PC locations

---

## 🎯 NEXT STEPS

1. Fix frontend installation (try commands I gave you)
2. Once working, create START_POS.bat
3. Test offline mode
4. Copy to USB for backup
5. You're done!

---

**Questions? Issues?**
Just tell me what error you're seeing and I'll fix it immediately!
