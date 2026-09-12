const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname);
const destDir = 'C:\\Users\\Swanto\\OneDrive\\Desktop\\AI AGENT';

console.log('Sumber:', srcDir);
console.log('Tujuan:', destDir);

// 1. Baca sumber
let html = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf-8');
const css = fs.readFileSync(path.join(srcDir, 'style.css'), 'utf-8');
const js = fs.readFileSync(path.join(srcDir, 'app.js'), 'utf-8');

// 2. Gabungkan CSS
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>');

// 3. Gabungkan JS
html = html.replace('<script src="app.js"></script>', '<script>\n' + js + '\n</script>');

// 4. Tulis file mandiri ARISAN_RUMAH_BOLON.html di Desktop utama
const standalonePath = path.join(destDir, 'ARISAN_RUMAH_BOLON.html');
fs.writeFileSync(standalonePath, html, 'utf-8');
console.log('✔ File standalone berhasil dibuat di:', standalonePath);

// 5. Tulis file launcher BUKA_ARISAN_RUMAH_BOLON.bat di Desktop utama
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

const batPath = path.join(destDir, 'BUKA_ARISAN_RUMAH_BOLON.bat');
fs.writeFileSync(batPath, batContent, 'utf-8');
console.log('✔ File launcher BUKA_ARISAN_RUMAH_BOLON.bat berhasil dibuat di:', batPath);

// 6. Sinkronkan ke subfolder proyek 'ARISAN RUMAH BOLON'
const projectSubDir = path.join(destDir, 'ARISAN RUMAH BOLON');
if (!fs.existsSync(projectSubDir)) {
  fs.mkdirSync(projectSubDir, { recursive: true });
}

// Salin file utama
fs.copyFileSync(path.join(srcDir, 'index.html'), path.join(projectSubDir, 'index.html'));
fs.copyFileSync(path.join(srcDir, 'style.css'), path.join(projectSubDir, 'style.css'));
fs.copyFileSync(path.join(srcDir, 'app.js'), path.join(projectSubDir, 'app.js'));
fs.copyFileSync(path.join(srcDir, 'server.js'), path.join(projectSubDir, 'server.js'));
fs.writeFileSync(path.join(projectSubDir, 'ARISAN_RUMAH_BOLON.html'), html, 'utf-8');
fs.writeFileSync(path.join(projectSubDir, 'BUKA_ARISAN_RUMAH_BOLON.bat'), batContent, 'utf-8');

