-- ========================================================
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
