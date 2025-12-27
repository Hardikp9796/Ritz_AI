# 🍕 POCKETO POS - PORTABLE PACKAGE GUIDE

## ✅ WORKS ON ANY WINDOWS PC - PLUG & PLAY!

This package can be copied to any Windows computer and will work with minimal setup.

---

## 📦 WHAT YOU HAVE

This folder contains your complete POCKETO POS that can:
- ✅ Copy to USB drive
- ✅ Copy to another PC
- ✅ Share via network
- ✅ Backup to cloud
- ✅ Works offline & online

---

## 🚀 HOW TO USE ON YOUR CURRENT PC

### First Time Setup (Already Done):
You've already set this up! Just use:

**Double-click: `START_POS.bat`**

That's it! Your POS opens in browser.

---

## 💾 HOW TO USE ON ANOTHER PC (PLUG & PLAY)

### Method 1: USB Drive (Easiest)

**On your CURRENT PC:**
1. Copy entire `POCKETO_POS` folder to USB drive
2. Eject USB safely

**On NEW PC:**
1. Plug in USB drive
2. Copy `POCKETO_POS` folder to Desktop (or anywhere)
3. Open the folder
4. **Double-click: `INSTALL_ANYWHERE.bat`**
5. Wait 10-15 minutes (it installs everything automatically)
6. When done, **Double-click: `START_POS.bat`**
7. Done! POS opens in browser

**Requirements on new PC:**
- Windows 10 or 11
- Internet connection (for first-time setup only)
- 2GB free space
- That's all!

---

### Method 2: Network Share

**Setup:**
1. Put `POCKETO_POS` folder in shared network location
2. On each PC, map network drive
3. Run `INSTALL_ANYWHERE.bat` once per PC
4. Use `START_POS.bat` to start

---

### Method 3: Cloud Sync (Google Drive/Dropbox)

**Setup:**
1. Put `POCKETO_POS` folder in Google Drive
2. Install Google Drive on all PCs
3. Folder syncs automatically
4. Run `INSTALL_ANYWHERE.bat` once per PC
5. Use `START_POS.bat` anytime

---

## 🔧 WHAT EACH FILE DOES

| File | Purpose |
|------|---------|
| `INSTALL_ANYWHERE.bat` | **USE THIS ON NEW PCs** - Installs everything automatically |
| `START_POS.bat` | **DAILY USE** - Starts your POS (double-click this every day) |
| `STOP_POS.bat` | Stops all POS services safely |
| `BACKUP_DATA.bat` | Backs up all your orders and data |
| `backend/` | Python server (your menu, orders, reports) |
| `frontend/` | Website interface (what you see in browser) |
| `data/` | MongoDB database (all your orders stored here) |

---

## ⚡ DAILY USAGE

### Every Day at Your Stall:

1. Turn on computer
2. **Double-click: `START_POS.bat`**
3. Wait 20-30 seconds
4. Browser opens automatically
5. Start taking orders!

### End of Day:

1. **Double-click: `BACKUP_DATA.bat`** (recommended!)
2. **Double-click: `STOP_POS.bat`**
3. Turn off computer

---

## 🌐 OFFLINE vs ONLINE MODE

### Works 100% OFFLINE:
- No internet needed for orders
- All data saves locally
- Printer works directly

### Works ONLINE too:
- Can access from multiple devices if on same WiFi
- Optional: Sync to cloud backup

**Power Cuts?**
- No problem! All data saved instantly
- Just restart when power comes back
- No data loss

---

## 💾 BACKUP YOUR DATA

### Manual Backup:
Double-click `BACKUP_DATA.bat` daily

Saves to: `POCKETO_POS\BACKUPS\[date-time]`

### Auto Backup (Optional):
Windows Task Scheduler can run `BACKUP_DATA.bat` automatically every night.

---

## 🖥️ SYSTEM REQUIREMENTS

### Minimum:
- **OS**: Windows 10/11
- **RAM**: 4GB
- **Storage**: 2GB free
- **Processor**: Any Intel/AMD (last 10 years)

### Recommended:
- **OS**: Windows 11
- **RAM**: 8GB
- **Storage**: 5GB free (for data growth)
- **Processor**: i3/i5 or better
- **UPS**: Recommended for power backup

---

## 📝 FIRST TIME ON NEW PC - DETAILED STEPS

### What `INSTALL_ANYWHERE.bat` Does:

1. **Checks if Python installed** (if not, tells you to install)
2. **Checks if Node.js installed** (if not, tells you to install)
3. **Checks if MongoDB installed** (if not, tells you to install)
4. **Sets up backend** (Python environment, packages)
5. **Sets up frontend** (Node packages)
6. **Creates startup scripts**
7. **Tests everything**
8. **Creates desktop shortcut**

**Total time**: 10-15 minutes

**Internet needed?** Yes, only for first-time setup. After that, works 100% offline.

---

## 🔍 TROUBLESHOOTING

### "Backend not starting"
**Fix:**
```
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### "Frontend not starting"
**Fix:**
```
cd frontend
rmdir /s node_modules
npm install --legacy-peer-deps
```

### "MongoDB not found"
**Fix:** Install MongoDB from: https://www.mongodb.com/try/download/community

### "Port already in use"
**Fix:**
```
taskkill /F /IM node.exe
taskkill /F /IM python.exe
taskkill /F /IM mongod.exe
```
Then run `START_POS.bat` again

---

## 🎯 PORTABLE CHECKLIST

Before copying to new PC, make sure your folder has:

- ✅ `backend/` folder with all files
- ✅ `frontend/` folder with all files
- ✅ `INSTALL_ANYWHERE.bat`
- ✅ `START_POS.bat`
- ✅ `STOP_POS.bat`
- ✅ `BACKUP_DATA.bat`
- ✅ `data/` folder (your orders database)

**Folder size:** ~500MB-1GB (depending on data)

---

## 💰 COST

**One-time Setup Time:** 15-20 minutes
**Monthly Cost:** ₹0 (FREE FOREVER)
**No subscriptions, no hidden fees!**

---

## 📞 QUICK REFERENCE

| Task | Command |
|------|---------|
| First time on new PC | `INSTALL_ANYWHERE.bat` |
| Start POS daily | `START_POS.bat` |
| Stop POS | `STOP_POS.bat` |
| Backup data | `BACKUP_DATA.bat` |
| Access POS | http://localhost:3000 |
| Backend API | http://localhost:8001 |

---

## ✅ SUMMARY

**YOUR POCKETO POS IS:**
- ✅ Portable (copy anywhere)
- ✅ Works offline (no internet needed after setup)
- ✅ Works online (optional)
- ✅ Free forever (₹0 monthly)
- ✅ Easy to backup
- ✅ Easy to restore
- ✅ Works on unlimited PCs
- ✅ Your data stays with you

**PERFECT FOR:**
- Small food stalls
- Power cut areas
- No reliable internet
- Multiple locations
- Budget conscious businesses

---

## 🚀 YOU'RE ALL SET!

Just remember:
1. **Daily**: Double-click `START_POS.bat`
2. **Weekly**: Run `BACKUP_DATA.bat`
3. **New PC**: Run `INSTALL_ANYWHERE.bat` first time only

**Enjoy your POS! 🍕**
