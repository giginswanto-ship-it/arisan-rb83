/**
 * APLIKASI ARISAN RUMAH BOLON
 * Aturan Utama:
 * - 36 Peserta (1 Siklus = 12 Periode / 12 Bulan)
 * - Iuran: Rp 100.000 / peserta / bulan (Total terkumpul: Rp 3.600.000 / bulan)
 * - 3 Pemenang setiap bulan
 * - Hak Kotor Hadiah: Rp 1.200.000 / pemenang
 * - Potongan Kas Rumah Bolon: Rp 200.000 / pemenang (Total Kas per bulan: Rp 600.000)
 * - Diterima Bersih: Rp 1.000.000 / pemenang
 */

const STORAGE_KEY = 'ARISAN_RUMAH_BOLON_DATA_V3';
const TOTAL_PARTICIPANTS = 36;
const MONTHLY_FEE = 100000;
const WINNERS_PER_MONTH = 3;
const GROSS_PRIZE = 1200000;
const KAS_DEDUCTION = 200000;
const NET_PRIZE = 1000000;
const MONTHLY_KAS_TOTAL = 600000;

// Daftar 36 Peserta Arisan Rumah Bolon (31 nama resmi terdaftar, peserta 32-36 dapat diisi/diedit kapan saja)
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
  { id: 32, name: "32. Peserta 32", phone: "" },
  { id: 33, name: "33. Peserta 33", phone: "" },
  { id: 34, name: "34. Peserta 34", phone: "" },
  { id: 35, name: "35. Peserta 35", phone: "" },
  { id: 36, name: "36. Peserta 36", phone: "" }
];

// STATE GLOBAL APLIKASI
let appState = {
  currentPeriod: 1, // 1 sampai 12
  soundEnabled: true,
  spinDuration: 5, // Durasi putaran roda dalam detik (default: 5 detik)
  participants: [],
  currentMonthWinners: [], // Array hingga 3 objek peserta untuk periode aktif
  monthlyPayments: {}, // Key: period (1..12) -> { participantId: boolean }
  history: [], // Riwayat 12 periode
  kasLedger: [] // Mutasi buku kas
};

// ==========================================
// 0. ROLE-BASED ACCESS CONTROL (RBAC) & AUTENTIKASI
// ==========================================
const ROLES = {
  OPERATOR: 'operator',
  BENDAHARA: 'bendahara',
  PESERTA: 'peserta'
};

const DEFAULT_PINS = {
  operator: '1945',
  bendahara: '2026'
};

const PINS_STORAGE_KEY = 'ARISAN_BOLON_USER_PINS_V1';

function getStoredPins() {
  try {
    const saved = localStorage.getItem(PINS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        operator: parsed.operator || DEFAULT_PINS.operator,
        bendahara: parsed.bendahara || DEFAULT_PINS.bendahara
      };
    }
  } catch (e) {}
  return { ...DEFAULT_PINS };
}

function saveStoredPin(role, newPin) {
  const pins = getStoredPins();
  pins[role] = newPin;
  try {
    localStorage.setItem(PINS_STORAGE_KEY, JSON.stringify(pins));
  } catch (e) {}
}

const SESSION_STORAGE_KEY = 'ARISAN_BOLON_USER_SESSION';
let currentSession = null;

function loadSession() {
  try {
    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      currentSession = JSON.parse(saved);
    } else {
      currentSession = null;
    }
  } catch (e) {
    currentSession = null;
  }
}

function saveSession(role, userName) {
  currentSession = {
    role: role,
    userName: userName,
    loginTime: Date.now()
  };
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentSession));
  } catch (e) {}
}

function clearSession() {
  currentSession = null;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {}
}

function handleOperatorLoginSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('operator-pin-input');
  const pin = (input ? input.value : '').trim();
  const activePin = getStoredPins().operator;

  if (pin === activePin || pin.toLowerCase() === 'operator') {
    saveSession(ROLES.OPERATOR, 'Operator Utama');
    if (input) input.value = '';
    showAppView();
  } else {
    alert("PIN Operator salah! Masukkan PIN yang benar (Default: 1945 atau PIN baru Anda).");
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function handleBendaharaLoginSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('bendahara-pin-input');
  const pin = (input ? input.value : '').trim();
  const activePin = getStoredPins().bendahara;

  if (pin === activePin || pin.toLowerCase() === 'bendahara') {
    saveSession(ROLES.BENDAHARA, 'Bendahara Keuangan');
    if (input) input.value = '';
    showAppView();
  } else {
    alert("PIN Bendahara salah! Masukkan PIN yang benar.");
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

// ==========================================
// FITUR GANTI PENGGUNA / ALIH PERAN (SWITCH USER)
// ==========================================
function openSwitchUserModal(focusRole = null) {
  const modal = document.getElementById('modal-switch-user');
  if (!modal) return;

  const errBox = document.getElementById('switch-user-error');
  if (errBox) errBox.classList.add('hidden');

  const pinOp = document.getElementById('switch-pin-operator');
  const pinBen = document.getElementById('switch-pin-bendahara');
  if (pinOp) pinOp.value = '';
  if (pinBen) pinBen.value = '';

  // 1. Tampilkan info user aktif saat ini
  const curInfo = document.getElementById('switch-user-current-info');
  if (curInfo) {
    if (!currentSession || !currentSession.role) {
      curInfo.innerHTML = `<span class="text-slate-400">Belum Login</span>`;
    } else {
      const r = currentSession.role;
      const u = currentSession.userName || '';
      if (r === ROLES.OPERATOR) {
        curInfo.innerHTML = `<span class="px-2 py-0.5 rounded-lg bg-red-950 text-red-300 border border-red-700/60 font-bold flex items-center gap-1.5"><i class="fa-solid fa-crown text-amber-400"></i> OPERATOR</span> <span class="text-slate-300 font-medium text-xs">(${u})</span>`;
      } else if (r === ROLES.BENDAHARA) {
        curInfo.innerHTML = `<span class="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold flex items-center gap-1.5"><i class="fa-solid fa-vault text-emerald-400"></i> BENDAHARA</span> <span class="text-slate-300 font-medium text-xs">(${u})</span>`;
      } else {
        curInfo.innerHTML = `<span class="px-2 py-0.5 rounded-lg bg-blue-950 text-blue-300 border border-blue-700/60 font-bold flex items-center gap-1.5"><i class="fa-solid fa-user text-blue-400"></i> PESERTA</span> <span class="text-slate-300 font-medium text-xs">(${u})</span>`;
      }
    }
  }

  // 2. Tampilkan badge status peran yang sedang aktif
  const badgeOp = document.getElementById('switch-badge-op-active');
  const badgeBen = document.getElementById('switch-badge-ben-active');
  const badgePes = document.getElementById('switch-badge-pes-active');
  const curRole = currentSession ? currentSession.role : null;

  if (badgeOp) badgeOp.classList.toggle('hidden', curRole !== ROLES.OPERATOR);
  if (badgeBen) badgeBen.classList.toggle('hidden', curRole !== ROLES.BENDAHARA);
  if (badgePes) badgePes.classList.toggle('hidden', curRole !== ROLES.PESERTA);

  // 3. Muat daftar 36 peserta ke dropdown
  populateSwitchPesertaDropdown();

  modal.classList.remove('hidden');

  // Fokuskan input jika ada request peran spesifik
  if (focusRole === 'operator' && pinOp) {
    setTimeout(() => pinOp.focus(), 120);
  } else if (focusRole === 'bendahara' && pinBen) {
    setTimeout(() => pinBen.focus(), 120);
  }
}

function closeSwitchUserModal() {
  const modal = document.getElementById('modal-switch-user');
  if (modal) modal.classList.add('hidden');
}

function populateSwitchPesertaDropdown() {
  const select = document.getElementById('switch-select-peserta');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = `<option value="">-- Tamu / Anggota Umum --</option>`;

  const list = (appState && appState.participants && appState.participants.length > 0)
    ? appState.participants
    : DEFAULT_PARTICIPANTS;

  list.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.name;
    opt.textContent = p.name;
    select.appendChild(opt);
  });

  if (currentSession && currentSession.role === ROLES.PESERTA && currentSession.userName) {
    select.value = currentSession.userName;
  } else if (currentVal) {
    select.value = currentVal;
  }
}

function showSwitchError(msg) {
  const errBox = document.getElementById('switch-user-error');
  const errText = document.getElementById('switch-user-error-text');
  if (errBox && errText) {
    errText.textContent = msg;
    errBox.classList.remove('hidden');
  } else {
    alert(msg);
  }
}

