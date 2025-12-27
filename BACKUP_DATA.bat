@echo off
title POCKETO POS - Data Backup
color 0E

echo.
echo     ╔═══════════════════════════════════════════╗
echo     ║     POCKETO POS - DATA BACKUP             ║
echo     ╚═══════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM Create backup folder with date
set BACKUP_ROOT=BACKUPS
set BACKUP_DATE=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%
set BACKUP_DATE=%BACKUP_DATE: =0%
set BACKUP_FOLDER=%BACKUP_ROOT%\%BACKUP_DATE%

echo     Creating backup folder...
mkdir "%BACKUP_FOLDER%" 2>nul

echo     Backing up MongoDB data...
if exist "data" (
    xcopy /E /I /Y /Q data "%BACKUP_FOLDER%\data" >nul
    echo     ✓ Database backed up
) else (
    echo     ! No data folder found
)

echo     Backing up configuration files...
if exist "backend\.env" copy /Y backend\.env "%BACKUP_FOLDER%\backend.env" >nul
if exist "frontend\.env" copy /Y frontend\.env "%BACKUP_FOLDER%\frontend.env" >nul
echo     ✓ Config files backed up

echo.
echo     ═══════════════════════════════════════════
echo       Backup Complete!
echo       Location: %BACKUP_FOLDER%
echo     ═══════════════════════════════════════════
echo.
echo     Press any key to open backup folder...
pause >nul
start "" "%BACKUP_FOLDER%"