// Salin dan generate folder database
const dbDir = path.join(projectSubDir, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbJsonSrc = path.join(srcDir, 'database', 'arisan_db.json');
if (fs.existsSync(dbJsonSrc)) {
  fs.copyFileSync(dbJsonSrc, path.join(dbDir, 'arisan_db.json'));
}

// Buat juga file SQL awal jika belum ada
const sqlDumpContent = `-- ========================================================
-- DATABASE SCHEMA & DUMP: ARISAN RUMAH BOLON
-- 36 Peserta, 12 Periode, 3 Pemenang/Bulan, Kas Rp 600.000/bln
-- Format: Standar SQL (MySQL / SQLite / PostgreSQL)
-- ========================================================

CREATE TABLE IF NOT EXISTS tb_peserta (
  id INTEGER PRIMARY KEY,
  nama TEXT NOT NULL,
  phone TEXT,
  won_period INTEGER,
  won_slot INTEGER,
  won_date TEXT
);

CREATE TABLE IF NOT EXISTS tb_iuran (
  periode INTEGER NOT NULL,
  peserta_id INTEGER NOT NULL,
  lunas INTEGER NOT NULL DEFAULT 0,
  waktu_bayar TEXT,
  PRIMARY KEY (periode, peserta_id)
);

CREATE TABLE IF NOT EXISTS tb_kas (
  id TEXT PRIMARY KEY,
  tanggal TEXT NOT NULL,
  tipe TEXT NOT NULL,
  nominal INTEGER NOT NULL,
  keterangan TEXT,
  saldo_setelah INTEGER
);

CREATE TABLE IF NOT EXISTS tb_riwayat_periode (
  periode INTEGER PRIMARY KEY,
  tanggal TEXT,
  kas_amount INTEGER,
  is_finalized INTEGER
);

-- Inisialisasi 36 Data Peserta Rumah Bolon
INSERT INTO tb_peserta (id, nama, phone, won_period, won_slot, won_date) VALUES
(1, '01. Bertha Purba', '', NULL, NULL, NULL),
(2, '02. Dologman Purba', '', NULL, NULL, NULL),
(3, '03. Herman Sipayung', '', NULL, NULL, NULL),
(4, '04. Henri Jupliaman', '', NULL, NULL, NULL),
(5, '05. Jansen Purba', '', NULL, NULL, NULL),
(6, '06. Jaspin Purba', '', NULL, NULL, NULL),
(7, '07. Jasmer Saragih', '', NULL, NULL, NULL),
(8, '08. Juliaman Purba', '', NULL, NULL, NULL),
(9, '09. Jhon Very Purba', '', NULL, NULL, NULL),
(10, '10. Jhon Royen Purba', '', NULL, NULL, NULL),
(11, '11. Jonriswan Purba', '', NULL, NULL, NULL),
(12, '12. Jonter Purba', '', NULL, NULL, NULL),
(13, '13. Justin Purba', '', NULL, NULL, NULL),
(14, '14. Kasiman Purba', '', NULL, NULL, NULL),
(15, '15. Kasmin Saragih', '', NULL, NULL, NULL),
(16, '16. Lasron Saragih', '', NULL, NULL, NULL),
(17, '17. M. Harianja', '', NULL, NULL, NULL),
(18, '18. Marden Saragih', '', NULL, NULL, NULL),
(19, '19. Nalom Purba', '', NULL, NULL, NULL),
(20, '20. Natan Purba', '', NULL, NULL, NULL),
(21, '21. Nellawaty', '', NULL, NULL, NULL),
(22, '22. Rohmaulina', '', NULL, NULL, NULL),
(23, '23. Romasni Saragih', '', NULL, NULL, NULL),
(24, '24. Robensius', '', NULL, NULL, NULL),
(25, '25. Robert Napitu', '', NULL, NULL, NULL),
(26, '26. Rosenta Damanik', '', NULL, NULL, NULL),
(27, '27. Rosita Saragih', '', NULL, NULL, NULL),
(28, '28. Sahat Simarmata', '', NULL, NULL, NULL),
(29, '29. Sanni Rista', '', NULL, NULL, NULL),
(30, '30. Sunim Saragih', '', NULL, NULL, NULL),
(31, '31. Sarpiani Damanik', '', NULL, NULL, NULL),
(32, '32. Swanto #1', '', NULL, NULL, NULL),
(33, '33. Swanto #2', '', NULL, NULL, NULL),
(34, '34. Timoraya', '', NULL, NULL, NULL),
(35, '35. Torando Purba', '', NULL, NULL, NULL),
(36, '36. Peserta 36', '', NULL, NULL, NULL);
`;
fs.writeFileSync(path.join(srcDir, 'database', 'arisan_database.sql'), sqlDumpContent, 'utf-8');
fs.writeFileSync(path.join(dbDir, 'arisan_database.sql'), sqlDumpContent, 'utf-8');

// Buat file launcher server di subfolder dan root Desktop
const serverBatContent = `@echo off
title SERVER DATABASE ARISAN RUMAH BOLON (Node.js REST API)
color 0B
echo ===================================================================
echo       SERVER DATABASE RESMI: ARISAN RUMAH BOLON
echo       JSON Disk Database + REST API (IndexedDB Sync)
echo ===================================================================
echo.
cd /d "%~dp0"
if not exist server.js (
    if exist "ARISAN RUMAH BOLON\\server.js" (
        cd /d "%~dp0\\ARISAN RUMAH BOLON"
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
`;
fs.writeFileSync(path.join(projectSubDir, 'JALANKAN_SERVER_RUMAH_BOLON.bat'), serverBatContent, 'utf-8');
fs.writeFileSync(path.join(destDir, 'JALANKAN_SERVER_RUMAH_BOLON.bat'), serverBatContent, 'utf-8');

console.log('✔ Folder proyek dan database tersinkron lengkap di:', projectSubDir);