function handleQuickSwitchOperator(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('switch-pin-operator');
  const pin = (input ? input.value : '').trim();
  const activePin = getStoredPins().operator;

  if (pin === activePin || pin.toLowerCase() === 'operator') {
    saveSession(ROLES.OPERATOR, 'Operator Utama');
    closeSwitchUserModal();
    showAppView();
    if (input) input.value = '';
    alert("✔ Sukses beralih akun ke: OPERATOR (Akses Penuh)");
  } else {
    showSwitchError("PIN Operator salah! Masukkan PIN yang benar (Default: 1945).");
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function handleQuickSwitchBendahara(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('switch-pin-bendahara');
  const pin = (input ? input.value : '').trim();
  const activePin = getStoredPins().bendahara;

  if (pin === activePin || pin.toLowerCase() === 'bendahara') {
    saveSession(ROLES.BENDAHARA, 'Bendahara Keuangan');
    closeSwitchUserModal();
    showAppView();
    if (input) input.value = '';
    alert("✔ Sukses beralih akun ke: BENDAHARA (Akses Keuangan)");
  } else {
    showSwitchError("PIN Bendahara salah! Masukkan PIN yang benar (Default: 2026).");
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function handleQuickSwitchPeserta(e) {
  if (e && e.preventDefault) e.preventDefault();
  const select = document.getElementById('switch-select-peserta');
  let selectedName = select ? select.value : '';
  if (!selectedName) {
    selectedName = 'Anggota Peserta';
  }
  saveSession(ROLES.PESERTA, selectedName);
  closeSwitchUserModal();
  showAppView();
  alert(`✔ Sukses beralih akun ke: PESERTA (${selectedName})`);
}

function goToFullLoginPortal() {
  closeSwitchUserModal();
  clearSession();
  showLoginPortal();
}

// ==========================================
// FITUR GANTI PIN KEAMANAN (OPERATOR & BENDAHARA)
// ==========================================
function openChangePinModal(targetRole = null) {
  const modal = document.getElementById('modal-change-pin');
  if (!modal) return;

  const roleSelect = document.getElementById('change-pin-target-role');
  const errBox = document.getElementById('change-pin-error');
  const refNote = document.getElementById('operator-pin-reference');
  if (errBox) errBox.classList.add('hidden');

  const oldInput = document.getElementById('change-pin-old');
  const newInput = document.getElementById('change-pin-new');
  const confirmInput = document.getElementById('change-pin-confirm');

  if (oldInput) oldInput.value = '';
  if (newInput) newInput.value = '';
  if (confirmInput) confirmInput.value = '';

  let roleToSet = targetRole;
  if (!roleToSet && currentSession && currentSession.role) {
    if (currentSession.role === ROLES.OPERATOR || currentSession.role === ROLES.BENDAHARA) {
      roleToSet = currentSession.role;
    }
  }
  if (!roleToSet) roleToSet = 'operator';

  if (roleSelect) {
    roleSelect.value = roleToSet;
    // Jika user sedang login di dalam aplikasi, kunci pilihan sesuai perannya
    if (currentSession && (currentSession.role === ROLES.OPERATOR || currentSession.role === ROLES.BENDAHARA)) {
      roleSelect.value = currentSession.role;
      roleSelect.disabled = true;
    } else {
      roleSelect.disabled = false;
    }
  }

  const isOperatorUser = currentSession && currentSession.role === ROLES.OPERATOR;
  if (refNote) {
    if (isOperatorUser) {
      refNote.classList.remove('hidden');
    } else {
      refNote.classList.add('hidden');
    }
  }

  onChangePinRoleSelect(roleToSet);
  modal.classList.remove('hidden');
  if (oldInput) setTimeout(() => oldInput.focus(), 100);
}

function closeChangePinModal() {
  const modal = document.getElementById('modal-change-pin');
  if (modal) modal.classList.add('hidden');
}

function onChangePinRoleSelect(role) {
  const sub = document.getElementById('change-pin-subtitle');
  const btnReset = document.getElementById('btn-reset-pin-label');
  const refNote = document.getElementById('operator-pin-reference');
  const isOperatorUser = currentSession && currentSession.role === ROLES.OPERATOR;

  if (sub) {
    if (role === 'operator') {
      sub.textContent = 'Pembaruan PIN Akun Operator (Undian & Peserta)';
    } else {
      sub.textContent = 'Pembaruan PIN Akun Bendahara (Iuran & Kas)';
    }
  }

  if (btnReset) {
    if (role === 'operator') {
      btnReset.textContent = 'Kembalikan ke PIN Awal Pabrik (Default: 1945)';
    } else if (isOperatorUser) {
      btnReset.textContent = 'Kembalikan ke PIN Awal Pabrik (Default: 2026)';
    } else {
      btnReset.textContent = 'Kembalikan ke PIN Awal Pabrik';
    }
  }

  if (refNote) {
    if (isOperatorUser) {
      refNote.classList.remove('hidden');
    } else {
      refNote.classList.add('hidden');
    }
  }
}

function handleSaveNewPinSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const roleSelect = document.getElementById('change-pin-target-role');
  const targetRole = roleSelect ? roleSelect.value : 'operator';
  const roleName = targetRole === 'operator' ? 'Operator' : 'Bendahara';

  const oldPinInput = document.getElementById('change-pin-old');
  const newPinInput = document.getElementById('change-pin-new');
  const confirmPinInput = document.getElementById('change-pin-confirm');
  const errBox = document.getElementById('change-pin-error');
  const errText = document.getElementById('change-pin-error-text');

  const oldPin = (oldPinInput ? oldPinInput.value : '').trim();
  const newPin = (newPinInput ? newPinInput.value : '').trim();
  const confirmPin = (confirmPinInput ? confirmPinInput.value : '').trim();

  function showPinError(msg) {
    if (errBox && errText) {
      errText.textContent = msg;
      errBox.classList.remove('hidden');
    } else {
      alert(msg);
    }
  }

  const storedPins = getStoredPins();
  const activeCurrentPin = storedPins[targetRole];

  // 1. Verifikasi PIN lama
  if (oldPin !== activeCurrentPin) {
    showPinError(`PIN lama salah! Harap masukkan PIN ${roleName} yang aktif saat ini.`);
    if (oldPinInput) {
      oldPinInput.focus();
      oldPinInput.select();
    }
    return;
  }

  // 2. Verifikasi panjang PIN baru (minimal 4 karakter)
  if (newPin.length < 4) {
    showPinError("PIN baru minimal 4 karakter demi keamanan akun!");
    if (newPinInput) newPinInput.focus();
    return;
  }

  // 3. Verifikasi kesamaan PIN baru dan konfirmasi
  if (newPin !== confirmPin) {
    showPinError("Konfirmasi PIN baru tidak cocok!");
    if (confirmPinInput) confirmPinInput.focus();
    return;
  }

  // 4. Simpan PIN baru ke LocalStorage
  saveStoredPin(targetRole, newPin);
  if (errBox) errBox.classList.add('hidden');
  closeChangePinModal();

  alert(`✔ SUKSES! PIN ${roleName} berhasil diperbarui.\n\nSilakan gunakan PIN baru Anda (${newPin}) untuk login berikutnya.`);
}

function resetPinToDefault() {
  const roleSelect = document.getElementById('change-pin-target-role');
  const targetRole = roleSelect ? roleSelect.value : 'operator';
  const roleName = targetRole === 'operator' ? 'Operator' : 'Bendahara';
  const defPin = DEFAULT_PINS[targetRole];
  const isOperatorUser = currentSession && currentSession.role === ROLES.OPERATOR;

  const confirmPrompt = (targetRole === 'operator' || isOperatorUser)
    ? `Masukkan PIN lama ${roleName} untuk mengonfirmasi pengembalian ke PIN awal (${defPin}):`
    : `Masukkan PIN lama ${roleName} untuk mengonfirmasi pengembalian ke PIN awal:`;

  const oldPin = prompt(confirmPrompt);
  if (oldPin === null) return;

  const currentPin = getStoredPins()[targetRole];
  if (oldPin.trim() !== currentPin) {
    alert(`PIN lama ${roleName} tidak cocok. Reset PIN dibatalkan.`);
    return;
  }

  saveStoredPin(targetRole, defPin);
  closeChangePinModal();
  if (targetRole === 'operator' || isOperatorUser) {
    alert(`✔ PIN ${roleName} telah berhasil dikembalikan ke PIN awal pabrik: ${defPin}`);
  } else {
    alert(`✔ PIN ${roleName} telah berhasil dikembalikan ke PIN awal pabrik.`);
  }
}

function handlePesertaLoginSubmit() {
  const select = document.getElementById('peserta-select-login');
  let selectedName = select ? select.value : '';
  if (!selectedName) {
    selectedName = 'Anggota Peserta';
  }
  saveSession(ROLES.PESERTA, selectedName);
  showAppView();
}

function logoutSession() {
  if (confirm("Keluar dari akun saat ini dan kembali ke Portal Login?")) {
    clearSession();
    showLoginPortal();
  }
}

function showLoginPortal() {
  const portal = document.getElementById('view-login-portal');
  const appView = document.getElementById('app-main-view');

  if (portal) {
    portal.classList.remove('hidden');
    portal.classList.add('flex');
  }
  if (appView) {
    appView.classList.add('hidden');
    appView.classList.remove('flex');
  }

  populatePesertaLoginDropdown();
}

function showAppView() {
  const portal = document.getElementById('view-login-portal');
  const appView = document.getElementById('app-main-view');

  if (portal) {
    portal.classList.add('hidden');
    portal.classList.remove('flex');
  }
  if (appView) {
    appView.classList.remove('hidden');
    appView.classList.add('flex');
  }

  applyRolePermissions();
  renderAll();
  setTimeout(drawWheel, 100);
}

function populatePesertaLoginDropdown() {
  const select = document.getElementById('peserta-select-login');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = `<option value="">-- Tamu / Anggota Umum --</option>`;

  const list = (appState && appState.participants && appState.participants.length > 0)
    ? appState.participants
    : DEFAULT_PARTICIPANTS;

  list.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.name;
    opt.textContent = p.name;
    select.appendChild(opt);
  });

  if (currentVal) select.value = currentVal;
}

function checkSession() {
  loadSession();
  if (currentSession && currentSession.role) {
    showAppView();
  } else {
    showLoginPortal();
  }
}

function applyRolePermissions() {
  if (!currentSession) return;
  const role = currentSession.role;
  const userName = currentSession.userName || '';

  // 1. Header Role Badge
  const badge = document.getElementById('user-role-badge');
  if (badge) {
    badge.setAttribute('onclick', 'openSwitchUserModal()');
    badge.setAttribute('title', 'Klik untuk Ganti User / Peran');
    if (role === ROLES.OPERATOR) {
      badge.className = 'px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm bg-gradient-to-r from-red-950 via-bolon-maroon to-red-900 text-amber-300 border border-bolon-gold/40 cursor-pointer hover:ring-2 hover:ring-amber-400/50 transition';
      badge.innerHTML = `<i class="fa-solid fa-crown text-amber-400"></i><span>OPERATOR</span>`;
    } else if (role === ROLES.BENDAHARA) {
      badge.className = 'px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-emerald-300 border border-emerald-500/40 cursor-pointer hover:ring-2 hover:ring-emerald-400/50 transition';
      badge.innerHTML = `<i class="fa-solid fa-vault text-emerald-400"></i><span>BENDAHARA</span>`;
    } else {
      badge.className = 'px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-blue-300 border border-blue-500/40 cursor-pointer hover:ring-2 hover:ring-blue-400/50 transition';
      let cleanName = userName;
      if (cleanName.length > 15) cleanName = cleanName.substring(0, 13) + '..';
      badge.innerHTML = `<i class="fa-solid fa-user text-blue-400"></i><span>${cleanName}</span>`;
    }
  }

  // 1.1. Tombol Ganti PIN di Header (Hanya untuk Operator & Bendahara)
  const btnChangePin = document.getElementById('btn-change-pin');
  if (btnChangePin) {
    if (role === ROLES.OPERATOR || role === ROLES.BENDAHARA) {
      btnChangePin.classList.remove('hidden');
    } else {
      btnChangePin.classList.add('hidden');
    }
  }

  // 2. Tab Undian (Operator Only)
  const isOperator = (role === ROLES.OPERATOR);
  const opUndianNotice = document.getElementById('operator-undian-notice');
  const spinSingleBtn = document.getElementById('btn-spin-single');
  const spinAllBtn = document.getElementById('btn-spin-all');
  const undoBtn = document.getElementById('btn-undo-winner');
  const durationSlider = document.getElementById('spin-duration-slider');
  const durationBtns = document.querySelectorAll('.duration-btn');
  const nextPeriodBtn = document.getElementById('btn-next-period');

  if (opUndianNotice) {
    if (!isOperator) opUndianNotice.classList.remove('hidden');
    else opUndianNotice.classList.add('hidden');
  }

  if (!isOperator) {
    if (spinSingleBtn) spinSingleBtn.disabled = true;
    if (spinAllBtn) spinAllBtn.disabled = true;
    if (undoBtn) undoBtn.disabled = true;
    if (nextPeriodBtn) nextPeriodBtn.disabled = true;
    if (durationSlider) durationSlider.disabled = true;
    durationBtns.forEach(b => {
      b.disabled = true;
      b.classList.add('opacity-50', 'cursor-not-allowed');
    });
  } else {
    if (durationSlider) durationSlider.disabled = false;
    durationBtns.forEach(b => {
      b.disabled = false;
      b.classList.remove('opacity-50', 'cursor-not-allowed');
    });
  }

  // 3. Tab Iuran (Bendahara Only)
  const isBendahara = (role === ROLES.BENDAHARA);
  const iuranAdminActions = document.getElementById('iuran-admin-actions');
  const iuranRoleNotice = document.getElementById('iuran-role-notice');
  if (iuranAdminActions) {
    if (!isBendahara) iuranAdminActions.classList.add('hidden');
    else iuranAdminActions.classList.remove('hidden');
  }
  if (iuranRoleNotice) {
    if (!isBendahara) iuranRoleNotice.classList.remove('hidden');
    else iuranRoleNotice.classList.add('hidden');
  }

  // 4. Tab Kas (Bendahara Only)
  const kasNotice = document.getElementById('kas-bendahara-notice');
  const formKas = document.getElementById('form-kas');
  if (kasNotice) {
    if (!isBendahara) kasNotice.classList.remove('hidden');
    else kasNotice.classList.add('hidden');
  }
  if (formKas) {
    const inputs = formKas.querySelectorAll('input, select, button');
    inputs.forEach(el => {
      el.disabled = !isBendahara;
      if (!isBendahara) el.classList.add('opacity-50', 'cursor-not-allowed');
      else el.classList.remove('opacity-50', 'cursor-not-allowed');
    });
  }

  // 5. Tab Peserta (Operator Only)
  const pesertaAdminActions = document.getElementById('peserta-admin-actions');
  const pesertaOpNotice = document.getElementById('peserta-operator-notice');
  if (pesertaAdminActions) {
    if (!isOperator) pesertaAdminActions.classList.add('hidden');
    else pesertaAdminActions.classList.remove('hidden');
  }
  if (pesertaOpNotice) {
    if (!isOperator) pesertaOpNotice.classList.remove('hidden');
    else pesertaOpNotice.classList.add('hidden');
  }
}

// ==========================================
// 1. SOUND SYNTHESIZER ENGINE (Web Audio API)
// ==========================================
let audioCtx = null;
let audioStreamDest = null;
let masterOutputNode = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  if (audioCtx && !audioStreamDest && audioCtx.createMediaStreamDestination) {
    try {
      audioStreamDest = audioCtx.createMediaStreamDestination();
    } catch (e) {
      console.warn("MediaStreamDestination gagal dibuat:", e);
    }
  }
  if (audioCtx && !masterOutputNode) {
    masterOutputNode = audioCtx.createGain();
    masterOutputNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
    masterOutputNode.connect(audioCtx.destination);
    if (audioStreamDest) {
      try {
        masterOutputNode.connect(audioStreamDest);
      } catch (e) {}
    }
  }
  return audioCtx;
}

// Menghubungkan output suara ke Speaker & Saluran Rekaman Video
function connectAudioOut(node) {
  const ctx = getAudioContext();
  if (masterOutputNode) {
    node.connect(masterOutputNode);
  } else if (ctx) {
    node.connect(ctx.destination);
  }
}

function playTickSound() {
  if (!appState.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    connectAudioOut(gain);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {
    // Ignore audio error
  }
}

// Efek Drum Roll / Ketukan Suspensi saat Roda Berputar
let drumRollInterval = null;
function startSuspenseDrumRoll() {
  if (!appState.soundEnabled) return;
  stopSuspenseDrumRoll();
  let step = 0;
  drumRollInterval = setInterval(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      step++;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const freq = 120 + Math.min(step * 3, 140) + (step % 2 === 0 ? 15 : 0);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      connectAudioOut(gain);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }, 90);
}

function stopSuspenseDrumRoll() {
  if (drumRollInterval) {
    clearInterval(drumRollInterval);
    drumRollInterval = null;
  }
}

