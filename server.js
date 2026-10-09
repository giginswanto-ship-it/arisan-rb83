const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.sql': 'text/plain; charset=utf-8'
};

// ==========================================
// 1. MANAJEMEN PERSISTENSI DATABASE FILE
// ==========================================
const DB_DIR = path.join(__dirname, 'database');
const DB_FILE = path.join(DB_DIR, 'arisan_db.json');

// Pastikan direktori database ada
if (!fs.existsSync(DB_DIR)) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
    console.log('✔ Direktori database dibuat di:', DB_DIR);
  } catch (err) {
    console.error('Gagal membuat direktori database:', err);
  }
}

// 36 Peserta Default Rumah Bolon
const DEFAULT_PARTICIPANTS = [
  { id: 1, name: "01. Bertha Purba", phone: "" },
  { id: 2, name: "02. Dologman Purba", phone: "" },
  { id: 3, name: "03. Herman Sipayung", phone: "" },
  { id: 4, name: "04. Henri Jupliaman", phone: "" },
  { id: 5, name: "05. Erlianna Purba", phone: "" },
  { id: 6, name: "06. Ida Munthe", phone: "" },
  { id: 7, name: "07. Ide Hormaliani 1", phone: "" },
  { id: 8, name: "08. Ide Hormaliani 2", phone: "" },
  { id: 9, name: "09. Jan Haonangan", phone: "" },
  { id: 10, name: "10. Jan Wenson", phone: "" },
  { id: 11, name: "11. Jenwarita Damanik", phone: "" },
  { id: 12, name: "12. Jansen / Elkianna", phone: "" },
  { id: 13, name: "13. Lisbeth", phone: "" },
  { id: 14, name: "14. Lertina", phone: "" },
  { id: 15, name: "15. Naikman 1 Malau", phone: "" },
  { id: 16, name: "16. Naikman 2 Malau", phone: "" },
  { id: 17, name: "17. Nellawaty", phone: "" },
  { id: 18, name: "18. Rohmaulina", phone: "" },
  { id: 19, name: "19. Romasni Saragih", phone: "" },
  { id: 20, name: "20. Robensius", phone: "" },
  { id: 21, name: "21. Robert Napitu", phone: "" },
  { id: 22, name: "22. Rosenta Damanik", phone: "" },
  { id: 23, name: "23. Rosita Saragih", phone: "" },
  { id: 24, name: "24. Sahat Simarmata", phone: "" },
  { id: 25, name: "25. Sanni Rista", phone: "" },
  { id: 26, name: "26. Sunim Saragih", phone: "" },
  { id: 27, name: "27. Sarpiani Damanik", phone: "" },
  { id: 28, name: "28. Swanto #1", phone: "" },
  { id: 29, name: "29. Swanto #2", phone: "" },
  { id: 30, name: "30. Timoraya", phone: "" },
  { id: 31, name: "31. Torando Purba", phone: "" },
  { id: 32, name: "32. Malem", phone: "" },
  { id: 33, name: "33. Peserta 33", phone: "" },
  { id: 34, name: "34. Peserta 34", phone: "" },
  { id: 35, name: "35. Peserta 35", phone: "" },
  { id: 36, name: "36. Peserta 36", phone: "" }
];

function getInitialDatabaseData() {
  return {
    meta: {
      dbName: "ARISAN_RUMAH_BOLON_DATABASE",
      version: "3.0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    state: {
      currentPeriod: 1,
      soundEnabled: true,
      spinDuration: 5,
      participants: DEFAULT_PARTICIPANTS.map(p => ({
        ...p,
        wonPeriod: null,
        wonSlot: null,
        wonDate: null
      })),
      currentMonthWinners: [],
      monthlyPayments: { 1: {} },
      history: [],
      kasLedger: []
    },
    pins: {
      operator: '1945',
      bendahara: '2026'
    }
  };
}

function loadDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (e) {
      console.error('Database file corrupt, initializing new:', e);
    }
  }
  const initial = getInitialDatabaseData();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data) {
  try {
    if (!data.meta) data.meta = {};
    data.meta.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Gagal menulis database ke disk:', err);
    return false;
  }
}

// Inisialisasi awal database di disk saat server start
loadDatabase();

// Generator SQL Dump (SQLite / MySQL Compatible)
function generateSQLDump(db) {
  const st = db.state || {};
  const participants = st.participants || [];
  const kas = st.kasLedger || [];
  const history = st.history || [];

  let sql = `-- ========================================================\n`;
  sql += `-- DATABASE DUMP: ARISAN RUMAH BOLON\n`;
  sql += `-- Waktu Ekspor: ${new Date().toISOString()}\n`;
  sql += `-- ========================================================\n\n`;

  sql += `-- Tabel 1: tb_peserta\n`;
  sql += `CREATE TABLE IF NOT EXISTS tb_peserta (\n`;
  sql += `  id INTEGER PRIMARY KEY,\n`;
  sql += `  nama TEXT NOT NULL,\n`;
  sql += `  phone TEXT,\n`;
  sql += `  won_period INTEGER,\n`;
  sql += `  won_slot INTEGER,\n`;
  sql += `  won_date TEXT\n`;
  sql += `);\n\n`;

  participants.forEach(p => {
    const nameEsc = (p.name || '').replace(/'/g, "''");
    const phoneEsc = (p.phone || '').replace(/'/g, "''");
    const wonDateEsc = (p.wonDate || '').replace(/'/g, "''");
    sql += `INSERT INTO tb_peserta (id, nama, phone, won_period, won_slot, won_date) VALUES (${p.id}, '${nameEsc}', '${phoneEsc}', ${p.wonPeriod || 'NULL'}, ${p.wonSlot || 'NULL'}, ${wonDateEsc ? `'${wonDateEsc}'` : 'NULL'});\n`;
  });

  sql += `\n-- Tabel 2: tb_kas\n`;
  sql += `CREATE TABLE IF NOT EXISTS tb_kas (\n`;
  sql += `  id TEXT PRIMARY KEY,\n`;
  sql += `  tanggal TEXT NOT NULL,\n`;
  sql += `  tipe TEXT NOT NULL,\n`;
  sql += `  nominal INTEGER NOT NULL,\n`;
  sql += `  keterangan TEXT,\n`;
  sql += `  saldo_setelah INTEGER\n`;
  sql += `);\n\n`;

  kas.forEach(k => {
    const idEsc = (k.id || '').replace(/'/g, "''");
    const dateEsc = (k.date || '').replace(/'/g, "''");
    const typeEsc = (k.type || '').replace(/'/g, "''");
    const descEsc = (k.desc || '').replace(/'/g, "''");
    sql += `INSERT INTO tb_kas (id, tanggal, tipe, nominal, keterangan, saldo_setelah) VALUES ('${idEsc}', '${dateEsc}', '${typeEsc}', ${k.amount || 0}, '${descEsc}', ${k.balanceAfter || 0});\n`;
  });

  sql += `\n-- Tabel 3: tb_riwayat_periode\n`;
  sql += `CREATE TABLE IF NOT EXISTS tb_riwayat_periode (\n`;
  sql += `  periode INTEGER PRIMARY KEY,\n`;
  sql += `  tanggal TEXT,\n`;
  sql += `  kas_amount INTEGER,\n`;
  sql += `  is_finalized INTEGER\n`;
  sql += `);\n\n`;

  history.forEach(h => {
    const dateEsc = (h.date || '').replace(/'/g, "''");
    sql += `INSERT INTO tb_riwayat_periode (periode, tanggal, kas_amount, is_finalized) VALUES (${h.period}, '${dateEsc}', ${h.kasAmount || 600000}, 1);\n`;
  });

  return sql;
}

// ==========================================
// 2. HTTP SERVER & REST API DATABASE
// ==========================================
const server = http.createServer((req, res) => {
  const parsedUrl = req.url.split('?')[0];

  // Helper JSON Response
  const sendJSON = (statusCode, obj) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(obj));
  };

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // --- API DATABASE ENDPOINTS ---

  // 1. GET /api/database -> Membaca data database dari disk
  if (req.method === 'GET' && parsedUrl === '/api/database') {
    const db = loadDatabase();
    return sendJSON(200, {
      success: true,
      source: 'server_disk',
      path: DB_FILE,
      data: db
    });
  }

  // 2. GET /api/database/status -> Cek status database
  if (req.method === 'GET' && parsedUrl === '/api/database/status') {
    const exists = fs.existsSync(DB_FILE);
    let size = 0;
    if (exists) {
      const stat = fs.statSync(DB_FILE);
      size = stat.size;
    }
    return sendJSON(200, {
      success: true,
      exists: exists,
      path: DB_FILE,
      sizeBytes: size,
      dbName: 'arisan_db.json'
    });
  }

  // 3. GET /api/database/export-sql -> Unduh dump SQL
  if (req.method === 'GET' && parsedUrl === '/api/database/export-sql') {
    const db = loadDatabase();
    const sqlContent = generateSQLDump(db);
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="arisan_rumah_bolon_dump.sql"'
    });
    return res.end(sqlContent);
  }

  // 4. POST /api/database/save -> Simpan pembaruan state ke database file
  if (req.method === 'POST' && parsedUrl === '/api/database/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const currentDB = loadDatabase();
        if (payload.state) currentDB.state = payload.state;
        if (payload.pins) currentDB.pins = payload.pins;
        const saved = saveDatabase(currentDB);
        if (saved) {
          return sendJSON(200, { success: true, message: 'Database server berhasil dimutakhirkan di harddisk' });
        } else {
          return sendJSON(500, { success: false, message: 'Gagal menulis ke berkas database' });
        }
      } catch (err) {
        return sendJSON(400, { success: false, message: 'Format data JSON tidak valid: ' + err.message });
      }
    });
    return;
  }

  // 5. POST /api/database/insert -> Sisipkan / Impor database eksternal baru
  if (req.method === 'POST' && parsedUrl === '/api/database/insert') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        let targetDB;

        if (payload.state && payload.state.participants) {
          targetDB = payload;
        } else if (payload.participants && payload.participants.length === 36) {
          // Format state langsung
          targetDB = {
            meta: {
              dbName: "ARISAN_RUMAH_BOLON_DATABASE",
              version: "3.0",
              importedAt: new Date().toISOString()
            },
            state: payload,
            pins: loadDatabase().pins
          };
        } else {
          return sendJSON(400, { success: false, message: 'Format berkas database tidak dikenali (wajib berisi 36 peserta)' });
        }

        const saved = saveDatabase(targetDB);
        if (saved) {
          return sendJSON(200, { success: true, message: 'Database baru berhasil disisipkan dan dimuat ke server', data: targetDB });
        } else {
          return sendJSON(500, { success: false, message: 'Gagal menyimpan database baru ke disk' });
        }
      } catch (err) {
        return sendJSON(400, { success: false, message: 'Gagal membaca berkas database: ' + err.message });
      }
    });
    return;
  }

  // --- STATIC FILE SERVING ---
  let reqUrl = parsedUrl;
  if (reqUrl === '/') reqUrl = '/index.html';

  const filePath = path.join(__dirname, reqUrl);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log('🏛️  ARISAN RUMAH BOLON & DATABASE ENGINE AKTIF');
  console.log(`🌐  Aplikasi: http://localhost:${PORT}`);
  console.log(`💾  Database File: ${DB_FILE}`);
  console.log(`📡  REST API Database: http://localhost:${PORT}/api/database`);
  console.log('====================================================');
});
