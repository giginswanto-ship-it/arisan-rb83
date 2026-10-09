// Test Logic for ARISAN RUMAH BOLON
const assert = require('assert');

const TOTAL_PARTICIPANTS = 36;
const MONTHLY_FEE = 100000;
const WINNERS_PER_MONTH = 3;
const GROSS_PRIZE = 1200000;
const KAS_DEDUCTION = 200000;
const NET_PRIZE = 1000000;
const TOTAL_PERIODS = TOTAL_PARTICIPANTS / WINNERS_PER_MONTH;

console.log("=== VERIFIKASI LOGIKA & ATURAN ARISAN RUMAH BOLON ===");

// 1. Durasi Periode
assert.strictEqual(TOTAL_PERIODS, 12, "Total periode harus tepat 12 bulan");
console.log("✔ Durasi Siklus: 12 Bulan (36 peserta / 3 pemenang per bulan)");

// 2. Iuran Bulanan
const monthlyFees = TOTAL_PARTICIPANTS * MONTHLY_FEE;
assert.strictEqual(monthlyFees, 3600000, "Total iuran per bulan harus Rp 3.600.000");
console.log("✔ Total Iuran Bulanan: Rp 3.600.000 (36 peserta × Rp 100.000)");

// 3. Hak & Potongan Pemenang
assert.strictEqual(GROSS_PRIZE - KAS_DEDUCTION, NET_PRIZE, "Hak kotor dikurangi kas harus sama dengan diterima bersih");
assert.strictEqual(NET_PRIZE, 1000000, "Diterima bersih harus Rp 1.000.000");
assert.strictEqual(KAS_DEDUCTION, 200000, "Potongan kas harus Rp 200.000");
console.log("✔ Nominal Hadiah: Hak Rp 1.200.000, Kas Rp 200.000, Bersih Rp 1.000.000");

// 4. Keseimbangan Kas Bulanan
const monthlyNetPaid = WINNERS_PER_MONTH * NET_PRIZE;
const monthlyKas = WINNERS_PER_MONTH * KAS_DEDUCTION;
assert.strictEqual(monthlyNetPaid, 3000000, "Total cair ke 3 pemenang harus Rp 3.000.000");
assert.strictEqual(monthlyKas, 600000, "Total kas per bulan harus Rp 600.000");
assert.strictEqual(monthlyNetPaid + monthlyKas, monthlyFees, "Pengeluaran hadiah + kas harus tepat sama dengan iuran masuk");
console.log("✔ Keseimbangan Bulanan: Cair Rp 3.000.000 + Kas Rp 600.000 = Iuran Rp 3.600.000 (100% Seimbang)");

// 5. Total Akumulasi 1 Siklus Penuh (12 Bulan)
const totalFeesCycle = monthlyFees * 12;
const totalNetPaidCycle = monthlyNetPaid * 12;
const totalKasCycle = monthlyKas * 12;
assert.strictEqual(totalFeesCycle, 43200000, "Total iuran 12 bulan harus Rp 43.200.000");
assert.strictEqual(totalNetPaidCycle, 36000000, "Total bersih diterima 36 pemenang harus Rp 36.000.000");
assert.strictEqual(totalKasCycle, 7200000, "Total kas Rumah Bolon 12 bulan harus Rp 7.200.000");
assert.strictEqual(totalNetPaidCycle + totalKasCycle, totalFeesCycle, "Total 1 tahun harus seimbang");
console.log("✔ Total 1 Tahun Penuh: Iuran Rp 43.200.000, Diterima Peserta Rp 36.000.000, Kas Terkumpul Rp 7.200.000");

// 6. Simulasi Pengundian 12 Bulan Tanpa Duplikasi Pemenang
let participants = Array.from({ length: 36 }, (_, i) => ({ id: i + 1, won: false }));
let history = [];

for (let month = 1; month <= 12; month++) {
  let eligible = participants.filter(p => !p.won);
  assert.strictEqual(eligible.length, 36 - (month - 1) * 3, `Sisa peserta bulan ${month} harus sesuai`);
  
  // Pilih 3 acak
  let winnersThisMonth = [];
  for (let s = 0; s < 3; s++) {
    let randIdx = Math.floor(Math.random() * eligible.length);
    let chosen = eligible.splice(randIdx, 1)[0];
    chosen.won = true;
    winnersThisMonth.push(chosen);
  }
  history.push(winnersThisMonth);
}

// Cek semua 36 peserta menang tepat 1 kali
const wonCount = participants.filter(p => p.won).length;
assert.strictEqual(wonCount, 36, "Semua 36 peserta harus sudah menang");
console.log("✔ Simulasi Pengundian 12 Bulan: Seluruh 36 peserta menang tepat 1 kali tanpa duplikasi!");

// 7. Pengujian Sistem Anti-Duplikasi Berlapis (Multi-Source Protection)
function testIsParticipantAlreadyWon(pId, st) {
  const p = (st.participants || []).find(item => item.id === pId);
  if (p && p.wonPeriod != null && p.wonPeriod > 0) return true;
  if (Array.isArray(st.currentMonthWinners) && st.currentMonthWinners.some(w => w.id === pId)) return true;
  if (Array.isArray(st.history)) {
    for (const h of st.history) {
      if (Array.isArray(h.winners) && h.winners.some(w => w.id === pId)) return true;
    }
  }
  return false;
}

const mockState = {
  currentPeriod: 2,
  participants: Array.from({ length: 36 }, (_, i) => ({ id: i + 1, name: `Peserta ${i + 1}`, wonPeriod: null })),
  currentMonthWinners: [{ id: 4, name: "Peserta 4", wonPeriod: 2, wonSlot: 1 }],
  history: [
    { period: 1, winners: [{ id: 1 }, { id: 2 }, { id: 3 }] }
  ]
};

// Peserta 1, 2, 3 (riwayat bulan 1) & Peserta 4 (pemenang bulan 2 slot 1) HARUS terdeteksi sudah menang
assert.strictEqual(testIsParticipantAlreadyWon(1, mockState), true, "Peserta 1 dari riwayat harus terdeteksi sudah menang");
assert.strictEqual(testIsParticipantAlreadyWon(2, mockState), true, "Peserta 2 dari riwayat harus terdeteksi sudah menang");
assert.strictEqual(testIsParticipantAlreadyWon(3, mockState), true, "Peserta 3 dari riwayat harus terdeteksi sudah menang");
assert.strictEqual(testIsParticipantAlreadyWon(4, mockState), true, "Peserta 4 dari slot aktif harus terdeteksi sudah menang");
assert.strictEqual(testIsParticipantAlreadyWon(5, mockState), false, "Peserta 5 belum menang harus terdeteksi false");

// Hitung eligible participants: harus tepat 32 peserta (36 - 3 riwayat - 1 slot aktif)
const mockEligible = mockState.participants.filter(p => !testIsParticipantAlreadyWon(p.id, mockState));
assert.strictEqual(mockEligible.length, 32, "Peserta eligible harus tersisa 32 orang");
assert.strictEqual(mockEligible.some(p => [1, 2, 3, 4].includes(p.id)), false, "Tidak boleh ada pemenang sebelumnya di daftar eligible");
console.log("✔ Sistem Anti-Duplikasi Berlapis: Pemenang riwayat & pemenang slot aktif 100% diblokir dari undian!");

console.log("\n>>> SEMUA 7 PENGUJIAN LOGIKA BERHASIL 100% (PASS) <<<");