// EFEK AUDIO MENGGELEGAR (BOM SUB-BASS + GUNTUR PETIR + GONG EMAS + FANFARE)
function playThunderousBoom() {
  if (!appState.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. SUB-BASS CANNON EXPLOSION (DENTUMAN BOM SUB-BASS SUPER MENGGELEGAR)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(180, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + 1.4);
    subGain.gain.setValueAtTime(0.95, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    subOsc.connect(subGain);
    connectAudioOut(subGain);
    subOsc.start(now);
    subOsc.stop(now + 1.8);

    // 2. GEMURUH PETIR / GUNTUR (THUNDER RUMBLE CRACKLE VIA FILTERED NOISE)
    const bufferSize = Math.floor(ctx.sampleRate * 2.2);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(70, now + 2.0);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.75, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    connectAudioOut(noiseGain);
    whiteNoise.start(now);
    whiteNoise.stop(now + 2.2);

    // 3. DENTANG GONG LOGAM EMAS
    [329.63, 659.25, 1318.5].forEach(freq => {
      const gongOsc = ctx.createOscillator();
      const gongGain = ctx.createGain();
      gongOsc.type = 'sine';
      gongOsc.frequency.setValueAtTime(freq, now + 0.05);
      gongGain.gain.setValueAtTime(0.3, now + 0.05);
      gongGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      gongOsc.connect(gongGain);
      connectAudioOut(gongGain);
      gongOsc.start(now + 0.05);
      gongOsc.stop(now + 2.5);
    });

    // 4. TEROMPET KEMENANGAN MEGAH (HEROIC FANFARE ARPEGGIO)
    const fanfareNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    fanfareNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + 0.25 + (idx * 0.11);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.35, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);
      osc.connect(gain);
      connectAudioOut(gain);
      osc.start(noteTime);
      osc.stop(noteTime + 0.8);
    });
  } catch (e) {
    console.warn("Audio error:", e);
  }
}

function playWinFanfare() {
  playThunderousBoom();
}

function toggleSound() {
  appState.soundEnabled = !appState.soundEnabled;
  const icon = document.getElementById('sound-icon');
  if (appState.soundEnabled) {
    icon.className = 'fa-solid fa-volume-high text-bolon-gold';
  } else {
    icon.className = 'fa-solid fa-volume-xmark text-slate-500';
  }
  saveState();
}

// ==========================================
// 2. INISIALISASI & PERSISTENSI DATA (INDEXEDDB + SERVER REST API + LOCALSTORAGE)
// ==========================================
const DB_NAME = 'ArisanRumahBolonDB';
const DB_VERSION = 1;
let idbInstance = null;

function openIDB() {
  return new Promise((resolve) => {
    if (idbInstance) return resolve(idbInstance);
    if (typeof window === 'undefined' || !window.indexedDB) return resolve(null);

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('tb_peserta')) {
        db.createObjectStore('tb_peserta', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('tb_kas')) {
        db.createObjectStore('tb_kas', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('tb_riwayat')) {
        db.createObjectStore('tb_riwayat', { keyPath: 'period' });
      }
      if (!db.objectStoreNames.contains('tb_state')) {
        db.createObjectStore('tb_state', { keyPath: 'key' });
      }
    };
    req.onsuccess = (e) => {
      idbInstance = e.target.result;
      resolve(idbInstance);
    };
    req.onerror = () => {
      resolve(null);
    };
  });
}

async function saveStateToIndexedDB(state) {
  try {
    const db = await openIDB();
    if (!db) return;
    const tx = db.transaction(['tb_peserta', 'tb_kas', 'tb_riwayat', 'tb_state'], 'readwrite');

    const pStore = tx.objectStore('tb_peserta');
    pStore.clear();
    if (state.participants && state.participants.length > 0) {
      state.participants.forEach(p => pStore.put(p));
    }

    const kStore = tx.objectStore('tb_kas');
    kStore.clear();
    if (state.kasLedger && state.kasLedger.length > 0) {
      state.kasLedger.forEach(k => kStore.put(k));
    }

    const rStore = tx.objectStore('tb_riwayat');
    rStore.clear();
    if (state.history && state.history.length > 0) {
      state.history.forEach(h => rStore.put(h));
    }

    const sStore = tx.objectStore('tb_state');
    sStore.put({ key: 'main_state', value: JSON.parse(JSON.stringify(state)), updatedAt: new Date().toISOString() });
    sStore.put({ key: 'pins', value: getStoredPins(), updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn("IndexedDB save error:", err);
  }
}

async function loadStateFromIndexedDB() {
  try {
    const db = await openIDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(['tb_state'], 'readonly');
      const store = tx.objectStore('tb_state');
      const req = store.get('main_state');
      req.onsuccess = () => {
        if (req.result && req.result.value && req.result.value.participants) {
          resolve(req.result.value);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

let serverSyncTimeout = null;
function syncStateToServer(state) {
  if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
    if (serverSyncTimeout) clearTimeout(serverSyncTimeout);
    serverSyncTimeout = setTimeout(() => {
      fetch('/api/database/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: state, pins: getStoredPins() })
      }).then(r => r.json()).then(res => {
        if (res.success) {
          updateDatabaseStatusUI(true);
        }
      }).catch(() => {
        updateDatabaseStatusUI(false);
      });
    }, 400);
  }
}

async function initApp() {
  loadState();
  initWheelCanvas();
  checkSession();

  // Sinkronisasi dengan Server REST API atau IndexedDB
  if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
    try {
      const res = await fetch('/api/database');
      const json = await res.json();
      if (json && json.success && json.data && json.data.state && json.data.state.participants) {
        appState = json.data.state;
        if (json.data.pins) {
          try { localStorage.setItem(PINS_STORAGE_KEY, JSON.stringify(json.data.pins)); } catch(e){}
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
        saveStateToIndexedDB(appState);
        renderAll();
        updateDatabaseStatusUI(true);
      }
    } catch (e) {
      updateDatabaseStatusUI(false);
    }
  } else {
    // Mode Mandiri Single File: muat dari IndexedDB jika ada
    const idbState = await loadStateFromIndexedDB();
    if (idbState && idbState.participants && idbState.participants.length === TOTAL_PARTICIPANTS) {
      appState = idbState;
      renderAll();
    }
  }
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      appState = JSON.parse(saved);
    } catch (e) {
      console.error("Gagal membaca localStorage, reset ke default:", e);
      resetToDefaultState();
    }
  } else {
    resetToDefaultState();
  }

  // Pastikan field selalu lengkap
  if (!appState.participants || appState.participants.length !== TOTAL_PARTICIPANTS) {
    resetToDefaultState();
  }
  if (!appState.monthlyPayments) appState.monthlyPayments = {};
  if (!appState.monthlyPayments[appState.currentPeriod]) {
    appState.monthlyPayments[appState.currentPeriod] = {};
  }
  if (!appState.currentMonthWinners) appState.currentMonthWinners = [];
  if (!appState.history) appState.history = [];
  if (!appState.kasLedger) appState.kasLedger = [];
  if (!appState.spinDuration) appState.spinDuration = 5;

  // Update sound icon state
  const icon = document.getElementById('sound-icon');
  if (icon) {
    icon.className = appState.soundEnabled ? 'fa-solid fa-volume-high text-bolon-gold' : 'fa-solid fa-volume-xmark text-slate-500';
  }
}

function resetToDefaultState() {
  appState = {
    currentPeriod: 1,
    soundEnabled: true,
    spinDuration: 5,
    participants: JSON.parse(JSON.stringify(DEFAULT_PARTICIPANTS)).map(p => ({
      ...p,
      wonPeriod: null,
      wonSlot: null,
      wonDate: null
    })),
    currentMonthWinners: [],
    monthlyPayments: { 1: {} },
    history: [],
    kasLedger: []
  };
  saveState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  saveStateToIndexedDB(appState);
  syncStateToServer(appState);
}

// ==========================================
// 3. LOGIKA RODA UNDIAN (CANVAS WHEEL)
// ==========================================
let canvas, ctx;
let currentRotation = 0;
let isSpinning = false;

function initWheelCanvas() {
  canvas = document.getElementById('wheelCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  drawWheel();
}

// Dapatkan peserta yang belum pernah menang (eligible untuk diundi)
function getEligibleParticipants() {
  return appState.participants.filter(p => !p.wonPeriod);
}

function drawWheel() {
  if (!canvas || !ctx) return;
  const eligible = getEligibleParticipants();
  const numSlices = eligible.length;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = centerX - 12;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (numSlices === 0) {
    // Semua peserta sudah menang
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#182030';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e6a817';
    ctx.stroke();

    ctx.fillStyle = '#fed766';
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SEMUA 36 PESERTA', centerX, centerY - 14);
    ctx.fillText('TELAH MENANG!', centerX, centerY + 14);
    ctx.restore();
    return;
  }

  const arc = (2 * Math.PI) / numSlices;
  // Warna palet Rumah Bolon selang-seling (Marun, Charcoal, Emas Tua)
  const sliceColors = ['#800000', '#121722', '#9e1212', '#1a2232', '#6b0000', '#243048'];

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(currentRotation);

  for (let i = 0; i < numSlices; i++) {
    const angle = i * arc;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, angle, angle + arc);
    ctx.closePath();

    ctx.fillStyle = sliceColors[i % sliceColors.length];
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#e6a817';
    ctx.stroke();

    // Gambar Teks Nama Peserta
    ctx.save();
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = (i % 2 === 0) ? '#fed766' : '#ffffff';
    
    // Sesuaikan ukuran font dengan jumlah peserta
    let fontSize = numSlices > 24 ? 9 : (numSlices > 12 ? 11 : 13);
    ctx.font = `600 ${fontSize}px Inter`;

    // Potong nama jika terlalu panjang untuk canvas
    let text = eligible[i].name;
    if (text.length > 18) text = text.substring(0, 16) + '..';

    ctx.fillText(text, radius - 16, 0);
    ctx.restore();
  }

  // Lingkaran luar emas
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#e6a817';
  ctx.stroke();

  ctx.restore();

  // OVERLAY BANNER PERAYAAN PEMENANG PADA CANVAS (Agar terekam dalam video pengundian)
  if (canvasCelebrationWinner) {
    drawCanvasCelebrationOverlay(canvasCelebrationWinner);
  }
}

// ==========================================
// BANNER OVERLAY PERAYAAN PEMENANG PADA CANVAS
// (Tampil saat pemenang terpilih & terekam langsung di video pengundian)
// ==========================================
let canvasCelebrationWinner = null;
let celebrationCanvasAnimId = null;

function drawCanvasCelebrationOverlay(winner) {
  if (!canvas || !ctx) return;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.save();
  // Gelapkan roda sedikit dengan lingkaran latar
  ctx.beginPath();
  ctx.arc(cx, cy, (canvas.width / 2) - 10, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(10, 14, 22, 0.75)';
  ctx.fill();

  // Kartu Banner Pemenang di Tengah
  const cardW = Math.min(canvas.width * 0.88, 380);
  const cardH = 150;
  const cardX = cx - cardW / 2;
  const cardY = cy - cardH / 2;

  // Background Box dengan warna mewah Rumah Bolon
  const bgGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  bgGrad.addColorStop(0, '#1c1313');
  bgGrad.addColorStop(0.5, '#121722');
  bgGrad.addColorStop(1, '#1c1313');
  ctx.fillStyle = bgGrad;
  ctx.strokeStyle = '#e6a817';
  ctx.lineWidth = 3;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(cardX, cardY, cardW, cardH, 16);
  } else {
    ctx.rect(cardX, cardY, cardW, cardH);
  }
  ctx.fill();
  ctx.stroke();

  // Badge Header
  ctx.fillStyle = '#e6a817';
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`★ PEMENANG KE-${winner.wonSlot || 1} • BULAN KE-${winner.wonPeriod || appState.currentPeriod} ★`, cx, cardY + 16);

  // Nama Pemenang (Font Besar & Berkilau Emas)
  ctx.fillStyle = '#fed766';
  ctx.font = '900 24px Inter, sans-serif';
  ctx.textBaseline = 'middle';
  let name = winner.name || '';
  if (name.length > 20) name = name.substring(0, 18) + '...';
  ctx.fillText(name, cx, cardY + 62);

  // Garis Pemisah
  ctx.strokeStyle = 'rgba(230, 168, 23, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + 24, cardY + 92);
  ctx.lineTo(cardX + cardW - 24, cardY + 92);
  ctx.stroke();

  // Nominal Bersih
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 15px Inter, sans-serif';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Diterima Bersih: Rp 1.000.000', cx, cardY + cardH - 14);

  ctx.restore();
}

function startCelebrationCanvasAnimation(winner) {
  canvasCelebrationWinner = winner;
  if (celebrationCanvasAnimId) {
    cancelAnimationFrame(celebrationCanvasAnimId);
  }
  function loop() {
    if (!canvasCelebrationWinner) return;
    drawWheel();
    celebrationCanvasAnimId = requestAnimationFrame(loop);
  }
  celebrationCanvasAnimId = requestAnimationFrame(loop);
}

function stopCelebrationCanvasAnimation() {
  canvasCelebrationWinner = null;
  if (celebrationCanvasAnimId) {
    cancelAnimationFrame(celebrationCanvasAnimId);
    celebrationCanvasAnimId = null;
  }
  drawWheel();
}

// ==========================================
// PEREKAMAN VIDEO PENGUNDIAN (MediaRecorder)
// ==========================================
let mediaRecorder = null;
let recordedChunks = [];
let lastRecordedVideoBlob = null;
let lastRecordedVideoUrl = null;
let recordTimerInterval = null;
let recordSeconds = 0;

