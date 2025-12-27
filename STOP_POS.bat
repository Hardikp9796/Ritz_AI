@echo off
title POCKETO POS - Shutdown
color 0C

echo.
echo     Stopping POCKETO POS services...
echo.

echo     [1/3] Stopping Frontend...
taskkill /FI "WINDOWTITLE eq POCKETO-Frontend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend*" /F >nul 2>&1
echo     ✓ Frontend stopped

echo.
echo     [2/3] Stopping Backend...
taskkill /FI "WINDOWTITLE eq POCKETO-Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Backend*" /F >nul 2>&1
echo     ✓ Backend stopped

echo.
echo     [3/3] Stopping MongoDB...
taskkill /FI "WINDOWTITLE eq POCKETO-MongoDB*" /F >nul 2>&1
echo     ✓ MongoDB stopped

echo.
echo     ═══════════════════════════════════════════
echo       All POCKETO POS services stopped!
echo     ═══════════════════════════════════════════
echo.
timeout /t 3
