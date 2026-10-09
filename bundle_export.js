const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname);
const destDir = 'C:\\Users\\Swanto\\OneDrive\\Desktop\\AI AGENT';

console.log('Sumber:', srcDir);

// 1. Baca sumber
let html = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf-8');
const css = fs.readFileSync(path.join(srcDir, 'style.css'), 'utf-8');
const js = fs.readFileSync(path.join(srcDir, 'app.js'), 'utf-8');

// 2. Gabungkan CSS
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>');

// 3. Gabungkan JS
html = html.replace('<script src="app.js"></script>', '<script>\n' + js + '\n</script>');

// 4. Tulis file mandiri ARISAN_RUMAH_BOLON.html di folder proyek saat ini
const localStandalonePath = path.join(srcDir, 'ARISAN_RUMAH_BOLON.html');
fs.writeFileSync(localStandalonePath, html, 'utf-8');
console.log('✔ File standalone lokal berhasil dibuat di:', localStandalonePath);

// 5. Tulis file launcher BUKA_ARISAN_RUMAH_BOLON.bat di folder proyek saat ini
const batContent = `@echo off
title ARISAN RUMAH BOLON (36 PESERTA)
echo ====================================================
echo MEMBUKA APLIKASI ARISAN RUMAH BOLON
echo 36 Peserta - 3 Pemenang/Bulan - Kas Rumah Bolon
echo Mode Standalone / IndexedDB Database
echo ====================================================
start "" "%~dp0ARISAN_RUMAH_BOLON.html"
exit
`;

const localBatPath = path.join(srcDir, 'BUKA_ARISAN_RUMAH_BOLON.bat');
fs.writeFileSync(localBatPath, batContent, 'utf-8');
console.log('✔ File launcher lokal BUKA_ARISAN_RUMAH_BOLON.bat berhasil dibuat di:', localBatPath);

// 6. Tulis file launcher JALANKAN_SERVER_RUMAH_BOLON.bat di folder proyek saat ini
const serverBatContent = `@echo off
title SERVER DATABASE ARISAN RUMAH BOLON (Node.js REST API)
color 0B
echo ===================================================================
echo       SERVER DATABASE RESMI: ARISAN RUMAH BOLON
echo       JSON Disk Database + REST API (IndexedDB Sync)
echo ===================================================================
echo.
cd /d "%~dp0"

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
`;

const localServerBatPath = path.join(srcDir, 'JALANKAN_SERVER_RUMAH_BOLON.bat');
fs.writeFileSync(localServerBatPath, serverBatContent, 'utf-8');
console.log('✔ File launcher server berhasil dibuat di:', localServerBatPath);

// 7. Jika folder eksternal destDir ada, sinkronkan juga ke sana
if (fs.existsSync(destDir)) {
  console.log('Menyinkronkan ke folder eksternal:', destDir);
  const standalonePath = path.join(destDir, 'ARISAN_RUMAH_BOLON.html');
  fs.writeFileSync(standalonePath, html, 'utf-8');

  const batPath = path.join(destDir, 'BUKA_ARISAN_RUMAH_BOLON.bat');
  fs.writeFileSync(batPath, batContent, 'utf-8');

  const projectSubDir = path.join(destDir, 'ARISAN RUMAH BOLON');
  if (!fs.existsSync(projectSubDir)) {
    fs.mkdirSync(projectSubDir, { recursive: true });
  }

  fs.copyFileSync(path.join(srcDir, 'index.html'), path.join(projectSubDir, 'index.html'));
  fs.copyFileSync(path.join(srcDir, 'style.css'), path.join(projectSubDir, 'style.css'));
  fs.copyFileSync(path.join(srcDir, 'app.js'), path.join(projectSubDir, 'app.js'));
  fs.copyFileSync(path.join(srcDir, 'server.js'), path.join(projectSubDir, 'server.js'));
  fs.writeFileSync(path.join(projectSubDir, 'ARISAN_RUMAH_BOLON.html'), html, 'utf-8');
  fs.writeFileSync(path.join(projectSubDir, 'BUKA_ARISAN_RUMAH_BOLON.bat'), batContent, 'utf-8');
  fs.writeFileSync(path.join(projectSubDir, 'JALANKAN_SERVER_RUMAH_BOLON.bat'), serverBatContent, 'utf-8');
  fs.writeFileSync(path.join(destDir, 'JALANKAN_SERVER_RUMAH_BOLON.bat'), serverBatContent, 'utf-8');
  console.log('✔ Sinkronisasi ke folder eksternal selesai.');
}