function isDrawRecordingActive() {
  return mediaRecorder && mediaRecorder.state === 'recording';
}

function startDrawRecording() {
  recordedChunks = [];
  lastRecordedVideoBlob = null;
  if (lastRecordedVideoUrl) {
    URL.revokeObjectURL(lastRecordedVideoUrl);
    lastRecordedVideoUrl = null;
  }

  const canvasElem = document.getElementById('wheelCanvas');
  const badge = document.getElementById('recording-badge');
  const timerDisplay = document.getElementById('recording-timer');

  if (badge) {
    badge.classList.remove('hidden');
    badge.classList.add('inline-flex');
  }
  recordSeconds = 0;
  if (timerDisplay) timerDisplay.textContent = '00:00';
  clearInterval(recordTimerInterval);
  recordTimerInterval = setInterval(() => {
    recordSeconds++;
    const mm = String(Math.floor(recordSeconds / 60)).padStart(2, '0');
    const ss = String(recordSeconds % 60).padStart(2, '0');
    if (timerDisplay) timerDisplay.textContent = `${mm}:${ss}`;
  }, 1000);

  if (!canvasElem || !canvasElem.captureStream) return;
  try {
    const ctx = getAudioContext(); // Pastikan node audio stream & master output aktif
    const canvasStream = canvasElem.captureStream(30); // 30 FPS
    const tracks = [...canvasStream.getVideoTracks()];

    // GABUNGKAN AUDIO TRACK DARI WEB AUDIO API DESTINATION (TICK, DRUMROLL, DENTUMAN MENGGELEGAR)
    if (audioStreamDest && audioStreamDest.stream) {
      const audioTracks = audioStreamDest.stream.getAudioTracks();
      if (audioTracks && audioTracks.length > 0) {
        tracks.push(audioTracks[0]);
      }
    }

    const combinedStream = new MediaStream(tracks);

    let mime = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm;codecs=vp8,opus';
    if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm';
    if (!MediaRecorder.isTypeSupported(mime)) mime = '';

    mediaRecorder = mime ? new MediaRecorder(combinedStream, { mimeType: mime }) : new MediaRecorder(combinedStream);
    mediaRecorder.ondataavailable = function(e) {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };
    mediaRecorder.start(100);
  } catch (err) {
    console.warn("Perekaman otomatis tidak didukung di browser ini:", err);
  }
}

function stopDrawRecording(onComplete) {
  clearInterval(recordTimerInterval);
  const badge = document.getElementById('recording-badge');
  if (badge) {
    badge.classList.add('hidden');
    badge.classList.remove('inline-flex');
  }

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.onstop = function() {
      if (recordedChunks.length > 0) {
        lastRecordedVideoBlob = new Blob(recordedChunks, { type: 'video/webm' });
        lastRecordedVideoUrl = URL.createObjectURL(lastRecordedVideoBlob);
      }
      if (onComplete) onComplete(lastRecordedVideoBlob);
    };
    try {
      mediaRecorder.stop();
    } catch (e) {
      if (onComplete) onComplete(lastRecordedVideoBlob);
    }
  } else {
    if (onComplete) onComplete(lastRecordedVideoBlob);
  }
}

// Putar roda untuk memilih 1 pemenang di slot berikutnya
function spinNextWinner() {
  if (!currentSession || currentSession.role !== ROLES.OPERATOR) {
    alert("Akses Ditolak: Hanya Operator yang berwenang memutar roda undian!");
    return;
  }
  if (isSpinning) return;

  // Cek apakah slot bulan ini sudah penuh (3 pemenang)
  if (appState.currentMonthWinners.length >= WINNERS_PER_MONTH) {
    alert("Periode Bulan ke-" + appState.currentPeriod + " sudah mendapatkan 3 pemenang! Silakan kunci periode untuk lanjut ke bulan berikutnya.");
    return;
  }

  const eligible = getEligibleParticipants();
  if (eligible.length === 0) {
    alert("Semua 36 peserta arisan sudah pernah menang dalam siklus ini!");
    return;
  }

  isSpinning = true;
  document.getElementById('btn-spin-single').disabled = true;
  document.getElementById('btn-spin-all').disabled = true;

  // MULAI PEREKAMAN PENGUNDIAN (VIDEO + AUDIO LENGKAP) & SUARA DRUM ROLL
  startDrawRecording();
  startSuspenseDrumRoll();

  // Pilih acak salah satu peserta eligible
  const winningIndex = Math.floor(Math.random() * eligible.length);
  const winner = eligible[winningIndex];
  const arc = (2 * Math.PI) / eligible.length;

  // Penunjuk roda ada di posisi TOP (sudut 270 derajat atau 3*PI/2)
  const targetSectorAngle = winningIndex * arc + arc / 2;
  const pointerAngle = 1.5 * Math.PI; // 270 derajat (Puncak atas)

  // Ambil durasi kustom dari pengaturan (default 5 detik)
  const durationSec = appState.spinDuration || 5;
  const duration = durationSec * 1000;

  // Hitung putaran tambahan proporsional dengan durasi agar roda selalu berputar kencang & dinamis
  const minRotations = Math.max(3, Math.round(durationSec * 1.6));
  const fullRotations = (minRotations + Math.floor(Math.random() * 3)) * 2 * Math.PI;
  const currentMod = currentRotation % (2 * Math.PI);
  const targetAngle = currentRotation - currentMod + fullRotations + (pointerAngle - targetSectorAngle);

  const startAngle = currentRotation;
  const angleDelta = targetAngle - startAngle;
  const startTime = performance.now();

  let lastTickAngle = startAngle;
  const pointerElem = document.querySelector('.wheel-pointer');
  const liveDisplay = document.getElementById('live-spin-display');

  function animateSpin(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing cubic out: cepat di awal, melambat mulus di akhir
    const easeOut = 1 - Math.pow(1 - progress, 3);
    currentRotation = startAngle + angleDelta * easeOut;

    drawWheel();

    // Suara Tick & Jiggle saat melewati garis pembatas
    if (Math.abs(currentRotation - lastTickAngle) >= arc) {
      playTickSound();
      lastTickAngle = currentRotation;
      if (pointerElem) {
        pointerElem.classList.remove('jiggle');
        void pointerElem.offsetWidth; // trigger reflow
        pointerElem.classList.add('jiggle');
      }

      // Animasi teks peserta live
      const randomIdx = Math.floor(Math.random() * eligible.length);
      if (liveDisplay) {
        liveDisplay.innerHTML = `<span class="text-sm font-bold text-bolon-gold tracking-wide animate-pulse">Mengundi: ${eligible[randomIdx].name}</span>`;
      }
    }

    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      // Pengundian Selesai
      isSpinning = false;
      stopSuspenseDrumRoll();
      document.getElementById('btn-spin-single').disabled = false;
      document.getElementById('btn-spin-all').disabled = false;

      // 1. Tampilkan banner perayaan di canvas roda agar terekam visual dalam video pengundian
      const nextSlot = appState.currentMonthWinners.length + 1;
      const winnerWithSlot = { ...winner, wonSlot: nextSlot, wonPeriod: appState.currentPeriod };
      startCelebrationCanvasAnimation(winnerWithSlot);

      // 2. Catat pemenang & bunyikan audio menggelegar + screen shake + confetti + buka modal
      recordWinner(winner);

      // PEREKAMAN TETAP BERJALAN MEREKAM PERAYAAN & AUDIO MENGGELEGAR!
      // Rekaman baru berhenti setelah pop-up pemenang berhenti (ditutup pengguna atau tombol stop rekam diklik).
    }
  }

  requestAnimationFrame(animateSpin);
}

// Catat pemenang baru ke slot bulan ini
function recordWinner(winner, videoBlob = null) {
  const slotNumber = appState.currentMonthWinners.length + 1;
  const nowStr = formatIndonesianDate(new Date());

  const winnerData = {
    ...winner,
    wonPeriod: appState.currentPeriod,
    wonSlot: slotNumber,
    wonDate: nowStr
  };

  // Simpan ke state
  appState.currentMonthWinners.push(winnerData);

  // Update data peserta di array utama
  const pIndex = appState.participants.findIndex(p => p.id === winner.id);
  if (pIndex !== -1) {
    appState.participants[pIndex].wonPeriod = appState.currentPeriod;
    appState.participants[pIndex].wonSlot = slotNumber;
    appState.participants[pIndex].wonDate = nowStr;
  }

  saveState();
  renderAll();

  // EFEK AUDIO MENGGELEGAR & GUNCANGAN LAYAR SPEKTAKULER
  playThunderousBoom();
  triggerScreenShake();
  triggerCelebrationConfetti();

  // Buka popup selamat berfont raksasa dengan pemutar video rekaman
  showWinnerCelebration(winnerData, slotNumber, videoBlob);
}

// Undi Sekaligus 3 Pemenang
async function spinAllThreeWinners() {
  if (!currentSession || currentSession.role !== ROLES.OPERATOR) {
    alert("Akses Ditolak: Hanya Operator yang berwenang memutar roda undian!");
    return;
  }
  if (isSpinning) return;

  const currentCount = appState.currentMonthWinners.length;
  const needed = WINNERS_PER_MONTH - currentCount;

  if (needed <= 0) {
    alert("Periode Bulan ke-" + appState.currentPeriod + " sudah memiliki 3 pemenang!");
    return;
  }

  const eligible = getEligibleParticipants();
  if (eligible.length < needed) {
    alert(`Peserta yang belum menang tersisa ${eligible.length} orang, tidak cukup untuk ${needed} pemenang.`);
    return;
  }

  if (!confirm(`Apakah Anda yakin ingin mengundi langsung sekaligus ${needed} pemenang untuk Periode Bulan ke-${appState.currentPeriod}?`)) {
    return;
  }

  // Jalankan spinNextWinner satu per satu secara berurutan
  for (let i = 0; i < needed; i++) {
    await new Promise(resolve => {
      spinNextWinner();
      // Tunggu hingga putaran selesai DAN pop-up pemenang ditutup oleh pengguna
      const checkInterval = setInterval(() => {
        const modal = document.getElementById('modal-winner-celebration');
        const modalOpen = modal && !modal.classList.contains('hidden');
        if (!isSpinning && !modalOpen) {
          clearInterval(checkInterval);
          setTimeout(resolve, 600); // jeda antar putaran
        }
      }, 250);
    });
  }
}

// Batalkan pemenang terakhir (Undo)
function undoLastWinner() {
  if (!currentSession || currentSession.role !== ROLES.OPERATOR) {
    alert("Akses Ditolak: Hanya Operator yang berwenang membatalkan pemenang!");
    return;
  }
  if (isSpinning) return;
  if (appState.currentMonthWinners.length === 0) return;

  const lastWinner = appState.currentMonthWinners.pop();

  // Pulihkan status peserta
  const pIndex = appState.participants.findIndex(p => p.id === lastWinner.id);
  if (pIndex !== -1) {
    appState.participants[pIndex].wonPeriod = null;
    appState.participants[pIndex].wonSlot = null;
    appState.participants[pIndex].wonDate = null;
  }

  saveState();
  renderAll();
  alert(`Pemenang '${lastWinner.name}' di slot #${lastWinner.wonSlot} telah dibatalkan.`);
}

// Kunci Periode dan lanjut ke bulan berikutnya (Membukukan Kas Rp 600.000)
function finalizePeriodAndNext() {
  if (!currentSession || currentSession.role !== ROLES.OPERATOR) {
    alert("Akses Ditolak: Hanya Operator yang berwenang mengunci periode!");
    return;
  }
  if (appState.currentMonthWinners.length < WINNERS_PER_MONTH) {
    alert("Harap undi 3 pemenang terlebih dahulu sebelum mengunci periode!");
    return;
  }

  const periodNum = appState.currentPeriod;
  const nowStr = formatIndonesianDate(new Date());

  if (!confirm(`KUNCI PERIODE & BUKUKAN KAS BULAN KE-${periodNum}?\n\n` +
    `• 3 Pemenang telah sah terpilih.\n` +
    `• Potongan kas Rp 600.000 (3 pemenang x Rp 200.000) akan RESMI DIBUKUKAN ke Buku Kas Rumah Bolon.\n` +
    `• Periode akan dilanjutkan ke Bulan ke-${periodNum < 12 ? periodNum + 1 : 12}.\n\n` +
    `Klik OK untuk mengunci periode dan membukukan Kas sekarang.`)) {
    return;
  }

  // 1. Simpan ke History Riwayat 12 Periode
  const periodRecord = {
    period: periodNum,
    date: nowStr,
    winners: JSON.parse(JSON.stringify(appState.currentMonthWinners)),
    kasAmount: MONTHLY_KAS_TOTAL,
    isFinalized: true
  };
  appState.history.push(periodRecord);

  // 2. RESMI BUKUKAN KE BUKU KAS RUMAH BOLON (Rp 600.000)
  addKasEntry(
    'in',
    MONTHLY_KAS_TOTAL,
    `Potongan Kas Arisan Bulan ke-${periodNum} (3 pemenang @ Rp 200.000)`,
    nowStr
  );

  // 3. Reset pemenang bulan ini dan majukan periode jika belum mencapai 12
  appState.currentMonthWinners = [];
  if (appState.currentPeriod < 12) {
    appState.currentPeriod += 1;
    if (!appState.monthlyPayments[appState.currentPeriod]) {
      appState.monthlyPayments[appState.currentPeriod] = {};
    }
  }

  saveState();
  renderAll();

  // Pesta perayaan penyelesaian periode & pembukuan kas
  triggerCelebrationConfetti();
  alert(`✔ PEMBUKUAN KAS BERHASIL!\n\n` +
    `• Periode Bulan ke-${periodNum} telah resmi dikunci.\n` +
    `• Kas sebesar Rp 600.000 telah RESMI DIBUKUKAN ke Buku Kas Rumah Bolon.\n` +
    `• Total Saldo Kas Rumah Bolon saat ini: ${formatIDR(getKasBalance())}.\n` +
    `• Periode aktif kini: Bulan ke-${appState.currentPeriod}.`);
}

