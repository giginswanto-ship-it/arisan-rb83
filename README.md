# 🏛️ APLIKASI ARISAN RUMAH BOLON

Aplikasi web modern, interaktif, dan akuntabel khusus untuk pengelolaan **ARISAN RUMAH BOLON**.

---

## 📌 Skema & Aturan Utama Arisan

| Parameter | Ketentuan Resmi | Keterangan |
| :--- | :--- | :--- |
| **Total Peserta** | **36 Peserta** | 1 Siklus penuh = 12 Bulan (1 Tahun) |
| **Setoran Iuran** | **Rp 100.000 / bulan** | Terkumpul: **Rp 3.600.000 / bulan** |
| **Jumlah Pemenang** | **3 Pemenang / bulan** | Total 36 pemenang merata dalam 12 bulan |
| **Hak Hadiah Kotor** | **Rp 1.200.000** | Hak kotor per pemenang |
| **Potongan Kas Rumah Bolon** | **Rp 200.000** | Masuk kas Rumah Bolon per pemenang |
| **Diterima Bersih (Net)** | **Rp 1.000.000** | Diterima bersih tunai / transfer oleh pemenang |
| **Total Kas Masuk / Bulan** | **Rp 600.000** | Dari 3 pemenang × Rp 200.000 |
| **Total Akumulasi Kas (1 Tahun)** | **Rp 7.200.000** | 12 Bulan × Rp 600.000 |

### ⚖️ Keseimbangan Finansial (100% Balanced):
- **Pemasukan Iuran**: 36 peserta × Rp 100.000 = **Rp 3.600.000 / bulan**
- **Pengeluaran Hadiah Bersih**: 3 pemenang × Rp 1.000.000 = **Rp 3.000.000 / bulan**
- **Alokasi Kas Rumah Bolon**: 3 pemenang × Rp 200.000 = **Rp 600.000 / bulan**
- **Total Pengeluaran & Alokasi**: Rp 3.000.000 + Rp 600.000 = **Rp 3.600.000 / bulan**

---

## 🚀 Cara Menjalankan Aplikasi

### Cara 1: Menggunakan File Batch (Paling Mudah)
Cukup **klik dua kali (double-click)** pada file:
```
start.bat
```
Aplikasi server lokal akan berjalan dan browser akan otomatis terbuka di `http://localhost:3000`.

### Cara 2: Menggunakan Terminal / Node.js
1. Buka folder proyek di terminal / PowerShell:
   ```bash
   cd C:\Users\Swanto\.gemini\antigravity\scratch\arisan-rumah-bolon
   ```
2. Jalankan server:
   ```bash
   node server.js
   ```
3. Buka peramban di: `http://localhost:3000`

### Cara 3: Buka Langsung Tanpa Server
Anda juga dapat langsung membuka file `index.html` dengan klik dua kali atau drag-and-drop ke Google Chrome / Microsoft Edge.

---

## 🔐 Hak Akses & Multi-User Portal

Aplikasi memiliki sistem autentikasi berbasis PIN dengan pembagian wewenang yang ketat:

| Peran (Role) | Hak Akses | Default PIN | Keterangan |
| :--- | :--- | :---: | :--- |
| **Operator** | **Akses Penuh**: Pemutaran roda, tambah/edit peserta, insert & kelola database, pengaturan durasi, reset siklus | `1945` | PIN default dapat diganti kapan saja. |
| **Bendahara** | **Akses Keuangan**: Konfirmasi checklist setoran iuran, catat pemasukan kas, catat pengeluaran kas, ekspor laporan | `2026` | PIN dirahasiakan di halaman depan. |
| **Peserta** | **Akses Lihat (Read-Only)**: Melihat papan pemenang, statistik iuran, buku kas, dan kuitansi | *Tanpa PIN* | Tanpa akses pemutaran undian atau edit data. |

---

## 🗄️ Arsitektur Dual-Layer Database

Aplikasi dilengkapi mesin database ganda yang andal dan transaksional:
1. **Mode Offline (IndexedDB - `ArisanRumahBolonDB`)**: Berjalan otomatis di browser tanpa perlu server/internet. Data transaksi, iuran, kas, dan peserta tersimpan aman di penyimpanan lokal browser.
2. **Mode Server (Node.js REST API + Disk JSON & SQL)**:
   - File fisik database tersimpan di `database/arisan_db.json`.
   - File skema dan relasi SQL di `database/arisan_database.sql`.
   - Sinkronisasi instan setiap ada perubahan data.
3. **Pusat Database (Modal Insert & Export)**:
   - **Insert Database**: Memasukkan file database cadangan (`.json` / `.sql`) secara langsung.
   - **Ekspor Database**: Mengunduh snapshot database lengkap dalam format JSON atau format SQL standar.
   - **Status Real-Time**: Pemantauan jumlah baris pada `tb_peserta`, `tb_iuran`, `tb_kas`, dan `tb_riwayat`.

---

## 🎥 Perekaman Undian Audio-Visual

- **Otomatis Merekam**: Saat tombol *Putar Undian* diklik, aplikasi secara otomatis merekam jalannya putaran roda hingga pengumuman pemenang.
- **Audio Menggelegar**: Didukung efek suara gemuruh dan fanfare kemenangan saat pemenang terpilih.
- **Popup Pemenang**: Tampilan nama pemenang berukuran besar dengan perayaan confetti.
- **Pengaturan Durasi**: Operator dapat menyesuaikan kecepatan putaran roda (misal: 3 - 10 detik).

---

## 🚀 Cara Menjalankan Aplikasi

### Opsi 1: Aplikasi Standalone Offline (Satu Klik)
Buka file `BUKA_ARISAN_RUMAH_BOLON.bat` atau langsung buka file `ARISAN_RUMAH_BOLON.html` di Google Chrome atau Microsoft Edge.

### Opsi 2: Server Database Lokal (Node.js REST API)
Klik dua kali pada `JALANKAN_SERVER_RUMAH_BOLON.bat` atau jalankan via terminal:
```bash
node server.js
```
Aplikasi akan membuka peramban di `http://localhost:3000`.

---

## 📁 Struktur Berkas

```
arisan-rb83/
├── ARISAN_RUMAH_BOLON.html            # Aplikasi web mandiri (All-in-one HTML, CSS, JS)
├── BUKA_ARISAN_RUMAH_BOLON.bat         # Launcher satu-klik untuk aplikasi mandiri
├── JALANKAN_SERVER_RUMAH_BOLON.bat     # Launcher satu-klik untuk server database
├── index.html                          # File antarmuka modular
├── style.css                           # Desain UI modern, responsif & elegan
├── app.js                              # Logika arisan, roda putar, audio, IndexedDB & API
├── server.js                           # Server HTTP & REST API persisten disk JSON
├── bundle_export.js                    # Skrip pembuat berkas mandiri & ekspor otomatis
├── database/
│   ├── arisan_db.json                  # Database persisten format JSON
│   └── arisan_database.sql             # Skema & dump database format SQL
└── README.md                           # Dokumentasi resmi aplikasi
```

