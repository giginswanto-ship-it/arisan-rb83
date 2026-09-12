@echo off
title SERVER DATABASE ARISAN RUMAH BOLON (Node.js REST API)
color 0B
echo ===================================================================
echo       SERVER DATABASE RESMI: ARISAN RUMAH BOLON
echo       JSON Disk Database + REST API (IndexedDB Sync)
echo ===================================================================
echo.
cd /d "%~dp0"
if not exist server.js (
    if exist "ARISAN RUMAH BOLON\server.js" (
        cd /d "%~dp0\ARISAN RUMAH BOLON"
    )
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [PERINGATAN] Node.js belum terpasang atau tidak ada di PATH.
    echo Anda tetap dapat menggunakan database IndexedDB offline:
    echo Silakan buka file 'ARISAN_RUMAH_BOLON.html' langsung di browser!
    echo.
    pause
    exit /b
)

echo [INFO] Membuka browser ke http://localhost:3000 ...
start "" http://localhost:3000
echo.
echo ===================================================================
echo  Server Database Aktif di Port 3000!
echo  Penyimpanan: database/arisan_db.json
echo  Untuk menghentikan server, tekan CTRL + C pada jendela ini.
echo ===================================================================
echo.
node server.js
pause