// ==========================================
// 4. BUKU KAS RUMAH BOLON
// ==========================================
function addKasEntry(type, amount, desc, dateStr = null) {
  const currentBalance = getKasBalance();
  const numAmount = parseInt(amount, 10);
  const newBalance = type === 'in' ? (currentBalance + numAmount) : (currentBalance - numAmount);

  const entry = {
    id: 'KAS-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    date: dateStr || formatIndonesianDate(new Date()),
    type: type, // 'in' atau 'out'
    amount: numAmount,
    desc: desc,
    balanceAfter: newBalance
  };

  appState.kasLedger.unshift(entry); // Terbaru di atas
  saveState();
}

function getKasBalance() {
  if (!appState.kasLedger || appState.kasLedger.length === 0) return 0;
  // Hitung ulang total in dikurangi total out untuk konsistensi mutlak
  let totalIn = 0;
  let totalOut = 0;
  appState.kasLedger.forEach(entry => {
    if (entry.type === 'in') totalIn += entry.amount;
    else totalOut += entry.amount;
  });
  return totalIn - totalOut;
}

function handleKasSubmit(event) {
  event.preventDefault();
  if (!currentSession || currentSession.role !== ROLES.BENDAHARA) {
    alert("Akses Ditolak: Hanya Bendahara yang berwenang mencatat transaksi kas!");
    return;
  }
  const type = document.getElementById('kas-type').value;
  const amount = parseInt(document.getElementById('kas-amount').value, 10);
  const desc = document.getElementById('kas-desc').value.trim();

  if (!amount || amount <= 0) {
    alert("Masukkan nominal yang valid!");
    return;
  }
  if (!desc) {
    alert("Harap isi keterangan keperluan!");
    return;
  }

  addKasEntry(type, amount, desc);
  document.getElementById('form-kas').reset();
  renderKasTab();
  renderHeaderSummary();
  alert("Catatan kas berhasil disimpan!");
}

function deleteKasEntry(id) {
  if (!currentSession || currentSession.role !== ROLES.BENDAHARA) {
    alert("Akses Ditolak: Hanya Bendahara yang berwenang menghapus catatan transaksi kas!");
    return;
  }
  if (!confirm("Hapus catatan transaksi kas ini?")) return;
  appState.kasLedger = appState.kasLedger.filter(e => e.id !== id);
  saveState();
  renderKasTab();
  renderHeaderSummary();
}

// ==========================================
// 5. CHECKLIST IURAN BULANAN
// ==========================================
let currentIuranFilter = 'all'; // 'all', 'paid', 'unpaid'

function setIuranFilter(filter) {
  currentIuranFilter = filter;
  ['all', 'paid', 'unpaid'].forEach(f => {
    const btn = document.getElementById(`filter-btn-${f}`);
    if (btn) {
      if (f === filter) {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-bolon-gold text-slate-950';
      } else {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-bolon-dark border border-bolon-border text-slate-300 hover:text-white';
      }
    }
  });
  renderIuranGrid();
}

function toggleIuranPayment(participantId) {
  if (!currentSession || currentSession.role !== ROLES.BENDAHARA) {
    alert("Akses Ditolak: Hanya Bendahara yang berwenang mengubah status iuran peserta!");
    return;
  }
  const curPeriod = appState.currentPeriod;
  if (!appState.monthlyPayments[curPeriod]) {
    appState.monthlyPayments[curPeriod] = {};
  }
  const isPaid = !!appState.monthlyPayments[curPeriod][participantId];
  appState.monthlyPayments[curPeriod][participantId] = !isPaid;

  saveState();
  renderIuranTab();
  renderHeaderSummary();
}

function markAllPaidCurrentMonth() {
  if (!currentSession || currentSession.role !== ROLES.BENDAHARA) {
    alert("Akses Ditolak: Hanya Bendahara yang berwenang menandai seluruh iuran lunas!");
    return;
  }
  const curPeriod = appState.currentPeriod;
  if (!confirm(`Tandai seluruh 36 peserta telah LUNAS membayar iuran Rp 100.000 untuk Periode Bulan ke-${curPeriod}?`)) {
    return;
  }
  if (!appState.monthlyPayments[curPeriod]) {
    appState.monthlyPayments[curPeriod] = {};
  }
  appState.participants.forEach(p => {
    appState.monthlyPayments[curPeriod][p.id] = true;
  });
  saveState();
  renderIuranTab();
  renderHeaderSummary();
}

function resetAllPaidCurrentMonth() {
  if (!currentSession || currentSession.role !== ROLES.BENDAHARA) {
    alert("Akses Ditolak: Hanya Bendahara yang berwenang mereset status iuran!");
    return;
  }
  const curPeriod = appState.currentPeriod;
  if (!confirm(`Reset status pembayaran untuk Periode Bulan ke-${curPeriod}?`)) {
    return;
  }
  appState.monthlyPayments[curPeriod] = {};
  saveState();
  renderIuranTab();
  renderHeaderSummary();
}

function filterIuranList() {
  renderIuranGrid();
}

// ==========================================
// 6. KWITANSI RESMI & WHATSAPP
// ==========================================
let activeReceiptWinner = null;

function openReceiptModal(slotIndex) {
  const winner = appState.currentMonthWinners[slotIndex - 1];
  if (!winner) {
    alert("Pemenang slot ini belum diundi!");
    return;
  }
  activeReceiptWinner = winner;

  document.getElementById('receipt-no').textContent = `ARB/${new Date().getFullYear()}/${String(appState.currentPeriod).padStart(2, '0')}-${slotIndex}`;
  document.getElementById('receipt-date').textContent = winner.wonDate || formatIndonesianDate(new Date());
  document.getElementById('receipt-winner-name').textContent = `: ${winner.name}`;
  document.getElementById('receipt-period-name').textContent = `: Bulan ke-${appState.currentPeriod} (Pemenang ke-${slotIndex})`;
  document.getElementById('receipt-sig-winner').textContent = `( ${winner.name} )`;

  const modal = document.getElementById('modal-receipt');
  modal.classList.remove('hidden');
}

function closeReceiptModal() {
  document.getElementById('modal-receipt').classList.add('hidden');
  activeReceiptWinner = null;
}

function sendReceiptWA() {
  if (!activeReceiptWinner) return;
  const w = activeReceiptWinner;
  const text = 
`🏛️ *KWITANSI PENYERAHAN ARISAN RUMAH BOLON* 🏛️
-----------------------------------------------
No. Bukti: ARB/${new Date().getFullYear()}/${String(appState.currentPeriod).padStart(2, '0')}-${w.wonSlot}
Periode: *Bulan ke-${appState.currentPeriod}*
Tanggal: ${w.wonDate || formatIndonesianDate(new Date())}

👤 *Nama Pemenang:* ${w.name}
🏆 *Pemenang Ke:* #${w.wonSlot}

📋 *Rincian Keuangan:*
• Hak Kotor Arisan : Rp 1.200.000
• Potongan Kas Rumah Bolon : - Rp 200.000
-----------------------------------------------
💰 *TOTAL DITERIMA BERSIH:* *Rp 1.000.000*
*(Satu Juta Rupiah)*
-----------------------------------------------
Selamat kepada pemenang! Terima kasih atas partisipasi dan kebersamaan seluruh keluarga besar Rumah Bolon.

Pengurus Arisan Rumah Bolon`;

  const targetPhone = (w.phone || '').replace(/[^0-9]/g, '');
  const url = targetPhone.length >= 8 
    ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(text)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

  window.open(url, '_blank');
}

function shareWinnerWhatsApp(slotIndex) {
  const winner = appState.currentMonthWinners[slotIndex - 1];
  if (!winner) return;
  activeReceiptWinner = winner;
  sendReceiptWA();
}

// Efek Guncangan Layar Spektakuler saat Menggelegar
function triggerScreenShake() {
  document.body.classList.add('shake-screen');
  const cardBox = document.getElementById('celeb-card-box');
  if (cardBox) cardBox.classList.add('shake-screen');
  setTimeout(() => {
    document.body.classList.remove('shake-screen');
    if (cardBox) cardBox.classList.remove('shake-screen');
  }, 900);
}

// Popup Perayaan Pemenang (Font Raksasa + Video Player Rekaman)
let activeCelebrationWinner = null;
let celebrationAutoStopTimer = null;

function manualStopDrawRecording() {
  if (celebrationAutoStopTimer) {
    clearTimeout(celebrationAutoStopTimer);
    celebrationAutoStopTimer = null;
  }

  const btnStop = document.getElementById('btn-stop-rec-manual');
  if (btnStop) {
    btnStop.disabled = true;
    btnStop.classList.add('opacity-50', 'cursor-not-allowed');
    btnStop.innerHTML = `<i class="fa-solid fa-check text-[9px]"></i><span>Rekaman Disimpan</span>`;
  }

  const videoStatus = document.getElementById('celeb-video-status');
  if (videoStatus) {
    videoStatus.textContent = 'Menyelesaikan Video + Audio HD...';
    videoStatus.className = 'text-[10px] px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold animate-pulse';
  }

  stopCelebrationCanvasAnimation();

  if (isDrawRecordingActive()) {
    stopDrawRecording(function(videoBlob) {
      attachRecordedVideoToPopup(videoBlob);
    });
  } else if (lastRecordedVideoBlob) {
    attachRecordedVideoToPopup(lastRecordedVideoBlob);
  }
}

function showWinnerCelebration(winner, slotNumber, videoBlob = null) {
  activeCelebrationWinner = winner;

  document.getElementById('celeb-slot-title').textContent = `Pemenang Ke-${slotNumber} • Periode Bulan ke-${appState.currentPeriod}`;
  document.getElementById('celeb-winner-name').textContent = winner.name;

  // Reset tombol Stop Rekam manual di popup
  const btnStop = document.getElementById('btn-stop-rec-manual');
  if (btnStop) {
    btnStop.disabled = false;
    btnStop.classList.remove('opacity-50', 'cursor-not-allowed');
    btnStop.innerHTML = `<i class="fa-solid fa-stop text-[9px]"></i><span>Stop Rekam</span>`;
  }

  const videoSection = document.getElementById('celeb-video-section');
  const videoPlayer = document.getElementById('celeb-video-player');
  const videoStatus = document.getElementById('celeb-video-status');

  if (videoSection) videoSection.classList.remove('hidden');

  if (isDrawRecordingActive()) {
    if (videoStatus) {
      videoStatus.textContent = '🔴 Sedang Merekam Perayaan...';
      videoStatus.className = 'text-[10px] px-2.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-700 font-bold animate-pulse';
    }
    // Auto-stop cadangan 15 detik jika pengguna membiarkan pop-up terbuka tanpa interaksi
    if (celebrationAutoStopTimer) clearTimeout(celebrationAutoStopTimer);
    celebrationAutoStopTimer = setTimeout(() => {
      if (isDrawRecordingActive()) {
        manualStopDrawRecording();
      }
    }, 15000);
  } else if (lastRecordedVideoUrl && videoPlayer) {
    videoPlayer.src = lastRecordedVideoUrl;
    videoPlayer.load();
    if (videoStatus) {
      videoStatus.textContent = '✅ Rekaman Selesai (Video + Audio HD)';
      videoStatus.className = 'text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold';
    }
  }

  document.getElementById('modal-winner-celebration').classList.remove('hidden');
}

// Menghubungkan file rekaman yang telah selesai ke pemutar video pop-up
function attachRecordedVideoToPopup(videoBlob) {
  const videoSection = document.getElementById('celeb-video-section');
  const videoPlayer = document.getElementById('celeb-video-player');
  const videoStatus = document.getElementById('celeb-video-status');
  const btnStop = document.getElementById('btn-stop-rec-manual');

  if (btnStop) {
    btnStop.disabled = true;
    btnStop.classList.add('opacity-50', 'cursor-not-allowed');
    btnStop.innerHTML = `<i class="fa-solid fa-check text-[9px]"></i><span>Rekaman Disimpan</span>`;
  }

  if (lastRecordedVideoUrl && videoPlayer) {
    videoPlayer.src = lastRecordedVideoUrl;
    videoPlayer.load();
    if (videoSection) videoSection.classList.remove('hidden');
    if (videoStatus) {
      videoStatus.textContent = '✅ Rekaman Selesai (Video + Audio HD)';
      videoStatus.className = 'text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold';
    }
  } else if (videoStatus) {
    videoStatus.textContent = '✅ Rekaman Siap';
    videoStatus.className = 'text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold';
  }
}

function closeWinnerCelebration() {
  if (celebrationAutoStopTimer) {
    clearTimeout(celebrationAutoStopTimer);
    celebrationAutoStopTimer = null;
  }

  // PEREKAMAN BERHENTI SAAT POPUP PEMENANG BERHENTI/DITUTUP
  if (isDrawRecordingActive()) {
    stopCelebrationCanvasAnimation();
    stopDrawRecording(function(videoBlob) {
      attachRecordedVideoToPopup(videoBlob);
    });
  } else {
    stopCelebrationCanvasAnimation();
  }

  const videoPlayer = document.getElementById('celeb-video-player');
  if (videoPlayer) {
    videoPlayer.pause();
  }
  document.getElementById('modal-winner-celebration').classList.add('hidden');
}

// Unduh file video rekaman pengundian
function downloadDrawVideo() {
  if (!lastRecordedVideoBlob) {
    alert("Video rekaman belum siap atau tidak didukung peramban Anda.");
    return;
  }
  const cleanName = (activeCelebrationWinner ? activeCelebrationWinner.name : 'Pemenang').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Rekaman_Undian_Bulan_${appState.currentPeriod}_Slot_${activeCelebrationWinner ? activeCelebrationWinner.wonSlot : '1'}_${cleanName}.webm`;
  
  const a = document.createElement('a');
  a.href = lastRecordedVideoUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Bagikan kabar video ke WhatsApp
function shareDrawVideoWA() {
  if (!activeCelebrationWinner) return;
  const w = activeCelebrationWinner;
  const text =
`🎥 *BUKTI REKAMAN PENGUNDIAN RESMI ARISAN RUMAH BOLON* 🏛️
----------------------------------------------------
Periode: *Bulan ke-${appState.currentPeriod}*
Tanggal: ${w.wonDate || formatIndonesianDate(new Date())}

🏆 *SELAMAT KEPADA PEMENANG KE-#${w.wonSlot}:*
🌟 *${w.name}* 🌟

📋 *Rincian Penerimaan Hadiah:*
• Hak Kotor Arisan : Rp 1.200.000
• Potongan Kas Rumah Bolon : - Rp 200.000
💰 *TOTAL DITERIMA BERSIH:* *Rp 1.000.000*

🎉 Proses pengundian telah direkam secara transparan dan sah menggunakan Roda Undian Rumah Bolon.

Pengurus Arisan Rumah Bolon`;

  const targetPhone = (w.phone || '').replace(/[^0-9]/g, '');
  const url = targetPhone.length >= 8 
    ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(text)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

  window.open(url, '_blank');
}

function viewActiveWinnerReceipt() {
  if (!activeCelebrationWinner) return;
  const slot = activeCelebrationWinner.wonSlot || 1;
  closeWinnerCelebration();
  openReceiptModal(slot);
}

// Confetti Bertingkat Multi-Ledakan Spektakuler
function triggerCelebrationConfetti() {
  if (typeof confetti === 'function') {
    // 1. Ledakan Kiri
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { x: 0.2, y: 0.6 },
      colors: ['#e6a817', '#800000', '#9e1212', '#ffffff', '#22c55e']
    });
    // 2. Ledakan Kanan
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { x: 0.8, y: 0.6 },
      colors: ['#e6a817', '#800000', '#9e1212', '#ffffff', '#22c55e']
    });
    // 3. Hujan Emas dari Tengah Atas
    setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 100,
        origin: { x: 0.5, y: 0.25 },
        colors: ['#fed766', '#e6a817', '#ffffff']
      });
    }, 280);
  }
}

// ==========================================
// 7. KELOLA DATA 36 PESERTA
// ==========================================
function openEditParticipant(id) {
  if (!currentSession || currentSession.role !== ROLES.OPERATOR) {
    alert("Akses Ditolak: Hanya Operator yang berwenang mengubah data peserta!");
    return;
  }
  const p = appState.participants.find(item => item.id === id);
  if (!p) return;

  document.getElementById('edit-participant-id').value = p.id;
  document.getElementById('edit-participant-number').value = `Nomor Urut #${p.id}`;
  document.getElementById('edit-participant-name').value = p.name;
  document.getElementById('edit-participant-phone').value = p.phone || '';

  document.getElementById('modal-edit-participant').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('modal-edit-participant').classList.add('hidden');
}

function saveParticipantEdit(event) {
  event.preventDefault();
  if (!currentSession || currentSession.role !== ROLES.OPERATOR) {
    alert("Akses Ditolak: Hanya Operator yang berwenang mengubah data peserta!");
    return;
  }
  const id = parseInt(document.getElementById('edit-participant-id').value, 10);
  const name = document.getElementById('edit-participant-name').value.trim();
  const phone = document.getElementById('edit-participant-phone').value.trim();

  if (!name) {
    alert("Nama peserta tidak boleh kosong!");
    return;
  }

  const pIndex = appState.participants.findIndex(p => p.id === id);
  if (pIndex !== -1) {
    appState.participants[pIndex].name = name;
    appState.participants[pIndex].phone = phone;
    
    // Sinkronkan juga jika peserta ada di pemenang bulan aktif
    const curWinIdx = appState.currentMonthWinners.findIndex(w => w.id === id);
    if (curWinIdx !== -1) {
      appState.currentMonthWinners[curWinIdx].name = name;
      appState.currentMonthWinners[curWinIdx].phone = phone;
    }
  }

  saveState();
  closeEditModal();
  renderAll();
  alert("Data peserta berhasil diperbarui!");
}

// Backup & Restore
function exportDataJSON() {
  exportDatabaseJSON();
}

function importDataJSON(event) {
  handleDatabaseFileSelected(event);
}

// ==========================================
// 7.5. PUSAT DATABASE & FITUR INSERT DATABASE
// ==========================================
function openDatabaseModal() {
  const modal = document.getElementById('modal-database-manager');
  if (!modal) return;

  const isOperator = currentSession && currentSession.role === ROLES.OPERATOR;
  const insertSection = document.getElementById('db-insert-section');
  const resetBtn = document.getElementById('db-reset-clean-btn');
  const opOnlyNote = document.getElementById('db-operator-only-note');

  if (insertSection) {
    if (!isOperator) insertSection.classList.add('opacity-50', 'pointer-events-none');
    else insertSection.classList.remove('opacity-50', 'pointer-events-none');
  }
  if (resetBtn) {
    if (!isOperator) resetBtn.classList.add('hidden');
    else resetBtn.classList.remove('hidden');
  }
  if (opOnlyNote) {
    if (!isOperator) opOnlyNote.classList.remove('hidden');
    else opOnlyNote.classList.add('hidden');
  }

  updateDatabaseModalStats();
  modal.classList.remove('hidden');
}

function closeDatabaseModal() {
  const modal = document.getElementById('modal-database-manager');
  if (modal) modal.classList.add('hidden');
}

function updateDatabaseModalStats() {
  const pCount = appState.participants ? appState.participants.length : 36;
  const elPCount = document.getElementById('db-stat-peserta-count');
  if (elPCount) elPCount.textContent = `${pCount} Baris`;

  const kCount = appState.kasLedger ? appState.kasLedger.length : 0;
  const elKCount = document.getElementById('db-stat-kas-count');
  if (elKCount) elKCount.textContent = `${kCount} Transaksi`;

  const curPeriod = appState.currentPeriod || 1;
  const payments = appState.monthlyPayments && appState.monthlyPayments[curPeriod] ? appState.monthlyPayments[curPeriod] : {};
  let paidCount = 0;
  if (appState.participants) {
    appState.participants.forEach(p => { if (payments[p.id]) paidCount++; });
  }
  const elICount = document.getElementById('db-stat-iuran-count');
  if (elICount) elICount.textContent = `Bulan ${curPeriod}: ${paidCount}/${pCount}`;

  const wonCount = appState.participants ? appState.participants.filter(p => p.wonPeriod).length : 0;
  const elWCount = document.getElementById('db-stat-pemenang-count');
  if (elWCount) elWCount.textContent = `${wonCount} dari 36`;

  const isServer = typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http');
  const elEngineBadge = document.getElementById('db-engine-badge');
  if (elEngineBadge) {
    if (typeof window !== 'undefined' && window.indexedDB) {
      elEngineBadge.className = 'px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5';
      elEngineBadge.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> IndexedDB Aktif`;
    } else {
      elEngineBadge.className = 'px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1.5';
      elEngineBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-amber-400"></i> LocalStorage Fallback`;
    }
  }

  const elServerBadge = document.getElementById('db-server-badge');
  if (elServerBadge) {
    if (isServer) {
      elServerBadge.className = 'px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1.5';
      elServerBadge.innerHTML = `<i class="fa-solid fa-server text-blue-400"></i> Server Disk Sync (arisan_db.json)`;
    } else {
      elServerBadge.className = 'px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5';
      elServerBadge.innerHTML = `<i class="fa-solid fa-file-code text-slate-400"></i> Mode Mandiri File Browser`;
    }
  }
}

function updateDatabaseStatusUI(isOnline) {
  const badge = document.getElementById('db-server-badge');
  if (badge && typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
    if (isOnline) {
      badge.className = 'px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1.5';
      badge.innerHTML = `<i class="fa-solid fa-server text-blue-400"></i> Server Disk Sync (arisan_db.json)`;
    } else {
      badge.className = 'px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1.5';
      badge.innerHTML = `<i class="fa-solid fa-cloud-slash text-amber-400"></i> Server Offline (Local DB Aktif)`;
    }
  }
}

function triggerInsertDatabaseFile() {
  if (!currentSession || currentSession.role !== ROLES.OPERATOR) {
    alert("Akses Ditolak: Hanya Operator yang berwenang melakukan Insert / Impor Database!");
    return;
  }
  const input = document.getElementById('db-insert-file-input');
  if (input) {
    input.value = '';
    input.click();
  }
}

function handleDatabaseFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!currentSession || currentSession.role !== ROLES.OPERATOR) {
    alert("Akses Ditolak: Hanya Operator yang berwenang melakukan Insert / Impor Database!");
    e.target.value = '';
    return;
  }

  const fileName = file.name.toLowerCase();
  const reader = new FileReader();

  reader.onload = function(evt) {
    try {
      const content = evt.target.result;
      if (fileName.endsWith('.json') || content.trim().startsWith('{')) {
        const parsed = JSON.parse(content);
        processInsertDatabaseJSON(parsed, file.name);
      } else if (fileName.endsWith('.sql')) {
        processInsertDatabaseSQL(content, file.name);
      } else {
        alert("Format berkas tidak didukung! Gunakan format .JSON atau .SQL.");
      }
    } catch (err) {
      alert("Format berkas rusak atau gagal dibaca: " + err.message);
    }
    e.target.value = '';
  };

  reader.readAsText(file);
}

function processInsertDatabaseJSON(imported, fileName) {
  let targetState = null;
  let targetPins = null;

  if (imported.state && imported.state.participants) {
    targetState = imported.state;
    targetPins = imported.pins || null;
  } else if (imported.participants && imported.participants.length === TOTAL_PARTICIPANTS) {
    targetState = imported;
  } else {
    alert("Berkas database tidak valid! Database wajib memiliki 36 peserta Arisan Rumah Bolon.");
    return;
  }

  if (!confirm(`INSERT DATABASE DARI BERKAS:\n"${fileName}"?\n\nSemua data tabel (peserta, kas, iuran, pemenang) saat ini akan digantikan dengan data dari berkas database ini.`)) {
    return;
  }

  appState = targetState;
  if (targetPins) {
    try { localStorage.setItem(PINS_STORAGE_KEY, JSON.stringify(targetPins)); } catch(e){}
  }

  saveState();
  renderAll();
  updateDatabaseModalStats();
  closeDatabaseModal();

  // Kirim juga ke REST API server jika online
  if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
    fetch('/api/database/insert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: appState, pins: getStoredPins() })
    }).catch(() => {});
  }

  alert(`✔ SUKSES! Database baru berhasil disisipkan (Insert Database Berhasil).\n\n• Sumber: ${fileName}\n• Peserta: ${appState.participants.length} Orang\n• Saldo Kas: ${formatIDR(getKasBalance())}\n• Periode Aktif: Bulan ke-${appState.currentPeriod}`);
}

function processInsertDatabaseSQL(sqlText, fileName) {
  if (!confirm(`INSERT DATABASE DARI SKRIP SQL:\n"${fileName}"?\n\nSistem akan mengekstrak struktur dan rekaman peserta dari berkas SQL ini.`)) {
    return;
  }

  const nameRegex = /INSERT INTO tb_peserta [^;]*VALUES\s*\(\s*(\d+)\s*,\s*'([^']+)'\s*,\s*'([^']*)'/gi;
  let match;
  let updatedCount = 0;
  while ((match = nameRegex.exec(sqlText)) !== null) {
    const id = parseInt(match[1], 10);
    const name = match[2];
    const phone = match[3];
    const p = appState.participants.find(item => item.id === id);
    if (p) {
      p.name = name;
      p.phone = phone;
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    saveState();
    renderAll();
    updateDatabaseModalStats();
    closeDatabaseModal();
    alert(`✔ Sukses menyisipkan data dari skrip SQL!\n\nSebanyak ${updatedCount} data peserta berhasil diperbarui dari ${fileName}.`);
  } else {
    alert("Tidak ditemukan query INSERT tb_peserta yang cocok di dalam berkas SQL ini.");
  }
}

function exportDatabaseJSON() {
  const dbDump = {
    meta: {
      dbName: "ARISAN_RUMAH_BOLON_DATABASE",
      version: "3.0",
      exportedAt: new Date().toISOString(),
      exportUser: currentSession ? currentSession.userName : 'Pengurus',
      totalParticipants: TOTAL_PARTICIPANTS,
      currentPeriod: appState.currentPeriod,
      kasBalance: getKasBalance()
    },
    state: appState,
    pins: getStoredPins()
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dbDump, null, 2));
  const a = document.createElement('a');
  a.href = dataStr;
  a.download = `arisan-rumah-bolon-database-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function exportDatabaseSQL() {
  let sql = `-- ========================================================\n`;
  sql += `-- DUMP DATABASE RESMI: ARISAN RUMAH BOLON\n`;
  sql += `-- Diekspor pada: ${new Date().toLocaleString('id-ID')}\n`;
  sql += `-- Kompatibel dengan: SQLite, MySQL, DB Browser for SQLite\n`;
  sql += `-- ========================================================\n\n`;

  sql += `-- 1. TABEL PESERTA\n`;
  sql += `CREATE TABLE IF NOT EXISTS tb_peserta (\n`;
  sql += `  id INTEGER PRIMARY KEY,\n`;
  sql += `  nama TEXT NOT NULL,\n`;
  sql += `  phone TEXT,\n`;
  sql += `  won_period INTEGER,\n`;
  sql += `  won_slot INTEGER,\n`;
  sql += `  won_date TEXT\n`;
  sql += `);\n\n`;

  appState.participants.forEach(p => {
    const nameEsc = (p.name || '').replace(/'/g, "''");
    const phoneEsc = (p.phone || '').replace(/'/g, "''");
    const wonDateEsc = (p.wonDate || '').replace(/'/g, "''");
    sql += `INSERT INTO tb_peserta (id, nama, phone, won_period, won_slot, won_date) VALUES (${p.id}, '${nameEsc}', '${phoneEsc}', ${p.wonPeriod || 'NULL'}, ${p.wonSlot || 'NULL'}, ${wonDateEsc ? `'${wonDateEsc}'` : 'NULL'});\n`;
  });

  sql += `\n-- 2. TABEL BUKU KAS RUMAH BOLON\n`;
  sql += `CREATE TABLE IF NOT EXISTS tb_kas (\n`;
  sql += `  id TEXT PRIMARY KEY,\n`;
  sql += `  tanggal TEXT NOT NULL,\n`;
  sql += `  tipe TEXT NOT NULL,\n`;
  sql += `  nominal INTEGER NOT NULL,\n`;
  sql += `  keterangan TEXT,\n`;
  sql += `  saldo_setelah INTEGER\n`;
  sql += `);\n\n`;

  appState.kasLedger.forEach(k => {
    const idEsc = (k.id || '').replace(/'/g, "''");
    const dateEsc = (k.date || '').replace(/'/g, "''");
    const typeEsc = (k.type || '').replace(/'/g, "''");
    const descEsc = (k.desc || '').replace(/'/g, "''");
    sql += `INSERT INTO tb_kas (id, tanggal, tipe, nominal, keterangan, saldo_setelah) VALUES ('${idEsc}', '${dateEsc}', '${typeEsc}', ${k.amount || 0}, '${descEsc}', ${k.balanceAfter || 0});\n`;
  });

  sql += `\n-- 3. TABEL RIWAYAT 12 PERIODE\n`;
  sql += `CREATE TABLE IF NOT EXISTS tb_riwayat_periode (\n`;
  sql += `  periode INTEGER PRIMARY KEY,\n`;
  sql += `  tanggal TEXT,\n`;
  sql += `  kas_amount INTEGER,\n`;
  sql += `  is_finalized INTEGER\n`;
  sql += `);\n\n`;

  appState.history.forEach(h => {
    const dateEsc = (h.date || '').replace(/'/g, "''");
    sql += `INSERT INTO tb_riwayat_periode (periode, tanggal, kas_amount, is_finalized) VALUES (${h.period}, '${dateEsc}', ${h.kasAmount || 600000}, 1);\n`;
  });

  const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `arisan-rumah-bolon-schema-${new Date().toISOString().slice(0, 10)}.sql`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function resetDatabaseClean() {
  if (!currentSession || currentSession.role !== ROLES.OPERATOR) {
    alert("Akses Ditolak: Hanya Operator yang berwenang melakukan Reset Database!");
    return;
  }
  if (confirm("PERINGATAN KERAS: Apakah Anda yakin ingin mereset seluruh database ke kondisi awal bersih (36 peserta awal, kas Rp 0, periode 1)?")) {
    resetToDefaultState();
    saveState();
    renderAll();
    updateDatabaseModalStats();
    closeDatabaseModal();
    alert("✔ Database Arisan Rumah Bolon telah berhasil diinisialisasi ulang ke kondisi awal bersih.");
  }
}

function confirmResetCycle() {
  if (!currentSession || currentSession.role !== ROLES.OPERATOR) {
    alert("Akses Ditolak: Hanya Operator yang berwenang mereset siklus arisan!");
    return;
  }
  if (confirm("PERINGATAN: Apakah Anda yakin ingin mereset seluruh siklus kemenangan untuk memulai Siklus 1 Tahun yang baru? (Nama peserta akan tetap tersimpan, status menang akan dikembalikan ke awal).")) {
    appState.currentPeriod = 1;
    appState.currentMonthWinners = [];
    appState.monthlyPayments = { 1: {} };
    appState.history = [];
    appState.participants.forEach(p => {
      p.wonPeriod = null;
      p.wonSlot = null;
      p.wonDate = null;
    });
    saveState();
    renderAll();
    alert("Siklus baru Arisan Rumah Bolon berhasil dimulai!");
  }
}

// ==========================================
// 8. RENDERER & UI UPDATERS
// ==========================================
function renderAll() {
  applyRolePermissions();
  renderHeaderSummary();
  renderUndianTab();
  updateDurationUI();
  renderIuranTab();
  renderRiwayatTab();
  renderKasTab();
  renderPesertaTab();
  drawWheel();
}

// ==========================================
// PENGATURAN DURASI PUTARAN RODA
// ==========================================
function setSpinDuration(seconds) {
  if (!currentSession || currentSession.role !== ROLES.OPERATOR) {
    return;
  }
  const dur = Math.max(2, Math.min(30, parseInt(seconds, 10) || 5));
  appState.spinDuration = dur;
  saveState();
  updateDurationUI();
}

function onSpinSliderChange(val) {
  setSpinDuration(val);
}

function updateDurationUI() {
  const dur = appState.spinDuration || 5;
  const disp = document.getElementById('spin-duration-display');
  if (disp) disp.textContent = `${dur} Detik`;

  const slider = document.getElementById('spin-duration-slider');
  if (slider) slider.value = dur;

  const sliderLabel = document.getElementById('slider-val-label');
  if (sliderLabel) sliderLabel.textContent = `${dur}s`;

  // Highlight tombol preset yang cocok
  [3, 5, 8, 12].forEach(p => {
    const btn = document.getElementById(`duration-btn-${p}`);
    if (btn) {
      if (dur === p) {
        btn.className = 'duration-btn px-2.5 py-1 rounded-lg text-[11px] font-bold bg-bolon-gold text-slate-950 border border-bolon-gold transition shadow-sm';
      } else {
        btn.className = 'duration-btn px-2.5 py-1 rounded-lg text-[11px] font-bold bg-bolon-card hover:bg-slate-800 text-slate-300 border border-slate-700 transition';
      }
    }
  });
}

function renderHeaderSummary() {
  // Periode Badge
  const badgePeriod = document.getElementById('badge-periode');
  if (badgePeriod) {
    badgePeriod.textContent = `Bulan ke-${appState.currentPeriod} / 12`;
  }

  // Header Iuran Terkumpul
  const curPayments = appState.monthlyPayments[appState.currentPeriod] || {};
  let paidCount = 0;
  appState.participants.forEach(p => {
    if (curPayments[p.id]) paidCount++;
  });
  const collectedRp = paidCount * MONTHLY_FEE;
  const headerIuran = document.getElementById('header-iuran-collected');
  if (headerIuran) {
    headerIuran.textContent = `${formatIDR(collectedRp)} / 3.600.000`;
  }

  // Header Kas Total
  const headerKas = document.getElementById('header-kas-total');
  if (headerKas) {
    headerKas.textContent = formatIDR(getKasBalance());
  }

  // Header Pemenang Ratio
  const wonCount = appState.participants.filter(p => p.wonPeriod).length;
  const headerPemenang = document.getElementById('header-pemenang-ratio');
  if (headerPemenang) {
    headerPemenang.textContent = `${wonCount} / 36`;
  }

  // Tab Iuran Badge
  const unpaidCount = TOTAL_PARTICIPANTS - paidCount;
  const tabIuranBadge = document.getElementById('tab-iuran-badge');
  if (tabIuranBadge) {
    if (unpaidCount === 0) {
      tabIuranBadge.className = 'ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold';
      tabIuranBadge.textContent = '36 Lunas';
    } else {
      tabIuranBadge.className = 'ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-950 text-red-300 border border-red-800/60 font-bold';
      tabIuranBadge.textContent = `${unpaidCount} Belum`;
    }
  }
}

function renderUndianTab() {
  const isOperator = !!(currentSession && currentSession.role === ROLES.OPERATOR);
  const eligible = getEligibleParticipants();
  const eligibleCountElem = document.getElementById('eligible-count');
  if (eligibleCountElem) eligibleCountElem.textContent = eligible.length;

  const currentCount = appState.currentMonthWinners.length;
  const slotLabel = document.getElementById('active-slot-label');
  const spinBtnText = document.getElementById('btn-spin-single-text');
  const spinSingleBtn = document.getElementById('btn-spin-single');
  const spinAllBtn = document.getElementById('btn-spin-all');

  if (currentCount >= WINNERS_PER_MONTH) {
    if (slotLabel) slotLabel.textContent = "3 Slot Lengkap";
    if (spinBtnText) spinBtnText.textContent = "Periode Ini Sudah Lengkap";
    if (spinSingleBtn) spinSingleBtn.disabled = true;
    if (spinAllBtn) spinAllBtn.disabled = true;
  } else {
    const nextSlot = currentCount + 1;
    if (slotLabel) slotLabel.textContent = `Pemenang Ke-${nextSlot}`;
    if (spinBtnText) spinBtnText.textContent = `Putar Undian (Slot ${nextSlot})`;
    if (spinSingleBtn) spinSingleBtn.disabled = !isOperator;
    if (spinAllBtn) spinAllBtn.disabled = !isOperator;
  }

  // Progress Mini
  const totalWon = appState.participants.filter(p => p.wonPeriod).length;
  const miniProgText = document.getElementById('mini-progress-text');
  const miniProgBar = document.getElementById('mini-progress-bar');
  if (miniProgText) miniProgText.textContent = `${totalWon} / 36 Selesai`;
  if (miniProgBar) miniProgBar.style.width = `${(totalWon / 36) * 100}%`;

  // Undo button
  const undoBtn = document.getElementById('btn-undo-winner');
  if (undoBtn) {
    if (currentCount > 0 && isOperator) {
      undoBtn.disabled = false;
      undoBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
      undoBtn.disabled = true;
      undoBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
  }

  // Subtitle
  const winnersSub = document.getElementById('winners-subtitle');
  if (winnersSub) winnersSub.textContent = `Bulan ke-${appState.currentPeriod}: ${currentCount} dari 3 Pemenang`;

  // Render masing-masing dari 3 Slot Card
  for (let slot = 1; slot <= 3; slot++) {
    const card = document.getElementById(`slot-card-${slot}`);
    const nameElem = document.getElementById(`slot-name-${slot}`);
    const statusElem = document.getElementById(`slot-status-${slot}`);
    const detailsElem = document.getElementById(`slot-details-${slot}`);
    const winner = appState.currentMonthWinners[slot - 1];

    if (winner) {
      card.classList.add('won');
      nameElem.textContent = winner.name;
      nameElem.classList.remove('italic', 'text-slate-400');
      nameElem.classList.add('text-amber-300');

      statusElem.textContent = "PEMENANG";
      statusElem.className = "px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-slate-950 shadow-sm";

      detailsElem.classList.remove('hidden');
    } else {
      card.classList.remove('won');
      nameElem.textContent = "Belum diundi";
      nameElem.classList.add('italic', 'text-slate-400');
      nameElem.classList.remove('text-amber-300');

      statusElem.textContent = "KOSONG";
      statusElem.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400";

      detailsElem.classList.add('hidden');
    }
  }

  // Completion Badge & Tombol Kunci Periode
  const compBadge = document.getElementById('period-completion-badge');
  const nextPeriodBtn = document.getElementById('btn-next-period');
  if (currentCount === WINNERS_PER_MONTH) {
    if (compBadge) {
      compBadge.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse';
      compBadge.textContent = '3/3 Pemenang Lengkap • Siap Dibukukan';
    }
    if (nextPeriodBtn) {
      nextPeriodBtn.disabled = !isOperator;
      nextPeriodBtn.innerHTML = `<i class="fa-solid fa-lock text-bolon-gold"></i><span>Kunci Periode & Lanjut (Bukukan Kas Rp 600.000)</span>`;
    }
  } else {
    if (compBadge) {
      compBadge.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30';
      compBadge.textContent = `${currentCount} dari 3 Pemenang`;
    }
    if (nextPeriodBtn) {
      nextPeriodBtn.disabled = true;
      nextPeriodBtn.innerHTML = `<i class="fa-solid fa-lock"></i><span>Kunci Periode & Lanjut</span>`;
    }
  }
}

function renderIuranTab() {
  const curPeriod = appState.currentPeriod;
  const subTitle = document.getElementById('iuran-period-subtitle');
  if (subTitle) {
    subTitle.textContent = `Periode Bulan ke-${curPeriod} • Wajib Rp 100.000 / Peserta`;
  }

  const payments = appState.monthlyPayments[curPeriod] || {};
  let paidCount = 0;
  appState.participants.forEach(p => {
    if (payments[p.id]) paidCount++;
  });

  const collected = paidCount * MONTHLY_FEE;
  const unpaidCount = TOTAL_PARTICIPANTS - paidCount;

  const collDisplay = document.getElementById('iuran-collected-display');
  const unpDisplay = document.getElementById('iuran-unpaid-display');
  if (collDisplay) collDisplay.textContent = formatIDR(collected);
  if (unpDisplay) unpDisplay.textContent = `${unpaidCount} Peserta`;

  renderIuranGrid();
}

function renderIuranGrid() {
  const grid = document.getElementById('iuran-grid');
  if (!grid) return;

  const isBendahara = !!(currentSession && currentSession.role === ROLES.BENDAHARA);
  const curPeriod = appState.currentPeriod;
  const payments = appState.monthlyPayments[curPeriod] || {};
  const search = (document.getElementById('iuran-search-input')?.value || '').toLowerCase().trim();

  let html = '';
  appState.participants.forEach(p => {
    const isPaid = !!payments[p.id];

    // Filter status
    if (currentIuranFilter === 'paid' && !isPaid) return;
    if (currentIuranFilter === 'unpaid' && isPaid) return;

    // Search query
    if (search && !p.name.toLowerCase().includes(search) && !String(p.id).includes(search)) {
      return;
    }

    html += `
      <div class="p-3.5 rounded-xl border transition flex items-center justify-between ${isPaid ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60' : 'bg-bolon-card border-bolon-border hover:border-slate-600'}">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isPaid ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}">
            ${p.id}
          </div>
          <div>
            <div class="text-xs sm:text-sm font-semibold text-slate-200">${p.name}</div>
            <div class="text-[10px] text-slate-400">Rp 100.000 / bln</div>
          </div>
        </div>
        <button ${isBendahara ? `onclick="toggleIuranPayment(${p.id})"` : 'disabled title="Hanya Bendahara yang berwenang menandai status iuran"'} class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${!isBendahara ? 'opacity-70 cursor-not-allowed ' : ''}${isPaid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-bolon-dark text-slate-400 border border-slate-700 hover:text-white hover:border-slate-500'}">
          <i class="fa-solid ${isPaid ? 'fa-circle-check text-emerald-400' : 'fa-circle text-slate-600'}"></i>
          <span>${isPaid ? 'LUNAS' : 'BELUM'}</span>
        </button>
      </div>
    `;
  });

  if (html === '') {
    html = `<div class="col-span-full py-8 text-center text-xs text-slate-500">Tidak ada data peserta yang cocok dengan pencarian/filter.</div>`;
  }

  grid.innerHTML = html;
}

function renderRiwayatTab() {
  const tbody = document.getElementById('history-table-body');
  if (!tbody) return;

  let html = '';
  for (let month = 1; month <= 12; month++) {
    const record = appState.history.find(h => h.period === month);
    const isCurrent = month === appState.currentPeriod;

    if (record) {
      const winnersList = record.winners.map(w => 
        `<span class="inline-block bg-slate-900 border border-bolon-gold/30 px-2 py-0.5 rounded text-[11px] text-amber-200 mr-1 mb-1 font-medium">
          #${w.wonSlot} ${w.name}
        </span>`
      ).join('');

      html += `
        <tr class="hover:bg-bolon-card">
          <td class="py-3 px-4 font-bold text-amber-300">Bulan ke-${month}</td>
          <td class="py-3 px-4 text-slate-400">${record.date}</td>
          <td class="py-3 px-4">${winnersList}</td>
          <td class="py-3 px-4 text-right font-bold text-emerald-400">${formatIDR(record.kasAmount)}</td>
          <td class="py-3 px-4 text-center">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              SELESAI
            </span>
          </td>
          <td class="py-3 px-4 text-center">
            <button onclick="viewHistoricalPeriod(${month})" class="text-xs text-bolon-gold hover:underline">Lihat</button>
          </td>
        </tr>
      `;
    } else if (isCurrent) {
      const currentList = appState.currentMonthWinners.map(w => 
        `<span class="inline-block bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[11px] text-slate-300 mr-1 mb-1">
          #${w.wonSlot} ${w.name}
        </span>`
      ).join('') || '<i class="text-slate-500">Sedang berlangsung...</i>';

      const isReadyToLock = appState.currentMonthWinners.length === WINNERS_PER_MONTH;
      const kasStatusText = isReadyToLock 
        ? '<span class="text-amber-300 font-bold">Rp 600.000 (Siap Dibukukan)</span>'
        : '<span class="text-slate-400">Rp 600.000 (Target)</span>';
      
      const badgeStatus = isReadyToLock
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">SIAP DIBUKUKAN</span>'
        : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">AKTIF</span>';

      html += `
        <tr class="bg-bolon-gold/5 border-l-4 border-l-bolon-gold">
          <td class="py-3 px-4 font-bold text-bolon-gold">Bulan ke-${month} (Aktif)</td>
          <td class="py-3 px-4 text-slate-400">${isReadyToLock ? '3 Pemenang Siap' : '-'}</td>
          <td class="py-3 px-4">${currentList}</td>
          <td class="py-3 px-4 text-right">${kasStatusText}</td>
          <td class="py-3 px-4 text-center">
            ${badgeStatus}
          </td>
          <td class="py-3 px-4 text-center">
            <button onclick="switchTab('undian')" class="text-xs text-emerald-400 hover:underline font-bold">
              ${isReadyToLock ? 'Kunci & Bukukan' : 'Undi'}
            </button>
          </td>
        </tr>
      `;
    } else {
      html += `
        <tr class="opacity-40">
          <td class="py-3 px-4 text-slate-500">Bulan ke-${month}</td>
          <td class="py-3 px-4 text-slate-500">-</td>
          <td class="py-3 px-4 text-slate-500 italic">Belum dibuka</td>
          <td class="py-3 px-4 text-right text-slate-500">-</td>
          <td class="py-3 px-4 text-center">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-slate-500">
              MENUNGGU
            </span>
          </td>
          <td class="py-3 px-4 text-center text-slate-600">-</td>
        </tr>
      `;
    }
  }

  tbody.innerHTML = html;
}

function viewHistoricalPeriod(month) {
  const record = appState.history.find(h => h.period === month);
  if (!record) return;
  alert(
    `RIWAYAT BULAN KE-${month}\n` +
    `Tanggal: ${record.date}\n` +
    `Pemenang:\n` +
    record.winners.map(w => `• #${w.wonSlot} ${w.name} (Terima Rp 1.000.000)`).join('\n') +
    `\n\nKas Resmi Dibukukan ke Rumah Bolon: Rp 600.000`
  );
}

function renderKasTab() {
  const isBendahara = !!(currentSession && currentSession.role === ROLES.BENDAHARA);
  const balance = getKasBalance();
  let totalIn = 0;
  let totalOut = 0;

  appState.kasLedger.forEach(entry => {
    if (entry.type === 'in') totalIn += entry.amount;
    else totalOut += entry.amount;
  });

  const balElem = document.getElementById('kas-balance-display');
  const inElem = document.getElementById('kas-in-display');
  const outElem = document.getElementById('kas-out-display');

  if (balElem) balElem.textContent = formatIDR(balance);
  if (inElem) inElem.textContent = formatIDR(totalIn);
  if (outElem) outElem.textContent = formatIDR(totalOut);

  // Tabel Mutasi
  const tbody = document.getElementById('kas-table-body');
  if (!tbody) return;

  if (appState.kasLedger.length === 0) {
    const curWinners = appState.currentMonthWinners.length;
    let note = "Belum ada mutasi buku kas Rumah Bolon.";
    if (curWinners === WINNERS_PER_MONTH) {
      note += " Bulan ke-" + appState.currentPeriod + " sudah memiliki 3 pemenang. Silakan klik tombol 'Kunci Periode & Lanjut' di tab Roda Undian untuk membukukan Kas Rp 600.000.";
    } else {
      note += " Kas arisan Rp 600.000 akan resmi dibukukan setelah 3 pemenang diundi dan tombol 'Kunci Periode & Lanjut' diklik.";
    }
    tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400 italic">${note}</td></tr>`;
    return;
  }

  let html = '';
  appState.kasLedger.forEach(entry => {
    const isIn = entry.type === 'in';
    html += `
      <tr class="hover:bg-bolon-card">
        <td class="py-2.5 px-3 text-slate-400 whitespace-nowrap">${entry.date}</td>
        <td class="py-2.5 px-3 text-slate-200">${entry.desc}</td>
        <td class="py-2.5 px-3 text-right font-semibold ${isIn ? 'text-emerald-400' : 'text-slate-600'}">
          ${isIn ? formatIDR(entry.amount) : '-'}
        </td>
        <td class="py-2.5 px-3 text-right font-semibold ${!isIn ? 'text-red-400' : 'text-slate-600'}">
          ${!isIn ? formatIDR(entry.amount) : '-'}
        </td>
        <td class="py-2.5 px-3 text-right font-bold text-amber-300">
          ${formatIDR(entry.balanceAfter)}
        </td>
        <td class="py-2.5 px-2 text-center">
          ${isBendahara ? `
          <button onclick="deleteKasEntry('${entry.id}')" class="text-slate-500 hover:text-red-400 p-1" title="Hapus catatan">
            <i class="fa-solid fa-trash text-[11px]"></i>
          </button>
          ` : `
          <span class="text-slate-600 text-xs">-</span>
          `}
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function renderPesertaTab() {
  const isOperator = !!(currentSession && currentSession.role === ROLES.OPERATOR);
  const tbody = document.getElementById('participants-table-body');
  if (!tbody) return;

  let html = '';
  appState.participants.forEach(p => {
    const hasWon = !!p.wonPeriod;
    html += `
      <tr class="hover:bg-bolon-card ${hasWon ? 'bg-amber-950/10' : ''}">
        <td class="py-3 px-3 text-center font-bold text-slate-400">${p.id}</td>
        <td class="py-3 px-4 font-semibold text-slate-200">${p.name}</td>
        <td class="py-3 px-4 text-slate-400">${p.phone || '-'}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${hasWon ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'}">
            ${hasWon ? `SUDAH MENANG (#${p.wonSlot})` : 'BELUM'}
          </span>
        </td>
        <td class="py-3 px-4 text-center font-bold ${hasWon ? 'text-amber-300' : 'text-slate-600'}">
          ${hasWon ? `Bulan ke-${p.wonPeriod}` : '-'}
        </td>
        <td class="py-3 px-3 text-center">
          ${isOperator ? `
          <button onclick="openEditParticipant(${p.id})" class="px-2.5 py-1 rounded-lg bg-bolon-dark hover:bg-slate-800 border border-slate-700 text-bolon-gold text-xs font-semibold">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          ` : `
          <span class="text-xs text-slate-500 italic"><i class="fa-solid fa-lock text-[10px]"></i> Read-only</span>
          `}
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ==========================================
// 9. HELPER TAB NAVIGATION & FORMATTER
// ==========================================
function switchTab(tabId) {
  const tabs = ['undian', 'iuran', 'riwayat', 'kas', 'peserta'];
  tabs.forEach(t => {
    const content = document.getElementById(`tab-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (t === tabId) {
      content.classList.remove('hidden');
      content.classList.add('block');
      btn.classList.add('active');
    } else {
      content.classList.add('hidden');
      content.classList.remove('block');
      btn.classList.remove('active');
    }
  });

  if (tabId === 'undian') {
    setTimeout(drawWheel, 50);
  }
}

function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

function formatIndonesianDate(d) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Window load bootstrap
window.addEventListener('DOMContentLoaded', () => {
  initApp();
});
