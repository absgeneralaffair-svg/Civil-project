// APP JS FOR PT. ARTA BUMI SAKTI - Civil Construction Dashboard

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWOUNQ3xMxzYWC1bhpV0Olndc1rjjt0xk",
  authDomain: "hrgacivil-project.firebaseapp.com",
  projectId: "hrgacivil-project",
  storageBucket: "hrgacivil-project.firebasestorage.app",
  messagingSenderId: "730607112425",
  appId: "1:730607112425:web:b4dd806e8488bcc7be6078",
  measurementId: "G-X9ZWVRHGSH"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 1. STATE & MOCK DATA INITIALIZATION
const DEFAULT_PROJECT_NAME = "Pembangunan Gedung Perkantoran Modern PT. ARTA BUMI SAKTI";

// Level 1: Kategori Pekerjaan
const INITIAL_FASES = [
    { id: "f-1", nama: "Pekerjaan Persiapan & Mobilisasi", klasifikasi: "Project Baru", mulai: "2026-05-01", selesai: "2026-05-10" },
    { id: "f-2", nama: "Pekerjaan Galian & Pondasi Bored Pile", klasifikasi: "Project Baru", mulai: "2026-05-11", selesai: "2026-05-31" },
    { id: "f-3", nama: "Pekerjaan Struktur Beton Balok & Plat Lt.1", klasifikasi: "Project Baru", mulai: "2026-06-01", selesai: "2026-07-15" },
    { id: "f-4", nama: "Pekerjaan MEP (Mekanis, Elektrikal, Plambing)", klasifikasi: "Project Baru", mulai: "2026-06-15", selesai: "2026-08-15" },
    { id: "f-5", nama: "Pekerjaan Finishing & Arsitektur Lt.1", klasifikasi: "Maintenance", mulai: "2026-07-01", selesai: "2026-09-30" }
];

// Level 2: Sub-Pekerjaan
const INITIAL_SUB_PEKERJAAN = [
    // Under f-1
    { id: "sp-1", faseId: "f-1", nama: "Pekerjaan Mobilisasi & Demobilisasi", progres: 100, target: 100 },
    { id: "sp-2", faseId: "f-1", nama: "Pembuatan Sarana Lapangan & Direksi Keet", progres: 100, target: 100 },
    
    // Under f-2
    { id: "sp-3", faseId: "f-2", nama: "Pekerjaan Galian Tanah Pondasi", progres: 100, target: 100 },
    { id: "sp-4", faseId: "f-2", nama: "Fabrikasi Besi & Pengecoran Bored Pile", progres: 100, target: 100 },
    
    // Under f-3
    { id: "sp-5", faseId: "f-3", nama: "Pekerjaan Bekisting & Pembesian Struktur Lt.1", progres: 55, target: 65 },
    { id: "sp-6", faseId: "f-3", nama: "Pengecoran Ready Mix Beton Lt.1", progres: 25, target: 30 },
    
    // Under f-4
    { id: "sp-7", faseId: "f-4", nama: "Instalasi Pemipaan Air Bersih & Kotor", progres: 20, target: 30 },
    { id: "sp-8", faseId: "f-4", nama: "Instalasi Kabel Listrik & Penerangan Utama", progres: 0, target: 0 },
    
    // Under f-5
    { id: "sp-9", faseId: "f-5", nama: "Pekerjaan Dinding Bata & Plesteran", progres: 0, target: 10 },
    { id: "sp-10", faseId: "f-5", nama: "Pekerjaan Pengecatan Dasar & Finishing", progres: 0, target: 0 }
];

// Level 3: Rincian Anggaran (Bahan terhubung ke material gudang via materialId)
const INITIAL_RAB = [
    // Under sp-1 (Mobilisasi & Demobilisasi)
    { id: "r-1", subPekerjaanId: "sp-1", tipe: "Jasa", nama: "Sewa Mobil Trailer Angkut Excavator", materialId: null, satuan: "Unit", volume: 2, harga: 4000000, realisasi: 8000000 },
    { id: "r-2", subPekerjaanId: "sp-1", tipe: "Jasa", nama: "Ongkos Bongkar Muat Alat Berat", materialId: null, satuan: "Lsf", volume: 1, harga: 2000000, realisasi: 2000000 },
    
    // Under sp-2 (Sarana & Direksi Keet)
    { id: "r-3", subPekerjaanId: "sp-2", tipe: "Bahan", nama: "Semen Portland 50kg (Gresik)", materialId: "s-1", satuan: "Zak", volume: 20, harga: 75000, realisasi: 1500000 },
    { id: "r-4", subPekerjaanId: "sp-2", tipe: "Jasa", nama: "Pembuatan Direksi Keet Kayu", materialId: null, satuan: "m2", volume: 15, harga: 400000, realisasi: 6000000 },
    
    // Under sp-3 (Galian Tanah)
    { id: "r-5", subPekerjaanId: "sp-3", tipe: "Jasa", nama: "Upah Kerja Galian Tanah Manual", materialId: null, satuan: "m3", volume: 50, harga: 150000, realisasi: 7500000 },
    
    // Under sp-4 (Bored Pile)
    { id: "r-6", subPekerjaanId: "sp-4", tipe: "Bahan", nama: "Besi Ulir D16 (KS)", materialId: "s-2", satuan: "Batang", volume: 400, harga: 185000, realisasi: 74000000 },
    { id: "r-7", subPekerjaanId: "sp-4", tipe: "Bahan", nama: "Ready Mix Concrete K-350", materialId: "s-3", satuan: "m3", volume: 30, harga: 1200000, realisasi: 36000000 },
    
    // Under sp-5 (Bekisting & Pembesian Struktur Lt.1)
    { id: "r-8", subPekerjaanId: "sp-5", tipe: "Bahan", nama: "Besi Ulir D16 (KS)", materialId: "s-2", satuan: "Batang", volume: 400, harga: 185000, realisasi: 45000000 },
    { id: "r-9", subPekerjaanId: "sp-5", tipe: "Jasa", nama: "Upah Tukang Pembesian & Bekisting", materialId: null, satuan: "Lsf", volume: 1, harga: 30000000, realisasi: 18000000 },
    
    // Under sp-6 (Pengecoran Lt.1)
    { id: "r-10", subPekerjaanId: "sp-6", tipe: "Bahan", nama: "Ready Mix Concrete K-350", materialId: "s-3", satuan: "m3", volume: 80, harga: 1200000, realisasi: 28800000 },
    
    // Under sp-7 (MEP Air)
    { id: "r-11", subPekerjaanId: "sp-7", tipe: "Jasa", nama: "Upah Subkon Instalasi Plumbing", materialId: null, satuan: "Lsf", volume: 1, harga: 20000000, realisasi: 5000000 },
    { id: "r-12", subPekerjaanId: "sp-7", tipe: "Jasa", nama: "Pengadaan Pipa PVC 2 & 4 Inch", materialId: null, satuan: "Batang", volume: 150, harga: 120000, realisasi: 10000000 },

    // Under sp-8 (MEP Listrik)
    { id: "r-13", subPekerjaanId: "sp-8", tipe: "Jasa", nama: "Upah Kerja Instalasi Listrik", materialId: null, satuan: "Lsf", volume: 1, harga: 15000000, realisasi: 0 },
    { id: "r-14", subPekerjaanId: "sp-8", tipe: "Jasa", nama: "Kabel NYM 3x2.5mm Suprema", materialId: null, satuan: "Roll", volume: 10, harga: 950000, realisasi: 0 },

    // Under sp-9 (Dinding Bata)
    { id: "r-15", subPekerjaanId: "sp-9", tipe: "Jasa", nama: "Pengadaan Bata Ringan / Hebel", materialId: null, satuan: "m3", volume: 40, harga: 750000, realisasi: 0 },
    { id: "r-16", subPekerjaanId: "sp-9", tipe: "Bahan", nama: "Semen Portland 50kg (Gresik)", materialId: "s-1", satuan: "Zak", volume: 120, harga: 75000, realisasi: 0 },

    // Under sp-10 (Finishing Paint)
    { id: "r-17", subPekerjaanId: "sp-10", tipe: "Jasa", nama: "Cat Tembok Weathershield Dulux", materialId: null, satuan: "Pail", volume: 12, harga: 1800000, realisasi: 0 }
];

const INITIAL_STOK = [
    { id: "s-1", kode: "PN-001", nama: "Semen Portland 50kg (Gresik)", stok: 350, min: 50, satuan: "Zak", gudang: "Gudang Utama A" },
    { id: "s-2", kode: "PN-002", nama: "Besi Ulir D16 (KS)", stok: 180, min: 30, satuan: "Batang", gudang: "Stockyard Barat" },
    { id: "s-3", kode: "PN-003", nama: "Ready Mix Concrete K-350", stok: 75, min: 10, satuan: "m3", gudang: "Transit Site Mixer" },
    { id: "s-4", kode: "PN-004", nama: "Pasir Beton Kasar", stok: 8, min: 15, satuan: "m3", gudang: "Stockyard Timur" },
    { id: "s-5", kode: "PN-005", nama: "Kerikil / Batu Pecah 2/3", stok: 0, min: 10, satuan: "m3", gudang: "Stockyard Timur" }
];

const INITIAL_PENGGUNAAN = [
    { id: "p-1", tanggal: "2026-05-15", materialId: "s-1", jumlah: 20, faseId: "f-1", subPekerjaanId: "sp-2", penerima: "Pak Joko (Mandor Persiapan)", keterangan: "Pengecoran gudang lapangan sementara" },
    { id: "p-2", tanggal: "2026-06-02", materialId: "s-2", jumlah: 120, faseId: "f-3", subPekerjaanId: "sp-5", penerima: "Pak Tono (Mandor Besi)", keterangan: "Pembesian kolom Lt.1" },
    { id: "p-3", tanggal: "2026-06-05", materialId: "s-3", jumlah: 24, faseId: "f-3", subPekerjaanId: "sp-6", penerima: "Pak Tono (Mandor Cor)", keterangan: "Pengecoran balok zona A Lt.1" }
];

const INITIAL_MASUK = [
    { id: "m-1", tanggal: "2026-05-10", materialId: "s-1", jumlah: 400, mr: "MR-2026-001", pr: "PR-2026-001", keperluan: "Stok awal persiapan proyek" }
];

const INITIAL_ORDERS = [
    { id: "o-1", tanggal: "2026-06-15", mr: "MR-2026-002", pr: "PR-2026-002", partnumber: "PN-005", nama: "Kerikil / Batu Pecah 2/3", qty: 50, satuan: "m3", keperluan: "Persiapan cor", remark: "Segera follow up ke supplier" }
];

// Sync flags
let hasSyncedWithCloud = false;
let currentAppPassword = localStorage.getItem("arta_app_password") || "admin123";

// Load states (null default to prevent overwrite before sync)
let projectName = localStorage.getItem("arta_project_name") || null;
let fases = JSON.parse(localStorage.getItem("arta_fases")) || null;
let subPekerjaan = JSON.parse(localStorage.getItem("arta_sub_pekerjaan")) || null;
let rab = JSON.parse(localStorage.getItem("arta_rab")) || null;
let stok = JSON.parse(localStorage.getItem("arta_stok")) || null;
let penggunaan = JSON.parse(localStorage.getItem("arta_penggunaan")) || null;
let barangMasuk = JSON.parse(localStorage.getItem("arta_masuk")) || null;
let ordersData = JSON.parse(localStorage.getItem("arta_orders")) || null;

// --- BACKWARD COMPATIBILITY DATA MIGRATION ---
function runLegacyMigration() {
    if (!subPekerjaan || !rab) return;
    let hasMigrated = false;
    subPekerjaan.forEach(sub => {
        if (sub.progres > 0 || sub.target > 0) {
            const subItems = rab.filter(item => item.subPekerjaanId === sub.id);
            const totalItems = subItems.length;
            if (totalItems > 0) {
                const allZero = subItems.every(item => !item.progres && !item.target);
                if (allZero) {
                    subItems.forEach(item => {
                        item.progres = sub.progres;
                        item.target = sub.target;
                    });
                    hasMigrated = true;
                }
            }
        }
    });
    if (hasMigrated) {
        localStorage.setItem("arta_rab", JSON.stringify(rab));
    }
}
// ----------------------------------------------

// Accordion open rows tracking
const expandedRows = new Set(["f-1", "f-2", "f-3"]);

function saveState() {
    if (!fases || !subPekerjaan) return; // Mencegah save data kosong

    // Save to LocalStorage as offline fallback
    localStorage.setItem("arta_project_name", projectName || DEFAULT_PROJECT_NAME);
    localStorage.setItem("arta_fases", JSON.stringify(fases));
    localStorage.setItem("arta_sub_pekerjaan", JSON.stringify(subPekerjaan));
    localStorage.setItem("arta_rab", JSON.stringify(rab));
    localStorage.setItem("arta_stok", JSON.stringify(stok));
    localStorage.setItem("arta_penggunaan", JSON.stringify(penggunaan));
    localStorage.setItem("arta_masuk", JSON.stringify(barangMasuk));
    localStorage.setItem("arta_orders", JSON.stringify(ordersData));
    localStorage.setItem("arta_app_password", currentAppPassword);

    if (typeof isInitialLoad !== 'undefined' && isInitialLoad) {
        console.warn("Mencegah save ke Cloud karena data awal belum termuat dari sinkronisasi server.");
        return;
    }

    if (!hasSyncedWithCloud) {
        console.warn("Mencegah save ke Cloud: Belum tersinkronisasi dengan Firebase.");
        return;
    }

    // Sync to Firebase Firestore
    try {
        const dot = document.getElementById("network-dot");
        const txt = document.getElementById("network-text");
        
        // Timeout to reset UI if Firebase hangs
        let timeoutId;
        if(dot && txt && navigator.onLine) {
            dot.style.background = "var(--accent-orange)";
            dot.style.boxShadow = "0 0 10px var(--accent-orange)";
            txt.textContent = "Menyimpan ke Cloud...";
            
            timeoutId = setTimeout(() => {
                if(txt.textContent === "Menyimpan ke Cloud...") {
                    dot.style.background = "var(--accent-red)";
                    dot.style.boxShadow = "0 0 10px var(--accent-red)";
                    txt.textContent = "Gagal (Database belum aktif?)";
                    txt.style.color = "var(--accent-red)";
                }
            }, 5000); // 5 seconds timeout for UI
        }

        db.collection('projects').doc('main-project').set({
            projectName, fases, subPekerjaan, rab, stok, penggunaan, barangMasuk, ordersData, appPassword: currentAppPassword,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            if(timeoutId) clearTimeout(timeoutId);
            if(dot && txt && navigator.onLine) {
                dot.style.background = "var(--accent-green)";
                dot.style.boxShadow = "0 0 10px var(--accent-green)";
                txt.textContent = "Online - Tersinkron";
                txt.style.color = "var(--text-secondary)";
            }
        }).catch(err => {
            if(timeoutId) clearTimeout(timeoutId);
            console.error("Gagal sinkronisasi ke Cloud:", err);
            if(dot && txt) {
                dot.style.background = "var(--accent-red)";
                dot.style.boxShadow = "0 0 10px var(--accent-red)";
                txt.textContent = "Akses Ditolak / Offline";
                txt.style.color = "var(--accent-red)";
            }
        });
    } catch(e) {
        console.error("Firebase error:", e);
    }
}

// Global Chart references
let chartFinanceInstance = null;
let chartPieInstance = null;

// Clock Logic
function updateDateTime() {
    const dateEl = document.getElementById("top-bar-date");
    const timeEl = document.getElementById("top-bar-time");
    if (!dateEl || !timeEl) return;
    
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    dateEl.textContent = `${dayName}, ${date} ${monthName} ${year}`;
    timeEl.textContent = `${hours}:${minutes}:${seconds} WIB`;
}
updateDateTime();
setInterval(updateDateTime, 1000);



// Helpers & Dictionaries
function exportDataToXLS(headers, rows, filename) {
    let tableHtml = '<table border="1"><thead><tr>';
    headers.forEach(h => {
        tableHtml += `<th style="background-color: #4f46e5; color: white;">${h}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';
    
    rows.forEach(row => {
        tableHtml += '<tr>';
        row.forEach(cell => {
            // Check if string can be parsed as a number without leading zeros to avoid Excel weirdness
            if (typeof cell === 'string' && !isNaN(Number(cell)) && cell.charAt(0) !== '0') {
                tableHtml += `<td>${cell}</td>`;
            } else if (typeof cell === 'string') {
                // Keep as string to avoid converting things like "001" to 1
                tableHtml += `<td style="mso-number-format:'\\@';">${cell}</td>`;
            } else {
                tableHtml += `<td>${cell}</td>`;
            }
        });
        tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';

    const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Sheet1</x:Name>
                            <x:WorksheetOptions>
                                <x:DisplayGridlines/>
                            </x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
        </head>
        <body>
            ${tableHtml}
        </body>
        </html>
    `;
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename + ".xls";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function formatRupiah(number) {
    if (typeof number !== "number") {
        number = parseFloat(number) || 0;
    }
    return "Rp " + number.toLocaleString("id-ID");
}

// ============= TOAST NOTIFICATION SYSTEM =============
const TOAST_ICONS = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'alert-triangle',
    info: 'info'
};

function showToast(type, title, message, duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.setProperty('--toast-duration', `${duration}ms`);
    toast.innerHTML = `
        <div class="toast-icon">
            <i data-lucide="${TOAST_ICONS[type] || 'info'}"></i>
        </div>
        <div class="toast-body">
            <span class="toast-title">${title}</span>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" onclick="this.closest('.toast').remove()">
            <i data-lucide="x"></i>
        </button>
    `;
    container.appendChild(toast);
    lucide.createIcons({ attrs: { class: '' }, nameAttr: 'data-lucide' });

    setTimeout(() => {
        toast.classList.add('toast-exiting');
        setTimeout(() => toast.remove(), 450);
    }, duration);
}

function showConfirm(title, message, onConfirm, isDanger = false) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
        <div class="confirm-dialog">
            <div class="confirm-icon ${isDanger ? 'confirm-danger' : ''}">
                <i data-lucide="${isDanger ? 'trash' : 'alert-triangle'}"></i>
            </div>
            <div class="confirm-title">${title}</div>
            <div class="confirm-message">${message}</div>
            <div class="confirm-actions">
                <button class="btn btn-secondary" id="confirm-cancel-btn">Batal</button>
                <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="confirm-ok-btn">${isDanger ? 'Hapus' : 'Lanjutkan'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    lucide.createIcons({ attrs: { class: '' }, nameAttr: 'data-lucide' });

    overlay.querySelector('#confirm-cancel-btn').addEventListener('click', () => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
    });
    overlay.querySelector('#confirm-ok-btn').addEventListener('click', () => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
        onConfirm();
    });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
    });
}

const TAB_TITLES = {
    dashboard: { title: "Dashboard Utama", subtitle: "Ringkasan real-time status pembangunan infrastruktur." },
    progres: { title: "Progres Fisik Proyek", subtitle: "Rincian bobot dan kemajuan fisik pembangunan." },
    rab: { title: "Rencana Kebutuhan Material/Jasa", subtitle: "Susunan rencana kebutuhan volume material/jasa." },
    order: { title: "Order Material", subtitle: "Pengajuan dan pelacakan pesanan material." },
    penggunaan: { title: "Penggunaan Material", subtitle: "Catatan riwayat pengeluaran material dari gudang ke lapangan." },
    masuk: { title: "Penerimaan Barang Masuk", subtitle: "Log riwayat penerimaan material dari supplier ke gudang dengan referensi MR/PR." },
    stok: { title: "Stok Material Gudang", subtitle: "Inventarisasi stok bahan bangunan dan status keamanan kuantitas." }
};

// 2. TIMING & DATE
const INDO_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const INDO_BULAN = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function getFormattedDate(date) {
    return `${INDO_HARI[date.getDay()]}, ${date.getDate()} ${INDO_BULAN[date.getMonth()]} ${date.getFullYear()}`;
}

function updateClocks() {
    const now = new Date();
    const hours = now.getHours();
    
    let greeting = "Selamat Malam";
    if (hours >= 4 && hours < 11) greeting = "Selamat Pagi";
    else if (hours >= 11 && hours < 15) greeting = "Selamat Siang";
    else if (hours >= 15 && hours < 18.5) greeting = "Selamat Sore";
    
    const welcomeGreeting = document.getElementById("welcome-greeting");
    if (welcomeGreeting) welcomeGreeting.textContent = `${greeting}, Admin!`;

    const timeStr = now.toLocaleTimeString("id-ID", { hour12: false }) + " WIB";
    const dateStr = getFormattedDate(now);

    const welcomeDate = document.getElementById("welcome-date");
    const welcomeTime = document.getElementById("welcome-time");
    if (welcomeDate) welcomeDate.textContent = dateStr;
    if (welcomeTime) welcomeTime.textContent = timeStr;

    const topBarDate = document.getElementById("top-bar-date");
    const topBarTime = document.getElementById("top-bar-time");
    if (topBarDate) topBarDate.textContent = dateStr;
    if (topBarTime) topBarTime.textContent = timeStr;
}

// 3. LOGIN & AUTHENTICATION
function setupLoginAuthentication() {
    const loginScreen = document.getElementById("login-screen");
    const splashScreen = document.getElementById("splash-screen");
    const formLogin = document.getElementById("form-login");
    const passwordInput = document.getElementById("login-password");
    const togglePasswordBtn = document.getElementById("btn-toggle-password");
    const eyeIcon = document.getElementById("eye-icon");

    togglePasswordBtn.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.setAttribute("data-lucide", "eye-off");
        } else {
            passwordInput.type = "password";
            eyeIcon.setAttribute("data-lucide", "eye");
        }
        lucide.createIcons();
    });

    if (sessionStorage.getItem("arta_logged_in") === "true") {
        loginScreen.style.display = "none";
        splashScreen.classList.remove("hidden");
        runSplashLoader();
    }

    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        if (passwordInput.value.trim() === currentAppPassword) {
            sessionStorage.setItem("arta_logged_in", "true");
            loginScreen.classList.add("fade-out");
            setTimeout(() => {
                loginScreen.style.display = "none";
                splashScreen.classList.remove("hidden");
                runSplashLoader();
            }, 600);
        } else {
            showToast('error', 'Login Gagal', 'Kata sandi salah! Silakan coba lagi.');
            passwordInput.value = "";
            passwordInput.focus();
        }
    });

    // Logout Handler
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            showConfirm("Keluar Aplikasi", "Apakah Anda yakin ingin keluar dari sesi saat ini?", () => {
                sessionStorage.removeItem("arta_logged_in");
                window.location.reload();
            });
        });
    }
}

function runSplashLoader() {
    updateClocks();
    setInterval(updateClocks, 1000);

    const loaderBar = document.getElementById("loader-bar");
    const btnEnter = document.getElementById("btn-enter");
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 20 + 8;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            loaderBar.style.width = "100%";
            setTimeout(() => {
                document.querySelector(".loader-container").style.display = "none";
                btnEnter.style.opacity = "1";
                btnEnter.style.pointerEvents = "auto";
                btnEnter.style.transform = "translateY(0)";
            }, 400);
        } else {
            loaderBar.style.width = `${progress}%`;
        }
    }, 100);

    btnEnter.addEventListener("click", () => {
        const splash = document.getElementById("splash-screen");
        const app = document.getElementById("main-app");
        
        splash.classList.add("fade-out");
        
        setTimeout(() => {
            splash.style.display = "none";
            app.classList.remove("hidden");
            initApp();
        }, 800);
    });
}

// 4. PROJECT HEADER CARD CONTROLLER (REMOVED - proyek utama banyak)
function setupProjectTitleEditor() {
    // No-op: project header has been removed from UI
}

// Toggle Project Title Card Visibility - no longer needed
function toggleProjectTitleCard(tabName) {
    // No-op: project header has been removed from UI
}

// 5. NAVIGATION
function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const tabPanels = document.querySelectorAll(".tab-panel");
    const currentTabTitle = document.getElementById("current-tab-title");
    const currentTabSubtitle = document.getElementById("current-tab-subtitle");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const tabName = item.getAttribute("data-tab");
            
            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");
            
            tabPanels.forEach(panel => panel.classList.remove("active"));
            document.getElementById(`tab-${tabName}`).classList.add("active");
            
            currentTabTitle.textContent = TAB_TITLES[tabName].title;
            currentTabSubtitle.textContent = TAB_TITLES[tabName].subtitle;

            // Handle Project Name card visibility
            toggleProjectTitleCard(tabName);
            
            if (tabName === "dashboard") {
                setTimeout(renderCharts, 50);
            }
        });
    });
}

// 6. EVM COMPUTED MATHEMATICS (Cost-Weighted Rollups)
function run3LevelEVMRollups() {

    // Calculate weight structures (bobot) dynamically based on equal item distribution
    fases.forEach(fase => {
        // PERMINTAAN: kategori pekerjaan adalah judul utama sehingga bobotnya 100%
        fase.bobot = 100;
        
        const faseSubs = subPekerjaan.filter(sub => sub.faseId === fase.id);
        faseSubs.forEach(sub => {
            sub.bobot = faseSubs.length > 0 ? (1 / faseSubs.length) * 100 : 0;
            
            const subItems = rab.filter(item => item.subPekerjaanId === sub.id);
            subItems.forEach(item => {
                item.bobot = subItems.length > 0 ? (1 / subItems.length) * 100 : 0;
            });
        });
    });

    // Calculate Progress Rollups (Level 3 -> Level 2 -> Level 1)
    fases.forEach(fase => {
        const faseSubs = subPekerjaan.filter(sub => sub.faseId === fase.id);
        let weightedFaseProgress = 0;
        let weightedFaseTarget = 0;

        faseSubs.forEach(sub => {
            const subItems = rab.filter(item => item.subPekerjaanId === sub.id);
            if (subItems.length > 0) {
                let weightedSubProgress = 0;
                let weightedSubTarget = 0;
                subItems.forEach(item => {
                    const itemProgres = item.progres || 0;
                    const itemTarget = item.target || 0;
                    weightedSubProgress += (itemProgres * (item.bobot / 100));
                    weightedSubTarget += (itemTarget * (item.bobot / 100));
                });
                sub.progres = Math.round(weightedSubProgress * 10) / 10;
                sub.target = Math.round(weightedSubTarget * 10) / 10;
            } else {
                // Fallback to manual entry if no RAB items exist yet
                sub.progres = sub.progres || 0;
                sub.target = sub.target || 0;
            }

            weightedFaseProgress += (sub.progres * (sub.bobot / 100));
            weightedFaseTarget += (sub.target * (sub.bobot / 100));
        });

        if (faseSubs.length > 0) {
            fase.progres = Math.round(weightedFaseProgress * 10) / 10;
            fase.target = Math.round(weightedFaseTarget * 10) / 10;
        } else {
            fase.progres = 0;
            fase.target = 0;
        }
    });

    // Project progress
    let projectProgress = 0;
    if (fases.length > 0) {
        let totalWeightedProgress = 0;
        fases.forEach(fase => {
            const actualBobot = 1 / fases.length;
            totalWeightedProgress += fase.progres * actualBobot;
        });
        projectProgress = totalWeightedProgress;
    }

    return {
        projectProgress
    };
}

// Filter helper untuk Dashboard
function getFilteredFasesForDashboard() {
    const yearFilter = document.getElementById("dashboard-year-filter");
    const selectedYear = yearFilter ? yearFilter.value : "all";
    if (selectedYear === "all") return fases;
    
    return fases.filter(f => {
        if (!f.mulai) return false;
        return f.mulai.substring(0, 4) === selectedYear;
    });
}

function calculateKPIs() {
    const { projectProgress } = run3LevelEVMRollups();

    const filteredFases = getFilteredFasesForDashboard();
    let sumProgres = 0;

    filteredFases.forEach(f => {
        sumProgres += (f.progres || 0);
    });
    
    let avgProgres = filteredFases.length > 0 ? (sumProgres / filteredFases.length) : 0;

    const elTotalKategori = document.getElementById("kpi-total-kategori");
    if(elTotalKategori) elTotalKategori.textContent = `${filteredFases.length} Fase`;

    let totalItemRAB = 0;
    filteredFases.forEach(fase => {
        const faseSubs = subPekerjaan.filter(sub => sub.faseId === fase.id);
        faseSubs.forEach(sub => {
            const subItems = rab.filter(item => item.subPekerjaanId === sub.id);
            totalItemRAB += subItems.length;
        });
    });

    const elTotalItem = document.getElementById("kpi-total-item");
    if(elTotalItem) elTotalItem.textContent = `${totalItemRAB} Item`;

    document.getElementById("kpi-total-progress").textContent = `${avgProgres.toFixed(1)}%`;
    document.getElementById("kpi-progress-fill").style.width = `${avgProgres}%`;

    const criticalItems = stok.filter(item => item.stok <= item.min);
    document.getElementById("kpi-stok-kritis").textContent = `${criticalItems.length} Item`;
    const kpiStokDesc = document.getElementById("kpi-stok-desc");
    if (criticalItems.length > 0) {
        kpiStokDesc.textContent = "Butuh pemesanan ulang! Klik detail.";
        kpiStokDesc.className = "kpi-trend text-red";
    } else {
        kpiStokDesc.textContent = "Semua stok aman";
        kpiStokDesc.className = "kpi-trend text-green";
    }
}

// Navigate to Fase details (RAB tab) and highlight
window.navigateToFaseDetails = function(faseId) {
    // Navigate to RAB Tab
    document.getElementById("nav-rab").click();
    
    // Ensure the accordion is expanded
    if (!expandedRows.has(faseId)) {
        toggleExpandRow(faseId);
    }
    
    // Scroll to the item and highlight
    setTimeout(() => {
        const row = document.getElementById(`btn-expand-rab-${faseId}`);
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const tr = row.closest('tr');
            if (tr) {
                const originalBg = tr.style.backgroundColor;
                tr.style.transition = "background-color 0.5s";
                tr.style.backgroundColor = "rgba(245, 158, 11, 0.3)";
                setTimeout(() => {
                    tr.style.backgroundColor = originalBg;
                }, 2000);
            }
        }
    }, 100);
};

// Toggle Expand accordion row helper
window.toggleExpandRow = function(faseId) {
    const mainBtn = document.getElementById(`btn-expand-progress-${faseId}`);
    const rabBtn = document.getElementById(`btn-expand-rab-${faseId}`);
    const progressRow = document.getElementById(`sub-row-progress-${faseId}`);
    const rabRow = document.getElementById(`sub-row-rab-${faseId}`);

    if (expandedRows.has(faseId)) {
        expandedRows.delete(faseId);
        if (mainBtn) mainBtn.classList.remove("expanded");
        if (rabBtn) rabBtn.classList.remove("expanded");
        if (progressRow) progressRow.classList.add("hidden");
        if (rabRow) rabRow.classList.add("hidden");
    } else {
        expandedRows.add(faseId);
        if (mainBtn) mainBtn.classList.add("expanded");
        if (rabBtn) rabBtn.classList.add("expanded");
        if (progressRow) progressRow.classList.remove("hidden");
        if (rabRow) rabRow.classList.remove("hidden");
    }
};

// 7. RENDERING DATA VIEWS
function renderAllTables() {
    run3LevelEVMRollups();

    // --- 1. Dashboard Logs (Recent Usage Logs) ---
    const dbLogsBody = document.querySelector("#table-dashboard-logs tbody");
    dbLogsBody.innerHTML = "";
    const sortedLogs = [...penggunaan].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 4);
    sortedLogs.forEach(log => {
        const material = stok.find(s => s.id === log.materialId);
        const fase = fases.find(f => f.id === log.faseId);
        const matName = material ? material.nama : "Tidak Diketahui";
        const faseName = fase ? fase.nama : "Umum";
        
        const tr = document.createElement("tr");
        const faseLinkHTML = fase 
            ? `<a href="#" onclick="navigateToFaseDetails('${fase.id}'); return false;" class="badge badge-blue project-link" style="text-decoration:none; cursor:pointer; display:inline-flex; align-items:center;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'"><i data-lucide="link" style="width:10px; height:10px; margin-right:4px;"></i>${faseName.substring(0, 20)}...</a>` 
            : `<span class="badge badge-blue">${faseName.substring(0, 20)}...</span>`;
        tr.innerHTML = `
            <td>${log.tanggal}</td>
            <td class="text-blue" style="font-weight: 600;">${matName}</td>
            <td>${log.jumlah} ${material ? material.satuan : ""}</td>
            <td>${faseLinkHTML}</td>
        `;
        dbLogsBody.appendChild(tr);
    });
    if (sortedLogs.length === 0) {
        dbLogsBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Belum ada riwayat penggunaan material.</td></tr>`;
    }

    const dbProgressSummary = document.getElementById("dashboard-progress-summary");
    dbProgressSummary.innerHTML = "";
    
    // Hitung Dashboard Klasifikasi
    let summaryKlasifikasi = {
        "Project Baru": { count: 0 },
        "Maintenance": { count: 0 },
        "Pekerjaan Lain-lain": { count: 0 }
    };

    let summaryStatus = {
        "Selesai": 0,
        "Proses": 0,
        "Belum Selesai": 0
    };

    const dashboardFases = getFilteredFasesForDashboard();
    dashboardFases.forEach(fase => {
        // Klasifikasi Dashboard
        const klas = fase.klasifikasi || "Project Baru";
        if (summaryKlasifikasi[klas]) {
            summaryKlasifikasi[klas].count++;
        }

        // Summary Status Dashboard
        if (fase.progres >= 100) summaryStatus["Selesai"]++;
        else if (fase.progres > 0) summaryStatus["Proses"]++;
        else summaryStatus["Belum Selesai"]++;

        const item = document.createElement("div");
        item.className = "progress-list-item";
        
        let progressFillColor = "fill-blue";
        if (fase.progres >= 100) progressFillColor = "fill-green";
        else if (fase.progres < fase.target) progressFillColor = "fill-orange";

        item.innerHTML = `
            <div class="progress-list-header">
                <a href="#" onclick="navigateToFaseDetails('${fase.id}'); return false;" class="progress-list-title project-link" style="text-decoration: none; color: var(--text-light); transition: color 0.2s; display: flex; align-items: center; gap: 6px;" onmouseover="this.style.color='var(--accent-blue)'" onmouseout="this.style.color='var(--text-light)'">
                    <i data-lucide="link" style="width:12px; height:12px;"></i>${fase.nama}
                </a>
                <span class="progress-list-value">${fase.progres}%</span>
            </div>
            <div class="progress-container">
                <div class="progress-track">
                    <div class="progress-fill ${progressFillColor}" style="width: ${fase.progres}%"></div>
                </div>
            </div>
        `;
        dbProgressSummary.appendChild(item);
    });

    // Update UI Klasifikasi
    const kpiBaru = document.getElementById("kpi-klasifikasi-baru");
    if(kpiBaru) kpiBaru.textContent = summaryKlasifikasi["Project Baru"].count + " Proyek";

    const kpiMaint = document.getElementById("kpi-klasifikasi-maintenance");
    if(kpiMaint) kpiMaint.textContent = summaryKlasifikasi["Maintenance"].count + " Proyek";

    const kpiLain = document.getElementById("kpi-klasifikasi-lain");
    if(kpiLain) kpiLain.textContent = summaryKlasifikasi["Pekerjaan Lain-lain"].count + " Proyek";

    // Update UI Status Pekerjaan
    const kpiStatusSelesai = document.getElementById("kpi-status-selesai");
    const kpiStatusProses = document.getElementById("kpi-status-proses");
    const kpiStatusBelum = document.getElementById("kpi-status-belum");
    if (kpiStatusSelesai) kpiStatusSelesai.textContent = summaryStatus["Selesai"];
    if (kpiStatusProses) kpiStatusProses.textContent = summaryStatus["Proses"];
    if (kpiStatusBelum) kpiStatusBelum.textContent = summaryStatus["Belum Selesai"];

    // --- 3. Dashboard Tren Pekerjaan Terlama ---
    const trenTercepatTbody = document.getElementById("table-tren-tercepat");
    if (trenTercepatTbody) {
        trenTercepatTbody.innerHTML = "";
        let allJobs = [];
        // Only collect main Fases
        dashboardFases.forEach(f => {
            if (f.aktualMulai && f.aktualSelesai && f.mulai && f.selesai) {
                const scheduleData = analyzeDateSchedule(f.mulai, f.selesai, f.aktualMulai, f.aktualSelesai, f.progres);
                allJobs.push({ nama: f.nama, tipe: 'Kategori Pekerjaan', data: scheduleData, id: f.id, justifikasi: f.justifikasi });
            }
        });
        
        // Sort by longest actual duration descending
        allJobs.sort((a, b) => b.data.aktualHari - a.data.aktualHari);
        
        if (allJobs.length === 0) {
            trenTercepatTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:16px;">Belum ada data pekerjaan yang telah selesai dikerjakan.</td></tr>`;
        } else {
            allJobs.slice(0, 5).forEach(job => {
                const isDelayed = job.data.selisih < 0;
                const deviasiStr = (job.data.selisih > 0 ? "+" : "") + job.data.selisih + " Hari";
                
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><a href="#" onclick="navigateToFaseDetails('${job.id}'); return false;" class="project-link" style="color: var(--accent-blue); text-decoration: none; font-weight: 600;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'"><i data-lucide="link" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-right:4px;"></i>${job.nama}</a></td>
                    <td>${job.data.targetHari} Hari</td>
                    <td><strong class="${isDelayed ? 'text-red' : 'text-green'}">${job.data.aktualHari} Hari</strong></td>
                    <td><span style="font-weight:bold; color: ${isDelayed ? 'var(--accent-red)' : 'var(--accent-green)'}">${deviasiStr}</span></td>
                    <td>${job.data.status}${job.justifikasi ? `<br><small class="text-muted" style="display:block;margin-top:4px;">Keterlambatan: ${job.justifikasi}</small>` : ''}</td>
                `;
                trenTercepatTbody.appendChild(tr);
            });
        }
    }

    // --- 4. Progres Tab Table (Level 1 Kategori -> Level 2 Sub-Pekerjaan) ---
    const tableProgresBody = document.getElementById("table-progres-body");
    tableProgresBody.innerHTML = "";
    
    // Read Filter Values
    const searchProgres = document.getElementById("search-progres");
    const filterStatusProgres = document.getElementById("filter-status-progres");
    const searchVal = searchProgres ? searchProgres.value.toLowerCase() : "";
    const filterStatus = filterStatusProgres ? filterStatusProgres.value : "Semua";

    const filteredFases = fases.filter(f => {
        const matchSearch = f.nama.toLowerCase().includes(searchVal);
        let matchStatus = true;
        if (filterStatus === "Selesai") matchStatus = f.progres >= 100;
        else if (filterStatus === "Proses") matchStatus = f.progres > 0 && f.progres < 100;
        else if (filterStatus === "Belum Selesai") matchStatus = !f.progres || f.progres === 0;
        return matchSearch && matchStatus;
    });

    filteredFases.forEach(fase => {
        let statusBadge = `<span class="badge badge-blue">Berjalan</span>`;
        if (fase.progres >= 100) statusBadge = `<span class="badge badge-green">Selesai</span>`;
        else if (fase.progres < fase.target) statusBadge = `<span class="badge badge-orange">Terlambat</span>`;

        const isExpanded = expandedRows.has(fase.id);
        const faseSubs = subPekerjaan.filter(sub => sub.faseId === fase.id);

        let badgeKlas = '';
        const klas = fase.klasifikasi || "Project Baru";
        if (klas === "Project Baru") badgeKlas = `<span class="badge badge-klasifikasi-baru" style="margin-top: 4px; display: inline-block;">Project Baru</span>`;
        else if (klas === "Maintenance") badgeKlas = `<span class="badge badge-klasifikasi-maintenance" style="margin-top: 4px; display: inline-block;">Maintenance</span>`;
        else badgeKlas = `<span class="badge badge-klasifikasi-lain" style="margin-top: 4px; display: inline-block;">Lain-lain</span>`;

        const scheduleData = analyzeDateSchedule(fase.mulai, fase.selesai, fase.aktualMulai, fase.aktualSelesai, fase.progres);

        let lampiranHTML = '<span style="color: var(--text-muted); font-size: 0.8rem; font-style: italic;">Belum ada lampiran</span>';
        if (fase.lampiran && fase.lampiran.trim() !== '') {
            const lines = fase.lampiran.split('\n').filter(l => l.trim() !== '');
            if (lines.length > 0) {
                const options = lines.map((line, i) => {
                    let title = `Gambar ${i + 1}`;
                    let url = line.trim();
                    const httpIdx = line.indexOf('http');
                    if (httpIdx > 0) {
                        let rawTitle = line.substring(0, httpIdx).trim();
                        rawTitle = rawTitle.replace(/[\|\-\:,;]+$/, '').trim();
                        if (rawTitle) title = rawTitle;
                        url = line.substring(httpIdx).trim().split(/\s+/)[0]; 
                    } else if (httpIdx === 0) {
                        url = line.substring(0).trim().split(/\s+/)[0];
                    } else {
                        url = line.trim().split(/\s+/)[0];
                    }
                    return `<option value="${url}">${title}</option>`;
                }).join('');
                
                lampiranHTML = `
                <select class="lampiran-dropdown" onchange="if(this.value) { window.open(this.value, '_blank'); this.selectedIndex=0; }" style="width: 130px; background: rgba(255,255,255,0.05); color: var(--accent-orange); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 6px; font-size: 0.75rem; outline: none; cursor: pointer; font-weight: 600;">
                    <option value="" disabled selected>Pilih Lampiran...</option>
                    ${options}
                </select>
                `;
            }
        }

        const trMain = document.createElement("tr");
        trMain.innerHTML = `
            <td style="text-align: center;">
                <button class="btn-expand ${isExpanded ? 'expanded' : ''}" onclick="toggleExpandRow('${fase.id}')" id="btn-expand-progress-${fase.id}">
                    <i data-lucide="chevron-right"></i>
                </button>
            </td>
            <td>
                <div style="font-weight: 600; cursor: pointer;" onclick="toggleExpandRow('${fase.id}')">${fase.nama}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted)">ID: ${fase.id} | ${faseSubs.length} Tahapan Pekerjaan</div>
                ${badgeKlas}
            </td>
            <td><strong>${fase.bobot.toFixed(1)}%</strong></td>
            <td style="font-size: 0.82rem; color: var(--text-secondary)">
                <div style="margin-bottom: 4px"><span style="color:var(--text-muted); display:inline-block; width:50px;">Rencana:</span> ${fase.mulai} s/d ${fase.selesai} (${scheduleData.targetHari || '-'} Hr)</div>
                <div><span style="color:var(--text-muted); display:inline-block; width:50px;">Aktual:</span> ${fase.aktualMulai || '-'} s/d ${fase.aktualSelesai || '-'} (${scheduleData.aktualHari || '-'} Hr)</div>
                ${scheduleData.notice ? `<div style="color:var(--accent-orange);font-size:0.75rem;margin-top:2px">${scheduleData.notice}</div>` : ''}
                <div style="margin-top:4px;">${scheduleData.status}</div>
            </td>
            <td>
                <div class="progress-container">
                    <div class="progress-track" style="width: 80px;">
                        <div class="progress-fill fill-blue" style="width: ${fase.target}%"></div>
                    </div>
                    <span class="progress-percent">${fase.target}%</span>
                </div>
            </td>
            <td>
                <div class="progress-container">
                    <div class="progress-track" style="width: 80px;">
                        <div class="progress-fill ${fase.progres >= 100 ? 'fill-green' : (fase.progres < fase.target ? 'fill-orange' : 'fill-blue')}" style="width: ${fase.progres}%"></div>
                    </div>
                    <span class="progress-percent" style="font-weight:700;">${fase.progres}%</span>
                </div>
                <div style="margin-top: 4px; display: flex; align-items:center; gap: 6px;">
                    ${statusBadge}
                </div>
            </td>
            <td>${fase.justifikasi ? `<span class="badge" style="background: rgba(239, 68, 68, 0.1); color: var(--accent-red); border: 1px solid rgba(239, 68, 68, 0.3); font-size: 0.7rem; white-space: normal; line-height: 1.4;">${fase.justifikasi}</span>` : '-'}</td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                    ${lampiranHTML}
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit-btn" onclick="openEditCategory('${fase.id}')" title="Edit Kategori">
                        <i data-lucide="edit"></i>
                    </button>
                </div>
            </td>
        `;
        tableProgresBody.appendChild(trMain);

        // Nested RAB Row (Level 2 representation)
        const trSub = document.createElement("tr");
        trSub.className = `sub-pekerjaan-row ${isExpanded ? '' : 'hidden'}`;
        trSub.id = `sub-row-progress-${fase.id}`;
        
        let subBlocksHtml = "";
        
        faseSubs.forEach(sub => {
            const subItems = rab.filter(item => item.subPekerjaanId === sub.id);
            
            let itemsTableRowsHtml = "";
            subItems.forEach(item => {
                const itemProgres = item.progres || 0;
                const itemTarget = item.target || 0;
                
                const kendalaBadge = item.kendala ? `<span class="badge badge-orange"><i data-lucide="alert-circle" style="width:12px;height:12px;display:inline-block;margin-right:4px;vertical-align:middle;"></i> ${item.kendala}</span>` : `<span style="color:var(--text-muted)">-</span>`;
                const catatanText = item.catatanKendala ? `<div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">${item.catatanKendala}</div>` : "";

                itemsTableRowsHtml += `
                    <tr>
                        <td>
                            <strong>${item.nama}</strong>
                            ${item.tipe === "Bahan" ? '<span class="badge badge-green btn-small">Bahan</span>' : '<span class="badge badge-blue btn-small">Jasa</span>'}
                        </td>
                        <td>${item.bobot ? item.bobot.toFixed(1) : 0}% <span style="font-size:0.75rem; color:var(--text-muted)">(di Sub)</span></td>
                        <td>
                            <div class="progress-container">
                                <div class="progress-track" style="max-width: 150px;">
                                    <div class="progress-fill fill-blue" style="width: ${itemTarget}%"></div>
                                </div>
                                <span class="progress-percent">${itemTarget}%</span>
                            </div>
                        </td>
                        <td>
                            <div class="progress-container">
                                <div class="progress-track" style="max-width: 150px;">
                                    <div class="progress-fill ${itemProgres >= 100 ? 'fill-green' : 'fill-blue'}" style="width: ${itemProgres}%"></div>
                                </div>
                                <span class="progress-percent">${itemProgres}%</span>
                            </div>
                        </td>
                        <td>
                            ${kendalaBadge}
                            ${catatanText}
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon edit-btn" onclick="openEditProgres('${item.id}')" title="Perbarui Progres Fisik">
                                    <i data-lucide="edit"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            if (subItems.length === 0) {
                itemsTableRowsHtml = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 12px;">Belum ada Rincian Pekerjaan. Tambahkan rincian di menu RAB terlebih dahulu.</td></tr>`;
            }

            subBlocksHtml += `
                <div class="sub-pekerjaan-block">
                    <div class="sub-task-header">
                        <span class="sub-task-title"><i data-lucide="layers"></i> ${sub.nama}</span>
                        <div class="sub-task-meta">
                            <span>Bobot Biaya: <strong>${sub.bobot.toFixed(1)}%</strong></span>
                            <span style="margin-left:12px;">Target: <strong>${sub.target}%</strong></span>
                            <span style="margin-left:12px;">Progres: <strong>${sub.progres}%</strong></span>
                        </div>
                    </div>
                    <table class="sub-table">
                        <thead>
                            <tr>
                                <th>Nama Item Pekerjaan</th>
                                <th style="width: 120px;">Bobot Fisik</th>
                                <th>Target Progres</th>
                                <th>Progres Realisasi</th>
                                <th>Kendala</th>
                                <th style="width: 100px;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsTableRowsHtml}
                        </tbody>
                    </table>
                </div>
            `;
        });

        if (faseSubs.length === 0) {
            subBlocksHtml = `
                <div style="text-align: center; color: var(--text-muted); padding: 30px;">
                    Belum ada sub-pekerjaan untuk kategori ini. Kelola rincian di tab RAB.
                </div>
            `;
        }

        trSub.innerHTML = `
            <td colspan="9">
                <div class="sub-pekerjaan-container">
                    <div class="sub-table-header">
                        <span class="sub-title"><i data-lucide="layers"></i> Rincian Progres per Sub-Pekerjaan (${fase.nama})</span>
                        <button class="btn btn-secondary btn-small" onclick="document.getElementById('nav-rab').click()">
                            <i data-lucide="plus"></i> Kelola di Menu RAB
                        </button>
                    </div>
                    ${subBlocksHtml}
                </div>
            </td>
        `;
        tableProgresBody.appendChild(trSub);
    });

    if (fases.length === 0) {
        tableProgresBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">Belum ada fase pekerjaan. Tambahkan kategori baru di tab RAB.</td></tr>`;
    }

    // --- 4. RAB Tab Table (Grouped Accordion 3-Level) ---
    const tableRabBody = document.getElementById("table-rab-body");
    tableRabBody.innerHTML = "";

    fases.forEach(fase => {
        const isExpanded = expandedRows.has(fase.id);
        const faseSubs = subPekerjaan.filter(sub => sub.faseId === fase.id);
        
        let badgeKlas = '';
        const klas = fase.klasifikasi || "Project Baru";
        if (klas === "Project Baru") badgeKlas = `<span class="badge badge-klasifikasi-baru" style="margin-top: 4px; display: inline-block;">Project Baru</span>`;
        else if (klas === "Maintenance") badgeKlas = `<span class="badge badge-klasifikasi-maintenance" style="margin-top: 4px; display: inline-block;">Maintenance</span>`;
        else badgeKlas = `<span class="badge badge-klasifikasi-lain" style="margin-top: 4px; display: inline-block;">Lain-lain</span>`;

        let lampiranHTML = '<span style="color: var(--text-muted); font-size: 0.8rem; font-style: italic;">Belum ada lampiran</span>';
        if (fase.lampiran && fase.lampiran.trim() !== '') {
            const lines = fase.lampiran.split('\n').filter(l => l.trim() !== '');
            if (lines.length > 0) {
                const options = lines.map((line, i) => {
                    let title = `Gambar ${i + 1}`;
                    let url = line.trim();
                    const httpIdx = line.indexOf('http');
                    if (httpIdx > 0) {
                        let rawTitle = line.substring(0, httpIdx).trim();
                        rawTitle = rawTitle.replace(/[\|\-\:,;]+$/, '').trim();
                        if (rawTitle) title = rawTitle;
                        url = line.substring(httpIdx).trim().split(/\s+/)[0]; 
                    } else if (httpIdx === 0) {
                        url = line.substring(0).trim().split(/\s+/)[0];
                    } else {
                        url = line.trim().split(/\s+/)[0];
                    }
                    return `<option value="${url}">${title}</option>`;
                }).join('');
                
                lampiranHTML = `
                <select class="lampiran-dropdown" onchange="if(this.value) { window.open(this.value, '_blank'); this.selectedIndex=0; }" style="width: 130px; background: rgba(255,255,255,0.05); color: var(--accent-orange); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 6px; font-size: 0.75rem; outline: none; cursor: pointer; font-weight: 600;">
                    <option value="" disabled selected>Pilih Lampiran...</option>
                    ${options}
                </select>
                `;
            }
        }

        // Category Main Row (Level 1)
        const trMain = document.createElement("tr");
        trMain.style.background = "rgba(255, 255, 255, 0.02)";
        trMain.innerHTML = `
            <td style="text-align: center;">
                <button class="btn-expand ${isExpanded ? 'expanded' : ''}" onclick="toggleExpandRow('${fase.id}')" id="btn-expand-rab-${fase.id}">
                    <i data-lucide="chevron-right"></i>
                </button>
            </td>
            <td>
                <div style="font-weight: 800; cursor: pointer; color: white; font-size:1.02rem;" onclick="toggleExpandRow('${fase.id}')">${fase.nama}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted)">ID: ${fase.id} | ${faseSubs.length} Sub-Pekerjaan</div>
                ${badgeKlas}
            </td>
            <td><strong>${fase.bobot.toFixed(1)}%</strong></td>
            <td>-</td>
            <td>-</td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                    ${lampiranHTML}
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit-btn" onclick="openEditCategory('${fase.id}')" title="Edit Kategori">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn-icon delete-btn" onclick="deleteCategory('${fase.id}')" title="Hapus Kategori beserta isinya">
                        <i data-lucide="trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableRabBody.appendChild(trMain);

        // Expanded Level 2 & 3 Block Row
        const trSub = document.createElement("tr");
        trSub.className = `sub-pekerjaan-row ${isExpanded ? '' : 'hidden'}`;
        trSub.id = `sub-row-rab-${fase.id}`;

        let subBlocksHtml = "";
        faseSubs.forEach(sub => {
            const subItems = rab.filter(item => item.subPekerjaanId === sub.id);
            
            let itemsTableRowsHtml = "";
            subItems.forEach(item => {
                itemsTableRowsHtml += `
                    <tr>
                        <td>
                            <strong>${item.nama}</strong>
                            ${item.tipe === "Bahan" ? '<span class="badge badge-green btn-small">Bahan</span>' : '<span class="badge badge-blue btn-small">Jasa</span>'}
                        </td>
                        <td>${item.bobot.toFixed(1)}% <span style="font-size:0.72rem; color:var(--text-muted)">(di Sub)</span></td>
                        <td><span class="badge badge-blue">${item.satuan}</span></td>
                        <td>${item.volume}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon edit-btn" onclick="openEditRab('${item.id}')" title="Edit Item Biaya">
                                    <i data-lucide="edit"></i>
                                </button>
                                <button class="btn-icon delete-btn" onclick="deleteRab('${item.id}')" title="Hapus Item Biaya">
                                    <i data-lucide="trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            if (subItems.length === 0) {
                itemsTableRowsHtml = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 12px;">Belum ada rincian bahan atau upah jasa. Silakan klik 'Tambah Item'.</td></tr>`;
            }

            subBlocksHtml += `
                <div class="sub-pekerjaan-block">
                    <div class="sub-task-header">
                        <span class="sub-task-title"><i data-lucide="layers"></i> ${sub.nama}</span>
                        <div class="sub-task-meta">
                            <span>Bobot Pekerjaan: <strong>${sub.bobot.toFixed(1)}%</strong></span>
                        </div>
                        <div class="action-buttons">
                            <button class="btn btn-secondary btn-small" onclick="openAddRabFromSub('${fase.id}', '${sub.id}')" title="Tambah Item Bahan/Jasa">
                                <i data-lucide="plus"></i> Item Detail
                            </button>
                            <button class="btn-icon edit-btn" onclick="openEditSubPekerjaan('${sub.id}')" title="Edit Sub-Pekerjaan">
                                <i data-lucide="edit"></i>
                            </button>
                            <button class="btn-icon delete-btn" onclick="deleteSubPekerjaan('${sub.id}')" title="Hapus Sub-Pekerjaan beserta rinciannya">
                                <i data-lucide="trash"></i>
                            </button>
                        </div>
                    </div>
                    <table class="sub-table">
                        <thead>
                            <tr>
                                <th>Nama Barang / Deskripsi Jasa</th>
                                <th style="width: 100px;">Porsi Pekerjaan</th>
                                <th>Satuan</th>
                                <th>Volume</th>
                                <th style="width: 100px;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsTableRowsHtml}
                        </tbody>
                    </table>
                </div>
            `;
        });

        if (faseSubs.length === 0) {
            subBlocksHtml = `
                <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                    Belum ada sub-pekerjaan untuk kategori ini. 
                    <button class="btn btn-secondary btn-small" style="margin-left: 10px;" onclick="openAddSubPekerjaanFromFase('${fase.id}')">
                        <i data-lucide="plus"></i> Tambah Sub-Pekerjaan
                    </button>
                </div>
            `;
        }

        trSub.innerHTML = `
            <td colspan="7">
                <div class="sub-pekerjaan-container">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 14px;">
                        <span class="sub-title" style="font-size:1rem; font-weight:700;"><i data-lucide="folder-open"></i> Sub-Pekerjaan & Rincian RAB (${fase.nama})</span>
                        <button class="btn btn-secondary btn-small" onclick="openAddSubPekerjaanFromFase('${fase.id}')">
                            <i data-lucide="plus"></i> Tambah Sub-Pekerjaan Baru
                        </button>
                    </div>
                    ${subBlocksHtml}
                </div>
            </td>
        `;
        tableRabBody.appendChild(trSub);
    });

    if (fases.length === 0) {
        tableRabBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">Belum ada kategori pekerjaan. Tambahkan kategori baru di atas.</td></tr>`;
    }

    // --- 5. Penggunaan Tab Table ---
    const tablePenggunaanBody = document.getElementById("table-penggunaan-body");
    const searchPenggunaanQuery = document.getElementById("search-penggunaan").value.toLowerCase();
    tablePenggunaanBody.innerHTML = "";
    
    const filteredPenggunaan = penggunaan.filter(p => {
        const mat = stok.find(s => s.id === p.materialId);
        const fase = fases.find(f => f.id === p.faseId);
        const matName = mat ? mat.nama.toLowerCase() : "";
        const matKode = mat ? mat.kode.toLowerCase() : "";
        const faseName = fase ? fase.nama.toLowerCase() : "";
        return matName.includes(searchPenggunaanQuery) || matKode.includes(searchPenggunaanQuery) || faseName.includes(searchPenggunaanQuery) || p.penerima.toLowerCase().includes(searchPenggunaanQuery);
    });

    filteredPenggunaan.forEach(p => {
        const mat = stok.find(s => s.id === p.materialId);
        const fase = fases.find(f => f.id === p.faseId);
        const sub = subPekerjaan.find(s => s.id === p.subPekerjaanId);
        const matName = mat ? mat.nama : "Tidak Diketahui";
        const matKode = mat ? mat.kode : "-";
        const faseName = fase ? fase.nama : "Umum";
        const subName = sub ? sub.nama : "Umum";

        const tr = document.createElement("tr");
        tr.className = "clickable-row";
        tr.onclick = function(e) {
            if(e.target.closest('button')) return;
            showDetailModal('penggunaan', p.id);
        };
        tr.innerHTML = `
            <td>${p.tanggal}</td>
            <td><code style="color: var(--accent-blue); font-weight: 600;">${matKode}</code></td>
            <td><strong class="text-blue">${matName}</strong></td>
            <td><strong>${p.jumlah}</strong></td>
            <td><span class="badge badge-blue">${mat ? mat.satuan : ""}</span></td>
            <td>
                <div>${faseName}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${subName}</div>
            </td>
            <td>${p.penerima}</td>
            <td style="font-size: 0.8rem; color: var(--text-secondary); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.keterangan || "-"}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon delete-btn" onclick="deletePenggunaan('${p.id}')" title="Hapus Log (Kembalikan Stok)">
                        <i data-lucide="trash"></i>
                    </button>
                </div>
            </td>
        `;
        tablePenggunaanBody.appendChild(tr);
    });
    if (filteredPenggunaan.length === 0) {
        tablePenggunaanBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">Catatan tidak ditemukan.</td></tr>`;
    }

    // --- 5b. Per-Project Usage Summary Cards ---
    renderUsageProjectSummary();
    renderMasukProjectSummary();

    // --- 5c. Barang Masuk Tab Table ---
    const tableMasukBody = document.getElementById("table-masuk-body");
    const searchMasukQuery = document.getElementById("search-masuk")?.value.toLowerCase() || "";
    if (tableMasukBody) {
        tableMasukBody.innerHTML = "";
        
        let totalQtyMasuk = 0;
        const filteredMasuk = barangMasuk.filter(m => {
            const mat = stok.find(s => s.id === m.materialId);
            const matName = mat ? mat.nama.toLowerCase() : "";
            const matKode = mat ? mat.kode.toLowerCase() : "";
            const mrMatch = m.mr ? m.mr.toLowerCase().includes(searchMasukQuery) : false;
            const prMatch = m.pr ? m.pr.toLowerCase().includes(searchMasukQuery) : false;
            return matName.includes(searchMasukQuery) || matKode.includes(searchMasukQuery) || mrMatch || prMatch;
        });

        filteredMasuk.forEach(m => {
            totalQtyMasuk += m.jumlah;
            const mat = stok.find(s => s.id === m.materialId);
            const matName = mat ? mat.nama : "Tidak Diketahui";
            const matKode = mat ? mat.kode : "-";

            const tr = document.createElement("tr");
            tr.className = "clickable-row";
            tr.onclick = function(e) {
                if(e.target.closest('button')) return;
                showDetailModal('masuk', m.id);
            };
            tr.innerHTML = `
                <td>${m.tanggal}</td>
                <td><div style="font-weight: 600;">${m.mr || "-"}</div></td>
                <td><div style="font-weight: 600;">${m.pr || "-"}</div></td>
                <td><code style="color: var(--accent-blue); font-weight: 600;">${matKode}</code></td>
                <td><strong class="text-blue">${matName}</strong></td>
                <td><strong class="text-green">+${m.jumlah}</strong></td>
                <td><span class="badge badge-blue">${mat ? mat.satuan : ""}</span></td>
                <td style="font-size: 0.8rem; color: var(--text-secondary); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${m.keperluan || ""}">${m.keperluan || "-"}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit-btn" onclick="openEditMasuk('${m.id}')" title="Edit Data Barang Masuk">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn-icon delete-btn" onclick="deleteMasuk('${m.id}')" title="Batalkan Penerimaan (Kurangi Stok)">
                            <i data-lucide="trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableMasukBody.appendChild(tr);
        });
        if (filteredMasuk.length === 0) {
            tableMasukBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Riwayat barang masuk tidak ditemukan.</td></tr>`;
        }

        const kpiTx = document.getElementById("kpi-masuk-transaksi");
        const kpiQty = document.getElementById("kpi-masuk-kuantitas");
        if (kpiTx) kpiTx.textContent = filteredMasuk.length.toLocaleString("id-ID");
        if (kpiQty) kpiQty.textContent = totalQtyMasuk.toLocaleString("id-ID");
    }

    // --- 5d. Order Barang Tab Table ---
    const tableOrderBody = document.getElementById("table-order-body");
    const searchOrderQuery = document.getElementById("search-order")?.value.toLowerCase() || "";
    if (tableOrderBody) {
        tableOrderBody.innerHTML = "";
        
        const filteredOrder = ordersData.filter(o => {
            const matName = o.nama ? o.nama.toLowerCase() : "";
            const matKode = o.partnumber ? o.partnumber.toLowerCase() : "";
            const mrMatch = o.mr ? o.mr.toLowerCase().includes(searchOrderQuery) : false;
            const prMatch = o.pr ? o.pr.toLowerCase().includes(searchOrderQuery) : false;
            return matName.includes(searchOrderQuery) || matKode.includes(searchOrderQuery) || mrMatch || prMatch;
        });

        filteredOrder.forEach(o => {
            let qtyMasuk = 0;
            barangMasuk.forEach(m => {
                const mat = stok.find(s => s.id === m.materialId);
                const matKode = mat ? mat.kode : "";
                const matNama = mat ? mat.nama : "";

                const matchMR = o.mr && m.mr && o.mr.toLowerCase() === m.mr.toLowerCase();
                const matchPR = o.pr && m.pr && o.pr.toLowerCase() === m.pr.toLowerCase();
                const matchKode = o.partnumber && matKode && o.partnumber.toLowerCase() === matKode.toLowerCase();
                const matchNama = o.nama && matNama && o.nama.toLowerCase() === matNama.toLowerCase();

                if ((matchMR || matchPR) && (matchKode || matchNama)) {
                    qtyMasuk += m.jumlah;
                }
            });

            let statusHTML = '';
            if (qtyMasuk === 0) {
                statusHTML = '<span class="badge badge-red">Pending</span>';
            } else if (qtyMasuk < o.qty) {
                statusHTML = `<span class="badge badge-orange">Partial (${qtyMasuk}/${o.qty})</span>`;
            } else {
                statusHTML = `<span class="badge badge-green">Completed</span>`;
            }

            const tr = document.createElement("tr");
            tr.style.cursor = "pointer";
            tr.onclick = function(e) {
                if (e.target.closest('.action-buttons')) return;
                showDetailModal('order', o.id);
            };
            tr.innerHTML = `
                <td>${o.tanggal}</td>
                <td><div style="font-weight: 600;">${o.mr || "-"}</div></td>
                <td><div style="font-weight: 600;">${o.pr || "-"}</div></td>
                <td><code style="color: var(--accent-blue); font-weight: 600;">${o.partnumber || "-"}</code></td>
                <td><strong class="text-blue">${o.nama}</strong></td>
                <td><strong class="text-orange">${o.qty}</strong></td>
                <td><span class="badge badge-blue">${o.satuan}</span></td>
                <td>${statusHTML}</td>
                <td style="font-size: 0.8rem; color: var(--text-secondary); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${o.keperluan || ""}">${o.keperluan || "-"}</td>
                <td style="font-size: 0.8rem; color: var(--text-secondary); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${o.remark || ""}">${o.remark || "-"}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon add-btn" onclick="openMasukFromOrder('${o.id}')" title="Terima Barang dari Order ini" style="color: var(--accent-green);">
                            <i data-lucide="package-plus"></i>
                        </button>
                        <button class="btn-icon edit-btn" onclick="openEditOrder('${o.id}')" title="Edit Order">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn-icon delete-btn" onclick="deleteOrder('${o.id}')" title="Hapus Order">
                            <i data-lucide="trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableOrderBody.appendChild(tr);
        });
        if (filteredOrder.length === 0) {
            tableOrderBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 30px;">Data order barang tidak ditemukan.</td></tr>`;
        }
    }

    // --- 6. Stok Tab Table ---
    const tableStokBody = document.getElementById("table-stok-body");
    const searchStokQuery = document.getElementById("search-stok").value.toLowerCase();
    const activePill = document.querySelector("#filter-stok-status button.active").getAttribute("data-filter");
    tableStokBody.innerHTML = "";

    const filteredStok = stok.filter(item => {
        const matchSearch = item.nama.toLowerCase().includes(searchStokQuery) || item.kode.toLowerCase().includes(searchStokQuery);
        
        let matchFilter = true;
        if (activePill === "aman") {
            matchFilter = item.stok > item.min;
        } else if (activePill === "menipis") {
            matchFilter = item.stok > 0 && item.stok <= item.min;
        } else if (activePill === "kritis") {
            matchFilter = item.stok === 0;
        }
        
        return matchSearch && matchFilter;
    });

    filteredStok.forEach(item => {
        let statusBadge = `<span class="badge badge-green">Aman</span>`;
        if (item.stok === 0) {
            statusBadge = `<span class="badge badge-red">Habis</span>`;
        } else if (item.stok <= item.min) {
            statusBadge = `<span class="badge badge-orange">Menipis</span>`;
        }

        const tr = document.createElement("tr");
        tr.className = "clickable-row";
        tr.onclick = function(e) {
            if(e.target.closest('button')) return;
            showDetailModal('stok', item.id);
        };
        tr.innerHTML = `
            <td><code>${item.kode}</code></td>
            <td><strong>${item.nama}</strong></td>
            <td><strong class="text-blue" style="font-size: 1.05rem;">${item.stok}</strong></td>
            <td>${item.min}</td>
            <td><span class="badge badge-blue">${item.satuan}</span></td>
            <td>${item.gudang}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit-btn" onclick="openEditStok('${item.id}')" title="Edit Material">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn-icon delete-btn" onclick="deleteStok('${item.id}')" title="Hapus Material">
                        <i data-lucide="trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableStokBody.appendChild(tr);
    });
    if (filteredStok.length === 0) {
        tableStokBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Item material tidak ditemukan.</td></tr>`;
    }

    renderCharts();
    lucide.createIcons();
}

// 8. CHART RENDERING
function renderCharts() {
    if (chartFinanceInstance) chartFinanceInstance.destroy();
    if (chartPieInstance) chartPieInstance.destroy();
    if (window.chartPortofolioInstance) window.chartPortofolioInstance.destroy();

    const canvasFinance = document.getElementById("chart-rab-vs-realisasi");
    if (!canvasFinance) return;

    const ctxFinance = canvasFinance.getContext('2d');
    const dashboardFases = getFilteredFasesForDashboard();

    const labels = dashboardFases.map(f => f.nama.length > 15 ? f.nama.substring(0, 15) + "..." : f.nama);
    
    // Line Chart: Speed of Completion (Target Duration vs Actual Duration)
    const targetDurations = dashboardFases.map(f => {
        if (f.mulai && f.selesai) {
            return analyzeDateSchedule(f.mulai, f.selesai, f.aktualMulai, f.aktualSelesai, f.progres).targetHari;
        }
        return 0;
    });
    
    const actualDurations = dashboardFases.map(f => {
        if (f.mulai && f.selesai) {
            return analyzeDateSchedule(f.mulai, f.selesai, f.aktualMulai, f.aktualSelesai, f.progres).aktualHari;
        }
        return 0;
    });

    chartFinanceInstance = new Chart(canvasFinance, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Target Durasi (Hari)',
                    data: targetDurations,
                    backgroundColor: 'rgba(56, 189, 248, 0.7)',
                    borderColor: 'rgba(56, 189, 248, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Aktual Durasi (Hari)',
                    data: actualDurations,
                    backgroundColor: 'rgba(245, 158, 11, 0.7)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.06)', borderDash: [5, 5] },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', size: 11 },
                        callback: function(value) { return value + ' Hr'; }
                    }
                },
                x: { 
                    grid: { display: false }, 
                    ticks: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans', size: 11 } } 
                }
            },
            plugins: {
                legend: { 
                    labels: { color: '#f8fafc', font: { family: 'Plus Jakarta Sans', size: 12 }, usePointStyle: true, boxWidth: 8 } 
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) { return ' ' + context.dataset.label + ': ' + context.raw + ' Hari'; }
                    }
                }
            },
            onClick: function(e, activeElements) {
                if (activeElements.length > 0) {
                    const dataIndex = activeElements[0].index;
                    const clickedFase = dashboardFases[dataIndex];
                    if (clickedFase) navigateToFaseDetails(clickedFase.id);
                }
            }
        }
    });

    const ctxPie = canvasPie.getContext('2d');
    const gradientBarTarget = ctxPie.createLinearGradient(0, 0, 0, 350);
    gradientBarTarget.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
    gradientBarTarget.addColorStop(1, 'rgba(56, 189, 248, 0.1)');

    const gradientBarActual = ctxPie.createLinearGradient(0, 0, 0, 350);
    gradientBarActual.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
    gradientBarActual.addColorStop(1, 'rgba(16, 185, 129, 0.1)');

    // Progress Compare Chart
    const targetProgressArr = dashboardFases.map(f => f.target || 0);
    const actualProgressArr = dashboardFases.map(f => f.progres || 0);

    chartPieInstance = new Chart(canvasPie, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Target Progres (%)',
                    data: targetProgressArr,
                    backgroundColor: gradientBarTarget,
                    borderColor: 'rgba(56, 189, 248, 1)',
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Aktual Progres (%)',
                    data: actualProgressData,
                    backgroundColor: gradientBarActual,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.06)', borderDash: [5, 5] },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', size: 11 },
                        callback: function(value) { return value + '%'; }
                    }
                },
                x: { 
                    grid: { display: false }, 
                    ticks: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans', size: 11 } } 
                }
            },
            plugins: {
                legend: { 
                    labels: { color: '#f8fafc', font: { family: 'Plus Jakarta Sans', size: 12 }, usePointStyle: true, boxWidth: 8 } 
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) { return ' ' + context.dataset.label + ': ' + context.raw + '%'; }
                    }
                }
            },
            onClick: function(e, activeElements) {
                if (activeElements.length > 0) {
                    const dataIndex = activeElements[0].index;
                    const clickedFase = fases[dataIndex];
                    if (clickedFase) navigateToFaseDetails(clickedFase.id);
                }
            }
        }
    });

    // 3rd Chart: Distribusi Item Pekerjaan
    const ctxPortofolio = canvasPortofolio.getContext('2d');
    let itemKlasifikasiMap = {
        "Project Baru": 0,
        "Maintenance": 0,
        "Pekerjaan Lain-lain": 0
    };
    
    dashboardFases.forEach(fase => {
        const klas = fase.klasifikasi || "Project Baru";
        const faseSubs = subPekerjaan.filter(sub => sub.faseId === fase.id);
        let itemCount = 0;
        faseSubs.forEach(sub => {
            const subItems = rab.filter(item => item.subPekerjaanId === sub.id);
            itemCount += subItems.length;
        });
        if (itemKlasifikasiMap[klas] !== undefined) {
            itemKlasifikasiMap[klas] += itemCount;
        } else {
            itemKlasifikasiMap["Pekerjaan Lain-lain"] += itemCount;
        }
    });

    const dLabels = ["Project Baru", "Maintenance", "Lain-lain"];
    const dData = [itemKlasifikasiMap["Project Baru"], itemKlasifikasiMap["Maintenance"], itemKlasifikasiMap["Pekerjaan Lain-lain"]];
    const dColors = ['rgba(56, 189, 248, 0.9)', 'rgba(16, 185, 129, 0.9)', 'rgba(148, 163, 184, 0.9)'];

    window.chartPortofolioInstance = new Chart(ctxPortofolio, {
        type: 'doughnut',
        data: {
            labels: dLabels,
            datasets: [{
                data: dData,
                backgroundColor: dColors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#f8fafc', font: { family: 'Plus Jakarta Sans', size: 12 }, usePointStyle: true, boxWidth: 8, padding: 20 }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12
                }
            }
        }
    });
}

// 8b. RENDER USAGE PROJECT SUMMARY CARDS
function renderUsageProjectSummary() {
    const container = document.getElementById('usage-project-summary');
    if (!container) return;
    container.innerHTML = '';

    // Group penggunaan by faseId
    const projectMap = {};
    penggunaan.forEach(p => {
        const key = p.faseId || 'umum';
        if (!projectMap[key]) {
            projectMap[key] = { items: [], totalQty: 0, totalEstCost: 0, materials: new Set() };
        }
        projectMap[key].items.push(p);
        projectMap[key].totalQty += p.jumlah;
        projectMap[key].materials.add(p.materialId);

        // Estimate cost from RAB harga satuan
        const mat = stok.find(s => s.id === p.materialId);
        if (mat) {
            // Try to find RAB item for this material to get unit price
            const rabItem = rab.find(r => r.materialId === p.materialId);
            const unitPrice = rabItem ? rabItem.harga : 0;
            projectMap[key].totalEstCost += p.jumlah * unitPrice;
        }
    });

    const projectKeys = Object.keys(projectMap);
    if (projectKeys.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 16px; color: var(--text-muted); font-size: 0.85rem;">Belum ada data penggunaan material untuk ditampilkan per proyek.</div>';
        return;
    }

    const cardColors = ['var(--accent-blue)', 'var(--accent-orange)', 'var(--accent-green)', 'var(--accent-red)', '#a855f7'];
    let colorIdx = 0;

    projectKeys.forEach(key => {
        const data = projectMap[key];
        const fase = fases.find(f => f.id === key);
        const faseName = fase ? fase.nama : 'Umum / Tidak Terkategori';
        const accentColor = cardColors[colorIdx % cardColors.length];
        colorIdx++;

        const card = document.createElement('div');
        card.className = 'project-cost-card';
        card.style.setProperty('--card-accent', accentColor);
        card.querySelector?.('::before')?.style?.setProperty('background', accentColor);

        card.innerHTML = `
            <style>.project-cost-card:nth-child(${colorIdx})::before { background: ${accentColor}; }</style>
            <div class="project-cost-header">
                <span class="project-cost-name" title="${faseName}">${faseName}</span>
                <span class="project-cost-badge">${data.items.length} Transaksi</span>
            </div>
            <div class="project-cost-stats">
                <div class="project-cost-row">
                    <span class="project-cost-label">Jumlah Material Unik</span>
                    <span class="project-cost-value">${data.materials.size} Item</span>
                </div>
                <div class="project-cost-row">
                    <span class="project-cost-label">Total Qty Dipakai</span>
                    <span class="project-cost-value">${data.totalQty.toLocaleString('id-ID')}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 8c. RENDER MASUK PROJECT SUMMARY CARDS
function renderMasukProjectSummary() {
    const container = document.getElementById('masuk-project-summary');
    if (!container) return;
    container.innerHTML = '';

    const projectMap = {};
    barangMasuk.forEach(m => {
        const key = m.faseId || 'umum';
        if (!projectMap[key]) projectMap[key] = { masukQty: 0, pakaiQty: 0, items: [] };
        projectMap[key].masukQty += m.jumlah;
        projectMap[key].items.push(m);
    });

    penggunaan.forEach(p => {
        const key = p.faseId || 'umum';
        if (!projectMap[key]) projectMap[key] = { masukQty: 0, pakaiQty: 0, items: [] };
        projectMap[key].pakaiQty += p.jumlah;
    });

    const projectKeys = Object.keys(projectMap).filter(k => k !== 'umum' && projectMap[k].masukQty > 0);
    if (projectKeys.length === 0) return;

    const cardColors = ['var(--accent-blue)', 'var(--accent-orange)', 'var(--accent-green)', 'var(--accent-red)', '#a855f7'];
    let colorIdx = 0;

    projectKeys.forEach(key => {
        const data = projectMap[key];
        const fase = fases.find(f => f.id === key);
        const faseName = fase ? fase.nama : 'Umum';
        const accentColor = cardColors[colorIdx % cardColors.length];
        colorIdx++;

        const sisa = data.masukQty - data.pakaiQty;
        const sisaClass = sisa < 0 ? 'text-red' : 'text-green';

        const card = document.createElement('div');
        card.className = 'project-cost-card';
        card.style.setProperty('--card-accent', accentColor);
        card.querySelector?.('::before')?.style?.setProperty('background', accentColor);

        card.innerHTML = `
            <style>.project-cost-card:nth-child(${colorIdx})::before { background: ${accentColor}; }</style>
            <div class="project-cost-header">
                <span class="project-cost-name" title="Subsidi ${faseName}">Subsidi ${faseName}</span>
                <span class="project-cost-badge">${data.items.length} Masuk</span>
            </div>
            <div class="project-cost-stats">
                <div class="project-cost-row">
                    <span class="project-cost-label">Total Masuk</span>
                    <span class="project-cost-value">${data.masukQty.toLocaleString('id-ID')}</span>
                </div>
                <div class="project-cost-row">
                    <span class="project-cost-label">Total Terpakai</span>
                    <span class="project-cost-value">${data.pakaiQty.toLocaleString('id-ID')}</span>
                </div>
                <div class="project-cost-total">
                    <div class="project-cost-row">
                        <span class="project-cost-label">Sisa Subsidi</span>
                        <span class="project-cost-value ${sisaClass}">${sisa.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 9. MODALS & DEPENDENT DROPDOWNS SETUP
window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("active");
        populateDropdowns();
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
};

function populateDropdowns() {
    // 1. Populate Category dropdowns in Category/Sub modals
    const subFaseSelect = document.getElementById("sub-fase-id");
    if (subFaseSelect) {
        subFaseSelect.innerHTML = `<option value="" disabled selected>-- Pilih Kategori Pekerjaan --</option>`;
        fases.forEach(f => { subFaseSelect.innerHTML += `<option value="${f.id}">${f.nama}</option>`; });
    }

    const rabFaseSelect = document.getElementById("rab-fase-select");
    if (rabFaseSelect) {
        rabFaseSelect.innerHTML = `<option value="" disabled selected>-- Pilih Kategori --</option>`;
        fases.forEach(f => { rabFaseSelect.innerHTML += `<option value="${f.id}">${f.nama}</option>`; });
    }

    // 2. Populate Material inventory dropdown
    const selectMat = document.getElementById("penggunaan-material");
    if (selectMat) {
        selectMat.innerHTML = `<option value="" disabled selected>-- Pilih Material dari Gudang --</option>`;
        stok.forEach(item => {
            selectMat.innerHTML += `<option value="${item.id}">${item.nama} (Stok: ${item.stok} ${item.satuan})</option>`;
        });
    }

    const rabMaterialSelect = document.getElementById("rab-material-id");
    if (rabMaterialSelect) {
        rabMaterialSelect.innerHTML = `<option value="" disabled selected>-- Pilih Material --</option>`;
        stok.forEach(item => {
            rabMaterialSelect.innerHTML += `<option value="${item.id}">${item.kode} - ${item.nama}</option>`;
        });
    }

    // 3. Populate Usage log category selector
    const selectPenggunaanFase = document.getElementById("penggunaan-fase");
    if (selectPenggunaanFase) {
        selectPenggunaanFase.innerHTML = `<option value="" disabled selected>-- Pilih Kategori --</option>`;
        fases.forEach(f => {
            selectPenggunaanFase.innerHTML += `<option value="${f.id}">${f.nama}</option>`;
        });
    }

    // 4. Populate Adjust Stock modal
    const selectAdjustMat = document.getElementById("adjust-material");
    if (selectAdjustMat) {
        selectAdjustMat.innerHTML = `<option value="" disabled selected>-- Pilih Material --</option>`;
        stok.forEach(item => {
            selectAdjustMat.innerHTML += `<option value="${item.id}">${item.kode} - ${item.nama}</option>`;
        });
    }

    // 5. Populate Masuk dropdown
    const masukFaseSelect = document.getElementById("masuk-fase");
    if (masukFaseSelect) {
        masukFaseSelect.innerHTML = `<option value="">-- Tidak Ditentukan / Stok Umum --</option>`;
        fases.forEach(f => {
            masukFaseSelect.innerHTML += `<option value="${f.id}">${f.nama}</option>`;
        });
    }
}

// Dependent Dropdown for RAB Modal
const rabFaseSelect = document.getElementById("rab-fase-select");
if (rabFaseSelect) {
    rabFaseSelect.addEventListener("change", (e) => {
        const faseId = e.target.value;
        const subSelect = document.getElementById("rab-sub-select");
        
        subSelect.innerHTML = `<option value="" disabled selected>-- Pilih Sub-Pekerjaan --</option>`;
        const filteredSubs = subPekerjaan.filter(sub => sub.faseId === faseId);
        filteredSubs.forEach(sub => {
            subSelect.innerHTML += `<option value="${sub.id}">${sub.nama}</option>`;
        });
    });
}

// Dependent Dropdown for Usage Modal
const usageFaseSelect = document.getElementById("penggunaan-fase");
if (usageFaseSelect) {
    usageFaseSelect.addEventListener("change", (e) => {
        const faseId = e.target.value;
        const subSelect = document.getElementById("penggunaan-sub");
        
        subSelect.innerHTML = `<option value="" disabled selected>-- Pilih Sub-Pekerjaan --</option>`;
        const filteredSubs = subPekerjaan.filter(sub => sub.faseId === faseId);
        filteredSubs.forEach(sub => {
            subSelect.innerHTML += `<option value="${sub.id}">${sub.nama}</option>`;
        });
    });
}

// Toggle material selector block based on type selection in RAB modal
const rabTipeSelect = document.getElementById("rab-tipe");
if (rabTipeSelect) {
    rabTipeSelect.addEventListener("change", (e) => {
        const tipe = e.target.value;
        const materialGroup = document.getElementById("group-rab-material");
        const materialIdSelect = document.getElementById("rab-material-id");
        
        if (tipe === "Bahan") {
            materialGroup.classList.remove("hidden");
            materialIdSelect.required = true;
        } else {
            materialGroup.classList.add("hidden");
            materialIdSelect.required = false;
            materialIdSelect.value = "";
        }
    });
}

// Auto-fill item details when selecting material in RAB modal
const rabMaterialIdSelect = document.getElementById("rab-material-id");
if (rabMaterialIdSelect) {
    rabMaterialIdSelect.addEventListener("change", (e) => {
        const matId = e.target.value;
        const selectedMaterial = stok.find(s => s.id === matId);
        if (selectedMaterial) {
            document.getElementById("rab-nama").value = `Pengadaan ${selectedMaterial.nama}`;
            document.getElementById("rab-satuan").value = selectedMaterial.satuan;
        }
    });
}

// 10. CRUD FOR LEVEL 2 (SUB-PEKERJAAN)
document.getElementById("btn-add-sub-pekerjaan-trigger").addEventListener("click", () => {
    document.getElementById("form-sub-pekerjaan").reset();
    document.getElementById("sub-id").value = "";
    document.getElementById("modal-sub-pekerjaan-title").textContent = "Tambah Sub-Pekerjaan";
    openModal("modal-sub-pekerjaan");
});

window.openAddSubPekerjaanFromFase = function(faseId) {
    document.getElementById("form-sub-pekerjaan").reset();
    document.getElementById("sub-id").value = "";
    openModal("modal-sub-pekerjaan");
    document.getElementById("sub-fase-id").value = faseId;
    document.getElementById("modal-sub-pekerjaan-title").textContent = "Tambah Sub-Pekerjaan Baru";
};

window.openEditSubPekerjaan = function(subId) {
    const sub = subPekerjaan.find(s => s.id === subId);
    if (!sub) return;

    document.getElementById("sub-id").value = sub.id;
    document.getElementById("sub-fase-id").value = sub.faseId;
    document.getElementById("sub-nama").value = sub.nama;
    document.getElementById("sub-jadwal-mulai").value = sub.jadwalMulai || "";
    document.getElementById("sub-jadwal-selesai").value = sub.jadwalSelesai || "";
    document.getElementById("sub-aktual-mulai").value = sub.aktualMulai || "";
    document.getElementById("sub-aktual-selesai").value = sub.aktualSelesai || "";

    document.getElementById("modal-sub-pekerjaan-title").textContent = "Edit Sub-Pekerjaan";
    openModal("modal-sub-pekerjaan");
};

document.getElementById("form-sub-pekerjaan").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("sub-id").value;
    const faseId = document.getElementById("sub-fase-id").value;
    const nama = document.getElementById("sub-nama").value;
    const jadwalMulai = document.getElementById("sub-jadwal-mulai").value;
    const jadwalSelesai = document.getElementById("sub-jadwal-selesai").value;
    const aktualMulai = document.getElementById("sub-aktual-mulai").value;
    const aktualSelesai = document.getElementById("sub-aktual-selesai").value;

    if (id) {
        // Edit
        const index = subPekerjaan.findIndex(s => s.id === id);
        if (index !== -1) {
            subPekerjaan[index].faseId = faseId;
            subPekerjaan[index].nama = nama;
            subPekerjaan[index].jadwalMulai = jadwalMulai;
            subPekerjaan[index].jadwalSelesai = jadwalSelesai;
            subPekerjaan[index].aktualMulai = aktualMulai;
            subPekerjaan[index].aktualSelesai = aktualSelesai;
        }
    } else {
        // Add
        const newId = "sp-" + (subPekerjaan.length + 1) + Math.floor(Math.random()*100);
        subPekerjaan.push({ 
            id: newId, 
            faseId, 
            nama, 
            jadwalMulai, 
            jadwalSelesai, 
            aktualMulai, 
            aktualSelesai, 
            progres: 0, 
            target: 0 
        });
    }

    expandedRows.add(faseId);
    saveState();
    closeModal("modal-sub-pekerjaan");
    showToast('success', 'Berhasil Disimpan', `Sub-Pekerjaan "${nama}" berhasil ${id ? 'diperbarui' : 'ditambahkan'}.`);
    calculateKPIs();
    renderAllTables();
});

window.deleteSubPekerjaan = function(subId) {
    const associatedItems = rab.filter(item => item.subPekerjaanId === subId);
    const sub = subPekerjaan.find(s => s.id === subId);
    const subName = sub ? sub.nama : 'Sub-Pekerjaan';

    const doDelete = () => {
        subPekerjaan = subPekerjaan.filter(s => s.id !== subId);
        rab = rab.filter(item => item.subPekerjaanId !== subId);
        saveState();
        showToast('success', 'Berhasil Dihapus', `Sub-Pekerjaan "${subName}" telah dihapus.`);
        calculateKPIs();
        renderAllTables();
    };

    if (associatedItems.length > 0) {
        showConfirm('Hapus Sub-Pekerjaan?', `Sub-pekerjaan ini memiliki ${associatedItems.length} item rincian anggaran RAB di dalamnya. Menghapus sub-pekerjaan ini juga akan menghapus seluruh rinciannya secara permanen.`, doDelete, true);
    } else {
        showConfirm('Hapus Sub-Pekerjaan?', `Apakah Anda yakin ingin menghapus "${subName}"?`, doDelete, true);
    }
};

// 11. CRUD LEVEL 3 (RAB DETAILS & CATEGORY LEVEL 1)
document.getElementById("btn-add-kategori").addEventListener("click", () => {
    document.getElementById("form-kategori").reset();
    document.getElementById("kategori-id").value = "";
    document.getElementById("modal-kategori-title").textContent = "Tambah Kategori Pekerjaan";
    openModal("modal-kategori");
});

window.openAddRabFromSub = function(faseId, subId) {
    document.getElementById("form-rab").reset();
    document.getElementById("rab-id").value = "";
    openModal("modal-rab");
    
    // Set dependent values
    document.getElementById("rab-fase-select").value = faseId;
    
    // Trigger populate sub dropdown
    const subSelect = document.getElementById("rab-sub-select");
    subSelect.innerHTML = `<option value="" disabled selected>-- Pilih Sub-Pekerjaan --</option>`;
    const filteredSubs = subPekerjaan.filter(sub => sub.faseId === faseId);
    filteredSubs.forEach(sub => {
        subSelect.innerHTML += `<option value="${sub.id}">${sub.nama}</option>`;
    });
    
    subSelect.value = subId;
    
    // Default Jasa
    document.getElementById("rab-tipe").value = "Jasa";
    document.getElementById("group-rab-material").classList.add("hidden");
    document.getElementById("modal-rab-title").textContent = "Tambah Item Anggaran";
};

window.openEditCategory = function(faseId) {
    const fase = fases.find(f => f.id === faseId);
    if (!fase) return;

    document.getElementById("kategori-id").value = fase.id;
    document.getElementById("kategori-nama").value = fase.nama;
    document.getElementById("kategori-mulai").value = fase.mulai;
    document.getElementById("kategori-selesai").value = fase.selesai;

    document.getElementById("modal-kategori-title").textContent = "Edit Kategori Pekerjaan";
    openModal("modal-kategori");
};

window.deleteCategory = function(faseId) {
    const associatedSubs = subPekerjaan.filter(sub => sub.faseId === faseId);
    const fase = fases.find(f => f.id === faseId);
    const faseName = fase ? fase.nama : 'Kategori';

    const doDelete = () => {
        fases = fases.filter(f => f.id !== faseId);
        const subIds = associatedSubs.map(s => s.id);
        subPekerjaan = subPekerjaan.filter(s => s.faseId !== faseId);
        rab = rab.filter(item => !subIds.includes(item.subPekerjaanId));
        saveState();
        showToast('success', 'Kategori Dihapus', `Kategori "${faseName}" dan seluruh isinya telah dihapus.`);
        calculateKPIs();
        renderAllTables();
        renderCharts();
    };

    if (associatedSubs.length > 0) {
        showConfirm('Hapus Kategori Pekerjaan?', `Kategori ini memiliki ${associatedSubs.length} sub-pekerjaan bertingkat di dalamnya. Menghapus kategori ini akan menghapus seluruh data sub-pekerjaan dan RAB detail terkait secara permanen.`, doDelete, true);
    } else {
        showConfirm('Hapus Kategori Pekerjaan?', `Apakah Anda yakin ingin menghapus "${faseName}"?`, doDelete, true);
    }
};

window.openEditRab = function(itemId) {
    const item = rab.find(r => r.id === itemId);
    if (!item) return;

    // Find parent sub-pekerjaan to trace parent category
    const parentSub = subPekerjaan.find(s => s.id === item.subPekerjaanId);
    if (!parentSub) return;

    document.getElementById("rab-id").value = item.id;
    document.getElementById("rab-fase-select").value = parentSub.faseId;

    // Trigger populate sub dropdown
    const subSelect = document.getElementById("rab-sub-select");
    subSelect.innerHTML = `<option value="" disabled selected>-- Pilih Sub-Pekerjaan --</option>`;
    const filteredSubs = subPekerjaan.filter(sub => sub.faseId === parentSub.faseId);
    filteredSubs.forEach(sub => {
        subSelect.innerHTML += `<option value="${sub.id}">${sub.nama}</option>`;
    });
    subSelect.value = item.subPekerjaanId;

    document.getElementById("rab-tipe").value = item.tipe || "Jasa";
    
    const materialGroup = document.getElementById("group-rab-material");
    const materialIdSelect = document.getElementById("rab-material-id");
    if (item.tipe === "Bahan") {
        materialGroup.classList.remove("hidden");
        materialIdSelect.value = item.materialId || "";
        materialIdSelect.required = true;
    } else {
        materialGroup.classList.add("hidden");
        materialIdSelect.value = "";
        materialIdSelect.required = false;
    }

    document.getElementById("rab-nama").value = item.nama;
    document.getElementById("rab-satuan").value = item.satuan;
    document.getElementById("rab-volume").value = item.volume;

    document.getElementById("modal-rab-title").textContent = "Edit Rincian Item RAB";
    openModal("modal-rab");
};

// RAB Item Submit (Bahan vs Jasa)
document.getElementById("form-rab").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("rab-id").value;
    const subPekerjaanId = document.getElementById("rab-sub-select").value;
    const tipe = document.getElementById("rab-tipe").value;
    const materialId = tipe === "Bahan" ? document.getElementById("rab-material-id").value : null;
    const nama = document.getElementById("rab-nama").value;
    const satuan = document.getElementById("rab-satuan").value;
    const volume = parseFloat(document.getElementById("rab-volume").value);
    const harga = id ? (rab.find(r => r.id === id)?.harga || 1000) : 1000;
    const realisasi = id ? (rab.find(r => r.id === id)?.realisasi || 0) : 0;

    const parentSub = subPekerjaan.find(s => s.id === subPekerjaanId);
    if (!parentSub) return;

    if (id) {
        // Edit
        const index = rab.findIndex(r => r.id === id);
        if (index !== -1) {
            rab[index] = { ...rab[index], subPekerjaanId, tipe, materialId, nama, satuan, volume, harga, realisasi };
        }
    } else {
        // Add
        const newId = "r-" + (rab.length + 1) + Math.floor(Math.random()*100);
        rab.push({ id: newId, subPekerjaanId, tipe, materialId, nama, satuan, volume, harga, realisasi, progres: 0, target: 0 });
    }

    expandedRows.add(parentSub.faseId);
    saveState();
    closeModal("modal-rab");
    showToast('success', 'Item RAB Disimpan', `Rincian "${nama}" berhasil ${id ? 'diperbarui' : 'ditambahkan'}.`);
    calculateKPIs();
    renderAllTables();
    renderCharts();
});

window.deleteRab = function(itemId) {
    const item = rab.find(r => r.id === itemId);
    const itemName = item ? item.nama : 'Item';
    showConfirm('Hapus Item RAB?', `Apakah Anda yakin ingin menghapus "${itemName}" dari rincian anggaran?`, () => {
        rab = rab.filter(r => r.id !== itemId);
        saveState();
        showToast('success', 'Item Dihapus', `"${itemName}" berhasil dihapus dari RAB.`);
        calculateKPIs();
        renderAllTables();
        renderCharts();
    }, true);
};

// 12. PHYSICAL PROGRESS EDIT (LEVEL 3 - RAB ITEM)
window.openEditProgres = function(rabId) {
    const item = rab.find(r => r.id === rabId);
    if (!item) return;

    document.getElementById("edit-progres-sub-id").value = item.id;
    document.getElementById("edit-progres-nama").value = item.nama;
    document.getElementById("edit-progres-target").value = item.target || 0;
    document.getElementById("edit-progres-aktual").value = item.progres || 0;

    const kendalaSelect = document.getElementById("edit-progres-kendala");
    const catatanInput = document.getElementById("edit-progres-catatan");
    const groupCatatan = document.getElementById("group-edit-progres-catatan");
    
    if(kendalaSelect) kendalaSelect.value = item.kendala || "";
    if(catatanInput) catatanInput.value = item.catatanKendala || "";
    
    if (item.kendala && groupCatatan) {
        groupCatatan.style.display = "block";
    } else if(groupCatatan) {
        groupCatatan.style.display = "none";
    }

    openModal("modal-edit-progres");
};

document.getElementById("form-edit-progres").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-progres-sub-id").value;
    const target = parseInt(document.getElementById("edit-progres-target").value);
    const progres = parseInt(document.getElementById("edit-progres-aktual").value);
    const kendala = document.getElementById("edit-progres-kendala").value;
    const catatanKendala = document.getElementById("edit-progres-catatan").value;

    const index = rab.findIndex(r => r.id === id);
    if (index !== -1) {
        rab[index].target = target;
        rab[index].progres = progres;
        rab[index].kendala = kendala;
        rab[index].catatanKendala = catatanKendala;
        
        // Find parent sub to expand the correct Fase row
        const parentSub = subPekerjaan.find(s => s.id === rab[index].subPekerjaanId);
        if (parentSub) {
            expandedRows.add(parentSub.faseId);
        }
    }

    saveState();
    closeModal("modal-edit-progres");
    showToast('success', 'Progres Diperbarui', 'Data progres fisik berhasil disimpan.');
    calculateKPIs();
    renderAllTables();
});

document.getElementById("edit-progres-kendala")?.addEventListener("change", (e) => {
    const groupCatatan = document.getElementById("group-edit-progres-catatan");
    if (!groupCatatan) return;
    if (e.target.value) {
        groupCatatan.style.display = "block";
    } else {
        groupCatatan.style.display = "none";
        document.getElementById("edit-progres-catatan").value = "";
    }
});

// 13. MATERIAL USAGE SUBMIT (Linked logistics cost automatically roll up to RAB realisasi)
document.getElementById("form-penggunaan").addEventListener("submit", (e) => {
    e.preventDefault();
    const materialId = document.getElementById("penggunaan-material").value;
    const jumlah = parseFloat(document.getElementById("penggunaan-jumlah").value);
    const tanggal = document.getElementById("penggunaan-tanggal").value;
    const faseId = document.getElementById("penggunaan-fase").value;
    const subPekerjaanId = document.getElementById("penggunaan-sub").value;
    const penerima = document.getElementById("penggunaan-penerima").value;
    const keterangan = document.getElementById("penggunaan-keterangan").value;

    const material = stok.find(s => s.id === materialId);
    if (!material) return;

    if (jumlah > material.stok) {
        showToast('error', 'Stok Tidak Cukup!', `Stok ${material.nama} di gudang hanya tersisa ${material.stok} ${material.satuan}.`);
        return;
    }

    // Subtract stock
    material.stok -= jumlah;

    // Log use
    const newId = "p-" + (penggunaan.length + 1) + Math.floor(Math.random()*100);
    penggunaan.push({ id: newId, tanggal, materialId, jumlah, faseId, subPekerjaanId, penerima, keterangan });

    // Look for matching material items in the selected Sub-Pekerjaan (Level 3)
    const subItems = rab.filter(item => item.subPekerjaanId === subPekerjaanId);
    const matchingRabItem = subItems.find(item => item.materialId === materialId);
    
    if (matchingRabItem) {
        // Realization cost added automatically: Qty used * Planned Unit Price
        const addedCost = jumlah * matchingRabItem.harga;
        matchingRabItem.realisasi += addedCost;
    }

    expandedRows.add(faseId);
    saveState();
    closeModal("modal-penggunaan");
    showToast('success', 'Penggunaan Dicatat', `${jumlah} ${material.satuan} ${material.nama} berhasil dicatat.`);
    calculateKPIs();
    renderAllTables();
    renderCharts();
});

window.deletePenggunaan = function(id) {
    const pLog = penggunaan.find(p => p.id === id);
    if (!pLog) return;
    const mat = stok.find(s => s.id === pLog.materialId);
    const matName = mat ? mat.nama : 'Material';

    showConfirm('Hapus Log Penggunaan?', `Menghapus log ini akan MENGEMBALIKAN ${pLog.jumlah} ${mat ? mat.satuan : ''} ${matName} ke stok gudang dan memotong realisasi biaya di RAB.`, () => {
        const material = stok.find(s => s.id === pLog.materialId);
        if (material) {
            material.stok += pLog.jumlah;
        }

        const subItems = rab.filter(item => item.subPekerjaanId === pLog.subPekerjaanId);
        const matchingRabItem = subItems.find(item => item.materialId === pLog.materialId);
        
        if (matchingRabItem) {
            const subtractedCost = pLog.jumlah * matchingRabItem.harga;
            matchingRabItem.realisasi = Math.max(0, matchingRabItem.realisasi - subtractedCost);
        }

        penggunaan = penggunaan.filter(p => p.id !== id);
        saveState();
        showToast('success', 'Log Dihapus', `Stok ${matName} telah dikembalikan ke gudang.`);
        calculateKPIs();
        renderAllTables();
        renderCharts();
    }, true);
};

// 14. MATERIAL GUDANG GUDANG STOK
document.getElementById("stok-kode").addEventListener("input", (e) => {
    const kode = e.target.value.trim();
    if (!kode) return;
    const existingStok = stok.find(s => s.kode.toLowerCase() === kode.toLowerCase());
    const id = document.getElementById("stok-id").value;
    if (existingStok && existingStok.id !== id) {
        showToast('info', 'Part Number Ditemukan', `Part Number ${kode} sudah terdaftar. Beralih ke mode Edit Material.`);
        document.getElementById("stok-id").value = existingStok.id;
        document.getElementById("stok-kode").value = existingStok.kode;
        document.getElementById("stok-nama").value = existingStok.nama;
        document.getElementById("stok-jumlah").value = existingStok.stok;
        document.getElementById("stok-min").value = existingStok.min;
        document.getElementById("stok-satuan").value = existingStok.satuan;
        document.getElementById("stok-gudang").value = existingStok.gudang;
        document.getElementById("modal-stok-title").textContent = "Edit Material Gudang";
    }
});

document.getElementById("form-stok").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("stok-id").value;
    const kode = document.getElementById("stok-kode").value;
    const nama = document.getElementById("stok-nama").value;
    const stokQty = parseFloat(document.getElementById("stok-jumlah").value);
    const min = parseFloat(document.getElementById("stok-min").value);
    const satuan = document.getElementById("stok-satuan").value;
    const gudang = document.getElementById("stok-gudang").value;

    // Check if Part Number already exists
    const existingStok = stok.find(s => s.kode.toLowerCase() === kode.toLowerCase() && s.id !== id);
    if (existingStok) {
        showToast('error', 'Part Number Sudah Ada', `Part Number ${kode} sudah terdaftar sebagai ${existingStok.nama}. Harap gunakan part number yang berbeda.`);
        return;
    }

    if (id) {
        const index = stok.findIndex(s => s.id === id);
        if (index !== -1) stok[index] = { id, kode, nama, stok: stokQty, min, satuan, gudang };
    } else {
        const newId = "s-" + (stok.length + 1) + Math.floor(Math.random()*100);
        stok.push({ id: newId, kode, nama, stok: stokQty, min, satuan, gudang });
    }

    saveState();
    closeModal("modal-stok");
    showToast('success', 'Material Disimpan', `${nama} berhasil ${id ? 'diperbarui' : 'ditambahkan'} ke inventaris.`);
    calculateKPIs();
    renderAllTables();
});

document.getElementById("form-adjust-stok").addEventListener("submit", (e) => {
    e.preventDefault();
    const materialId = document.getElementById("adjust-material").value;
    const type = document.getElementById("adjust-type").value;
    const qty = parseFloat(document.getElementById("adjust-qty").value);

    const material = stok.find(s => s.id === materialId);
    if (!material) return;

    if (type === "in") material.stok += qty;
    else if (type === "set") material.stok = qty;

    saveState();
    closeModal("modal-adjust-stok");
    showToast('success', 'Stok Disesuaikan', `Kuantitas stok ${material.nama} berhasil diperbarui menjadi ${material.stok} ${material.satuan}.`);
    calculateKPIs();
    renderAllTables();
});

window.openEditStok = function(id) {
    const item = stok.find(s => s.id === id);
    if (!item) return;

    document.getElementById("stok-id").value = item.id;
    document.getElementById("stok-kode").value = item.kode;
    document.getElementById("stok-nama").value = item.nama;
    document.getElementById("stok-jumlah").value = item.stok;
    document.getElementById("stok-min").value = item.min;
    document.getElementById("stok-satuan").value = item.satuan;
    document.getElementById("stok-gudang").value = item.gudang;

    document.getElementById("modal-stok-title").textContent = "Edit Material Gudang";
    openModal("modal-stok");
};

window.deleteStok = function(id) {
    const item = stok.find(s => s.id === id);
    const itemName = item ? item.nama : 'Material';
    showConfirm('Hapus Material?', `Apakah Anda yakin ingin menghapus "${itemName}" dari database inventaris gudang?`, () => {
        stok = stok.filter(s => s.id !== id);
        saveState();
        showToast('success', 'Material Dihapus', `"${itemName}" telah dihapus dari inventaris.`);
        calculateKPIs();
        renderAllTables();
    }, true);
};

// 15. INPUT HELPER TRIGGERS
const selectUsageMatVal = document.getElementById("penggunaan-material");
if (selectUsageMatVal) {
    selectUsageMatVal.addEventListener("change", (e) => {
        const materialId = e.target.value;
        const material = stok.find(s => s.id === materialId);
        const info = document.getElementById("stok-tersedia-info");
        if (material) {
            info.textContent = `Stok Tersedia: ${material.stok} ${material.satuan}`;
            document.getElementById("penggunaan-jumlah").max = material.stok;
        } else {
            info.textContent = "Stok Tersedia: -";
        }
    });
}

const selectAdjustMatVal = document.getElementById("adjust-material");
if (selectAdjustMatVal) {
    selectAdjustMatVal.addEventListener("change", (e) => {
        const materialId = e.target.value;
        const material = stok.find(s => s.id === materialId);
        const info = document.getElementById("adjust-current-info");
        if (material) info.value = `${material.stok} ${material.satuan}`;
        else info.value = "-";
    });
}

// 16. SEARCH AND FILTERS LISTENERS
document.getElementById("search-penggunaan")?.addEventListener("input", renderAllTables);
document.getElementById("clear-search-penggunaan")?.addEventListener("click", () => {
    const input = document.getElementById("search-penggunaan");
    if(input) { input.value = ""; renderAllTables(); }
});

document.getElementById("search-stok")?.addEventListener("input", renderAllTables);
document.getElementById("clear-search-stok")?.addEventListener("click", () => {
    const input = document.getElementById("search-stok");
    if(input) { input.value = ""; renderAllTables(); }
});

document.querySelectorAll("#filter-stok-status button").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll("#filter-stok-status button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderAllTables();
    });
});

window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
        e.target.classList.remove("active");
    }
});

// 17. KATEGORI FORM SUBMIT HANDLER

function checkKategoriJustifikasi() {
    const selesai = document.getElementById("kategori-selesai").value;
    const aktualSelesai = document.getElementById("kategori-aktual-selesai").value;
    const group = document.getElementById("group-kategori-justifikasi");
    const justifikasiInput = document.getElementById("kategori-justifikasi");

    if (selesai && aktualSelesai) {
        const tSelesai = new Date(selesai);
        const aSelesai = new Date(aktualSelesai);
        if (aSelesai > tSelesai) {
            group.style.display = "block";
            justifikasiInput.required = true;
            return;
        }
    }
    group.style.display = "none";
    justifikasiInput.required = false;
}

document.getElementById("kategori-selesai")?.addEventListener("change", checkKategoriJustifikasi);
document.getElementById("kategori-aktual-selesai")?.addEventListener("change", checkKategoriJustifikasi);

document.getElementById("btn-add-kategori").addEventListener("click", () => {
    document.getElementById("form-kategori").reset();
    document.getElementById("kategori-id").value = "";
    document.getElementById("kategori-klasifikasi").value = "Project Baru";
    document.getElementById("modal-kategori-title").textContent = "Tambah Kategori Pekerjaan";
    checkKategoriJustifikasi();
    openModal("modal-kategori");
});

window.openEditCategory = function(faseId) {
    const fase = fases.find(f => f.id === faseId);
    if (!fase) return;

    document.getElementById("kategori-id").value = fase.id;
    document.getElementById("kategori-nama").value = fase.nama;
    document.getElementById("kategori-mulai").value = fase.mulai;
    document.getElementById("kategori-selesai").value = fase.selesai;
    document.getElementById("kategori-aktual-mulai").value = fase.aktualMulai || "";
    document.getElementById("kategori-aktual-selesai").value = fase.aktualSelesai || "";
    document.getElementById("kategori-klasifikasi").value = fase.klasifikasi || "Project Baru";
    document.getElementById("kategori-lampiran").value = fase.lampiran || "";
    document.getElementById("kategori-justifikasi").value = fase.justifikasi || "";

    checkKategoriJustifikasi();
    document.getElementById("modal-kategori-title").textContent = "Edit Kategori Pekerjaan";
    openModal("modal-kategori");
};

document.getElementById("form-kategori").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("kategori-id").value;
    const nama = document.getElementById("kategori-nama").value;
    const mulai = document.getElementById("kategori-mulai").value;
    const selesai = document.getElementById("kategori-selesai").value;
    const aktualMulai = document.getElementById("kategori-aktual-mulai").value;
    const aktualSelesai = document.getElementById("kategori-aktual-selesai").value;
    const klasifikasi = document.getElementById("kategori-klasifikasi").value;
    const lampiran = document.getElementById("kategori-lampiran").value;
    const justifikasi = document.getElementById("kategori-justifikasi").value;

    if (id) {
        // Edit
        const index = fases.findIndex(f => f.id === id);
        if (index !== -1) {
            fases[index].nama = nama;
            fases[index].mulai = mulai;
            fases[index].selesai = selesai;
            fases[index].aktualMulai = aktualMulai;
            fases[index].aktualSelesai = aktualSelesai;
            fases[index].klasifikasi = klasifikasi;
            fases[index].lampiran = lampiran;
            fases[index].justifikasi = justifikasi;
        }
    } else {
        // Add
        const newId = "f-" + (fases.length + 1) + Math.floor(Math.random()*100);
        fases.push({ id: newId, nama, mulai, selesai, aktualMulai, aktualSelesai, klasifikasi, lampiran, justifikasi, progres: 0, target: 0 });
    }

    saveState();
    closeModal("modal-kategori");
    showToast('success', 'Berhasil Disimpan', `Kategori Pekerjaan "${nama}" berhasil ${id ? 'diperbarui' : 'ditambahkan'}.`);
    calculateKPIs();
    renderAllTables();
    renderCharts();
});

// 18. WIRE UP ALL ADD BUTTONS ACROSS MENUS
// Dashboard: Quick Log button → opens Penggunaan modal
document.getElementById("btn-quick-log").addEventListener("click", () => {
    document.getElementById("form-penggunaan").reset();
    document.getElementById("penggunaan-id").value = "";
    document.getElementById("modal-penggunaan-title").textContent = "Catat Penggunaan Material";
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("penggunaan-tanggal").value = today;
    openModal("modal-penggunaan");
});

// Progres: Kelola Kategori button → switches to RAB tab
document.getElementById("btn-add-fase-progres-shortcut").addEventListener("click", () => {
    // Navigate to RAB tab
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    document.getElementById("nav-rab").classList.add("active");
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    document.getElementById("tab-rab").classList.add("active");
    document.getElementById("current-tab-title").textContent = TAB_TITLES.rab.title;
    document.getElementById("current-tab-subtitle").textContent = TAB_TITLES.rab.subtitle;
    toggleProjectTitleCard("rab");
    showToast('info', 'Tab RAB Dibuka', 'Kelola kategori dan sub-pekerjaan dari halaman RAB.');
});

// Penggunaan: Catat Penggunaan Baru button
document.getElementById("btn-log-penggunaan").addEventListener("click", () => {
    document.getElementById("form-penggunaan").reset();
    document.getElementById("penggunaan-id").value = "";
    document.getElementById("modal-penggunaan-title").textContent = "Catat Penggunaan Material";
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("penggunaan-tanggal").value = today;
    openModal("modal-penggunaan");
});

// Stok: Tambah Item Baru button
document.getElementById("btn-add-stok-baru").addEventListener("click", () => {
    document.getElementById("form-stok").reset();
    document.getElementById("stok-id").value = "";
    document.getElementById("modal-stok-title").textContent = "Tambah Item Material Baru";
    openModal("modal-stok");
});

// Stok: Sesuaikan Stok button
document.getElementById("btn-update-stok-level").addEventListener("click", () => {
    document.getElementById("form-adjust-stok").reset();
    openModal("modal-adjust-stok");
});

// RAB: Tambah Rincian Item button
document.getElementById("btn-add-rab").addEventListener("click", () => {
    document.getElementById("form-rab").reset();
    document.getElementById("rab-id").value = "";
    document.getElementById("rab-tipe").value = "Jasa";
    document.getElementById("group-rab-material").classList.add("hidden");
    document.getElementById("modal-rab-title").textContent = "Tambah Rincian Item RAB";
    openModal("modal-rab");
});

// Export XLS Listeners
document.getElementById("btn-export-progres")?.addEventListener("click", () => {
    const headers = ["ID Kategori", "Kategori Pekerjaan", "Sub Pekerjaan", "Bobot RAB (%)", "Progres Aktual (%)", "Kendala", "Detail Catatan"];
    const rows = [];
    fases.forEach(f => {
        const subs = subPekerjaan.filter(s => s.faseId === f.id);
        if (subs.length === 0) {
            rows.push([f.id, f.nama, "-", "-", "-", "-", "-"]);
        } else {
            subs.forEach(s => {
                rows.push([f.id, f.nama, s.nama, s.bobot.toString(), s.progres.toString(), s.kendala || "-", s.catatanKendala || "-"]);
            });
        }
    });
    exportDataToXLS(headers, rows, `Laporan_Progres_${new Date().toISOString().split('T')[0]}`);
    showToast('success', 'Export Berhasil', 'Data Progres berhasil diunduh dalam format Excel (.xls).');
});

document.getElementById("btn-export-rab")?.addEventListener("click", () => {
    run3LevelEVMRollups();
    const headers = ["Level Pekerjaan", "Nama / Deskripsi", "Tipe Item", "Volume", "Satuan", "Harga Satuan", "Total Rencana", "Total Realisasi", "Deviasi"];
    const rows = [];
    
    fases.forEach(fase => {
        rows.push(["Kategori Pekerjaan", `[Fase] ${fase.nama}`, "", "", "", "", formatRupiah(fase.totalRencana || 0), formatRupiah(fase.totalRealisasi || 0), formatRupiah(fase.deviasi || 0)]);
        
        const fSubs = subPekerjaan.filter(s => s.faseId === fase.id);
        fSubs.forEach(sub => {
            rows.push(["Sub Pekerjaan", `  [Sub] ${sub.nama}`, "", "", "", "", formatRupiah(sub.totalRencana || 0), formatRupiah(sub.totalRealisasi || 0), formatRupiah(sub.deviasi || 0)]);
            
            const sItems = rab.filter(r => r.subPekerjaanId === sub.id);
            sItems.forEach(item => {
                const totalRen = (item.volume || 0) * (item.harga || 0);
                const dev = totalRen - (item.realisasi || 0);
                rows.push(["Item Rincian", `    - ${item.nama}`, item.tipe, item.volume.toString(), item.satuan, formatRupiah(item.harga || 0), formatRupiah(totalRen), formatRupiah(item.realisasi || 0), formatRupiah(dev)]);
            });
        });
    });

    exportDataToXLS(headers, rows, `Laporan_Lengkap_RAB_${new Date().toISOString().split('T')[0]}`);
    showToast('success', 'Export Berhasil', 'Data RAB (Lengkap) berhasil diunduh dalam format Excel (.xls).');
});

document.getElementById("btn-export-rab-pdf")?.addEventListener("click", () => {
    run3LevelEVMRollups();
    
    let htmlContent = `
    <html>
    <head>
        <title>Laporan Lengkap Progres & RAB</title>
        <style>
            body { font-family: 'Arial', sans-serif; padding: 20px; color: #333; }
            h1, h2 { text-align: center; margin: 5px 0; }
            .header-info { margin-bottom: 20px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
            th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
            .fase-row { font-weight: bold; background-color: #e2e8f0; }
            .sub-row { font-weight: bold; background-color: #f8fafc; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .signature { margin-top: 50px; float: right; text-align: center; width: 200px; }
        </style>
    </head>
    <body>
        <h1>PT. ARTA BUMI SAKTI</h1>
        <h2>Laporan Lengkap RAB & Progres Pekerjaan</h2>
        <div class="header-info">
            <p><strong>Nama Proyek:</strong> \${projectName}</p>
            <p><strong>Tanggal Cetak:</strong> \${getFormattedDate(new Date())}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Deskripsi Pekerjaan / Item</th>
                    <th width="50">Vol</th>
                    <th width="50">Sat</th>
                    <th width="100">Harga Satuan</th>
                    <th width="100">Total Rencana</th>
                    <th width="100">Total Realisasi</th>
                    <th width="60">Progres</th>
                </tr>
            </thead>
            <tbody>
    `;

    fases.forEach(fase => {
        htmlContent += `
            <tr class="fase-row">
                <td>[KATEGORI] ${fase.nama}</td>
                <td></td><td></td><td></td>
                <td class="text-right">${formatRupiah(fase.totalRencana || 0)}</td>
                <td class="text-right">${formatRupiah(fase.totalRealisasi || 0)}</td>
                <td class="text-center">${(fase.progres || 0).toFixed(1)}%</td>
            </tr>
        `;
        
        const fSubs = subPekerjaan.filter(s => s.faseId === fase.id);
        fSubs.forEach(sub => {
            htmlContent += `
                <tr class="sub-row">
                    <td style="padding-left: 20px;">[SUB] ${sub.nama}</td>
                    <td></td><td></td><td></td>
                    <td class="text-right">${formatRupiah(sub.totalRencana || 0)}</td>
                    <td class="text-right">${formatRupiah(sub.totalRealisasi || 0)}</td>
                    <td class="text-center">${(sub.progres || 0).toFixed(1)}%</td>
                </tr>
            `;
            
            const sItems = rab.filter(r => r.subPekerjaanId === sub.id);
            sItems.forEach(item => {
                const totalRen = (item.volume || 0) * (item.harga || 0);
                htmlContent += `
                    <tr>
                        <td style="padding-left: 40px;">- ${item.nama}</td>
                        <td class="text-center">${item.volume}</td>
                        <td class="text-center">${item.satuan}</td>
                        <td class="text-right">${formatRupiah(item.harga || 0)}</td>
                        <td class="text-right">${formatRupiah(totalRen)}</td>
                        <td class="text-right">${formatRupiah(item.realisasi || 0)}</td>
                        <td class="text-center">-</td>
                    </tr>
                `;
            });
        });
    });

    htmlContent += `
            </tbody>
        </table>
        <div class="signature">
            <p>Dibuat Oleh,</p>
            <br><br><br>
            <p><strong>Admin Project</strong></p>
        </div>
    </body>
    </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
});

document.getElementById("btn-export-penggunaan")?.addEventListener("click", () => {
    const headers = ["Tanggal", "Part Number", "Nama Material", "Jumlah Keluar", "Satuan", "Proyek/Kategori", "Sub Pekerjaan", "Penerima", "Keterangan"];
    const rows = [];
    penggunaan.forEach(p => {
        const mat = stok.find(s => s.id === p.materialId);
        const fase = fases.find(f => f.id === p.faseId);
        const sub = subPekerjaan.find(s => s.id === p.subPekerjaanId);
        
        rows.push([
            p.tanggal, 
            mat ? mat.kode : "-", 
            mat ? mat.nama : "-", 
            p.jumlah.toString(), 
            mat ? mat.satuan : "-", 
            fase ? fase.nama : "-", 
            sub ? sub.nama : "-", 
            p.penerima, 
            p.keterangan || "-"
        ]);
    });
    exportDataToXLS(headers, rows, `Laporan_Penggunaan_Material_${new Date().toISOString().split('T')[0]}`);
    showToast('success', 'Export Berhasil', 'Data Penggunaan berhasil diunduh dalam format Excel (.xls).');
});

document.getElementById("btn-export-masuk")?.addEventListener("click", () => {
    const headers = ["Tanggal Masuk", "No. MR", "No. PR", "Part Number", "Nama Material", "Jumlah Masuk", "Satuan", "Keperluan"];
    const rows = [];
    barangMasuk.forEach(m => {
        const mat = stok.find(s => s.id === m.materialId);
        rows.push([
            m.tanggal, 
            m.mr || "-", 
            m.pr || "-", 
            mat ? mat.kode : "-", 
            mat ? mat.nama : "-", 
            m.jumlah.toString(), 
            mat ? mat.satuan : "-", 
            m.keperluan || "-"
        ]);
    });
    exportDataToXLS(headers, rows, `Laporan_Barang_Masuk_${new Date().toISOString().split('T')[0]}`);
    showToast('success', 'Export Berhasil', 'Data Barang Masuk berhasil diunduh dalam format Excel (.xls).');
});

document.getElementById("btn-export-stok")?.addEventListener("click", () => {
    const headers = ["Part Number", "Nama Material", "Stok Tersedia", "Batas Minimum", "Satuan", "Lokasi Gudang", "Status"];
    const rows = [];
    stok.forEach(s => {
        let status = "Aman";
        if (s.stok === 0) status = "Habis";
        else if (s.stok <= s.min) status = "Menipis";
        
        rows.push([
            s.kode, 
            s.nama, 
            s.stok.toString(), 
            s.min.toString(), 
            s.satuan, 
            s.gudang, 
            status
        ]);
    });
    exportDataToXLS(headers, rows, `Laporan_Stok_Gudang_${new Date().toISOString().split('T')[0]}`);
    showToast('success', 'Export Berhasil', 'Data Stok berhasil diunduh dalam format Excel (.xls).');
});

// Barang Masuk: Tambah button
document.getElementById("btn-add-masuk").addEventListener("click", () => {
    document.getElementById("form-masuk").reset();
    document.getElementById("masuk-id").value = "";
    document.getElementById("modal-masuk-title").textContent = "Tambah Barang Masuk";
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("masuk-tanggal").value = today;
    
    // Populate material select
    const select = document.getElementById("masuk-material");
    select.innerHTML = '<option value="">-- Pilih Material / Part Number --</option>';
    stok.forEach(s => {
        select.innerHTML += `<option value="${s.id}">${s.kode} - ${s.nama} (${s.satuan})</option>`;
    });
    document.getElementById("masuk-satuan-info").textContent = "Satuan: -";
    document.getElementById("masuk-satuan-info").style.display = "none";
    document.getElementById("masuk-satuan").value = "";
    document.getElementById("masuk-satuan").readOnly = true;
    
    if(window.setMasukMode) window.setMasukMode("existing");
    openModal("modal-masuk");
});

window.setMasukMode = function(mode) {
    document.getElementById("masuk-mode").value = mode;
    
    const btnExisting = document.getElementById("btn-mode-existing");
    const btnOrder = document.getElementById("btn-mode-order");
    const btnNew = document.getElementById("btn-mode-new");
    const existingDiv = document.getElementById("masuk-mode-existing");
    const orderDiv = document.getElementById("masuk-mode-order");
    const newDiv = document.getElementById("masuk-mode-new");
    const satuanInput = document.getElementById("masuk-satuan");
    const satuanInfo = document.getElementById("masuk-satuan-info");

    const activeStyle = { background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" };
    const inactiveStyle = { background: "transparent", color: "var(--text-secondary)", border: "1px solid transparent", boxShadow: "none" };

    if (btnExisting && btnOrder && btnNew) {
        Object.assign(btnExisting.style, mode === "existing" ? activeStyle : inactiveStyle);
        Object.assign(btnOrder.style, mode === "order" ? activeStyle : inactiveStyle);
        Object.assign(btnNew.style, mode === "new" ? activeStyle : inactiveStyle);
    }

    if (existingDiv && orderDiv && newDiv) {
        existingDiv.style.display = mode === "existing" ? "block" : "none";
        orderDiv.style.display = mode === "order" ? "block" : "none";
        newDiv.style.display = mode === "new" ? "block" : "none";
    }

    document.getElementById("masuk-material").required = mode === "existing";
    const orderSelect = document.getElementById("masuk-order-select");
    if (orderSelect) orderSelect.required = mode === "order";
    document.getElementById("masuk-new-kode").required = mode === "new";
    document.getElementById("masuk-new-nama").required = mode === "new";

    if (mode === "existing") {
        satuanInput.readOnly = true;
        satuanInfo.style.display = "block";
        const evt = new Event("change");
        document.getElementById("masuk-material").dispatchEvent(evt);
    } else if (mode === "order") {
        satuanInput.readOnly = false;
        satuanInfo.style.display = "none";
        populateMasukOrderSelect();
    } else {
        satuanInput.readOnly = false;
        satuanInput.value = "";
        satuanInfo.style.display = "none";
    }
}

window.populateMasukOrderSelect = function() {
    const select = document.getElementById("masuk-order-select");
    if(!select) return;
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Pilih Order / PR / MR --</option>';
    
    // Only show orders that are not fully received
    const pendingOrders = ordersData.filter(o => {
        let qtyMasuk = 0;
        barangMasuk.forEach(m => {
            const mat = stok.find(s => s.id === m.materialId);
            const matchMR = o.mr && m.mr && o.mr.toLowerCase() === m.mr.toLowerCase();
            const matchPR = o.pr && m.pr && o.pr.toLowerCase() === m.pr.toLowerCase();
            const matchKode = mat && o.partnumber && mat.kode.toLowerCase() === o.partnumber.toLowerCase();
            const matchNama = mat && o.nama && mat.nama.toLowerCase() === o.nama.toLowerCase();
            if ((matchMR || matchPR) && (matchKode || matchNama)) {
                qtyMasuk += m.jumlah;
            }
        });
        return qtyMasuk < o.qty;
    });

    pendingOrders.forEach(o => {
        select.innerHTML += `<option value="${o.id}">${o.tanggal} | ${o.nama} (${o.qty} ${o.satuan}) - MR: ${o.mr||'-'}</option>`;
    });
    if(currentVal && pendingOrders.find(o => o.id === currentVal)) {
        select.value = currentVal;
    }
}

document.getElementById("masuk-order-select")?.addEventListener("change", (e) => {
    const orderId = e.target.value;
    if(!orderId) return;
    const order = ordersData.find(o => o.id === orderId);
    if(order) {
        // Find if this order material is already in stock by partnumber or name
        const existingStok = stok.find(s => 
            (order.partnumber && s.kode.toLowerCase() === order.partnumber.toLowerCase()) || 
            (order.nama && s.nama.toLowerCase() === order.nama.toLowerCase())
        );

        // Pre-fill fields shared by existing & new modes
        document.getElementById("masuk-jumlah").value = order.qty;
        document.getElementById("masuk-mr").value = order.mr || "";
        document.getElementById("masuk-pr").value = order.pr || "";
        document.getElementById("masuk-keperluan").value = order.keperluan || "";
        
        if (existingStok) {
            setMasukMode('existing');
            document.getElementById("masuk-material").value = existingStok.id;
            const evt = new Event("change");
            document.getElementById("masuk-material").dispatchEvent(evt);
            showToast('info', 'Material Ditemukan', 'Data otomatis disesuaikan dengan stok gudang yang sudah ada.');
        } else {
            setMasukMode('new');
            document.getElementById("masuk-new-kode").value = order.partnumber || "";
            document.getElementById("masuk-new-nama").value = order.nama || "";
            document.getElementById("masuk-satuan").value = order.satuan || "";
            showToast('info', 'Material Baru', 'Material ini belum ada di gudang, akan dicatat sebagai stok baru.');
        }
    }
});

window.openMasukFromOrder = function(orderId) {
    document.getElementById("btn-add-masuk").click(); // Open modal and reset
    setTimeout(() => {
        setMasukMode('order');
        const select = document.getElementById("masuk-order-select");
        if (select) {
            select.value = orderId;
            const evt = new Event("change");
            select.dispatchEvent(evt);
        }
    }, 100);
}

document.getElementById("masuk-material").addEventListener("change", (e) => {
    const mat = stok.find(s => s.id === e.target.value);
    const info = document.getElementById("masuk-satuan-info");
    const satuanInput = document.getElementById("masuk-satuan");
    
    if (mat) {
        info.textContent = `Stok Saat Ini: ${mat.stok}`;
        satuanInput.value = mat.satuan;
    } else {
        info.textContent = "Stok Saat Ini: -";
        satuanInput.value = "";
    }
});

document.getElementById("masuk-new-kode").addEventListener("input", (e) => {
    const newKode = e.target.value.trim();
    if (!newKode) return;
    const existingStok = stok.find(s => s.kode.toLowerCase() === newKode.toLowerCase());
    if (existingStok) {
        showToast('info', 'Part Number Ditemukan', `Part Number ${newKode} sudah terdaftar. Dialihkan ke mode Stok Gudang.`);
        setMasukMode('existing');
        document.getElementById("masuk-material").value = existingStok.id;
        document.getElementById("masuk-material").dispatchEvent(new Event("change"));
        e.target.value = "";
    }
});

window.openEditMasuk = function(id) {
    const masuk = barangMasuk.find(m => m.id === id);
    if (!masuk) return;
    
    document.getElementById("form-masuk").reset();
    document.getElementById("masuk-id").value = masuk.id;
    
    setMasukMode('existing');
    
    document.getElementById("masuk-material").value = masuk.materialId;
    document.getElementById("masuk-jumlah").value = masuk.jumlah;
    document.getElementById("masuk-tanggal").value = masuk.tanggal;
    
    const mat = stok.find(s => s.id === masuk.materialId);
    document.getElementById("masuk-satuan").value = mat ? mat.satuan : "";
    document.getElementById("masuk-mr").value = masuk.mr || "";
    document.getElementById("masuk-pr").value = masuk.pr || "";
    document.getElementById("masuk-fase").value = masuk.faseId || "";
    document.getElementById("masuk-keperluan").value = masuk.keperluan || "";
    
    document.getElementById("modal-masuk-title").textContent = "Edit Penerimaan Barang";
    openModal("modal-masuk");
};

document.getElementById("form-masuk").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("masuk-id").value;
    const tanggal = document.getElementById("masuk-tanggal").value;
    const mode = document.getElementById("masuk-mode").value;
    
    let materialId = "";
    let material = null;
    let materialNameMsg = "";
    const satuan = document.getElementById("masuk-satuan").value || "-";

    if (mode === "existing") {
        materialId = document.getElementById("masuk-material").value;
        material = stok.find(s => s.id === materialId);
        if (!material) return;
        materialNameMsg = material.nama;
    } else {
        // Create new Material
        const newKode = document.getElementById("masuk-new-kode").value;
        const newNama = document.getElementById("masuk-new-nama").value;
        const newGudang = document.getElementById("masuk-new-gudang").value;
        const newMin = parseFloat(document.getElementById("masuk-new-min").value) || 0;

        // Check if Part Number already exists
        const existingStok = stok.find(s => s.kode.toLowerCase() === newKode.toLowerCase());
        if (existingStok) {
            showToast('warning', 'Part Number Sudah Ada', `Part Number ${newKode} sudah terdaftar sebagai ${existingStok.nama}. Dialihkan ke Stok Gudang (Ada).`);
            setMasukMode('existing');
            document.getElementById("masuk-material").value = existingStok.id;
            
            // Trigger change event to update UI
            const evt = new Event("change");
            document.getElementById("masuk-material").dispatchEvent(evt);
            return;
        }
        
        materialId = "m-" + Date.now() + Math.floor(Math.random()*1000);
        
        material = {
            id: materialId,
            kode: newKode,
            nama: newNama,
            stok: 0, // will be incremented below
            satuan: satuan,
            min: newMin,
            gudang: newGudang
        };
        stok.push(material);
        materialNameMsg = newNama;
    }

    const mr = document.getElementById("masuk-mr").value;
    const pr = document.getElementById("masuk-pr").value;
    const jumlah = parseFloat(document.getElementById("masuk-jumlah").value) || 0;
    const keperluan = document.getElementById("masuk-keperluan").value;
    const faseId = document.getElementById("masuk-fase")?.value || "";

    if (id) {
        // Edit flow
        const existing = barangMasuk.find(m => m.id === id);
        if (existing) {
            if (existing.materialId === materialId) {
                material.stok -= existing.jumlah;
                material.stok += jumlah;
            } else {
                const oldMaterial = stok.find(s => s.id === existing.materialId);
                if (oldMaterial) oldMaterial.stok -= existing.jumlah;
                material.stok += jumlah;
            }
            
            existing.tanggal = tanggal;
            existing.materialId = materialId;
            existing.faseId = faseId;
            existing.mr = mr;
            existing.pr = pr;
            existing.jumlah = jumlah;
            existing.keperluan = keperluan;
        }
    } else {
        const newId = "m-" + (barangMasuk.length + 1) + Math.floor(Math.random()*1000);
        barangMasuk.push({ id: newId, tanggal, materialId, faseId, mr, pr, jumlah, keperluan });
        material.stok += jumlah;
    }

    saveState();
    closeModal("modal-masuk");
    showToast('success', 'Barang Masuk Disimpan', `${jumlah} ${satuan} ${materialNameMsg} berhasil masuk ke gudang.`);
    calculateKPIs();
    renderAllTables();
    renderCharts();
});

window.deleteMasuk = function(id) {
    const mLog = barangMasuk.find(m => m.id === id);
    if (!mLog) return;
    const mat = stok.find(s => s.id === mLog.materialId);
    const matName = mat ? mat.nama : 'Material';

    showConfirm('Hapus Penerimaan Barang?', `Menghapus log ini akan MEMOTONG ${mLog.jumlah} ${mat ? mat.satuan : ''} ${matName} dari stok gudang.`, () => {
        if (mat) mat.stok -= mLog.jumlah;
        barangMasuk = barangMasuk.filter(m => m.id !== id);
        saveState();
        showToast('success', 'Log Dihapus', `Penerimaan ${matName} dibatalkan dan stok telah disesuaikan.`);
        calculateKPIs();
        renderAllTables();
        renderCharts();
    }, true);
};

document.getElementById("search-masuk")?.addEventListener("input", renderAllTables);
document.getElementById("clear-search-masuk")?.addEventListener("click", () => {
    const input = document.getElementById("search-masuk");
    if(input) { input.value = ""; renderAllTables(); }
});

// ==========================================
// 6. HELPER: ANALYZE DATE SCHEDULE
// ==========================================
function analyzeDateSchedule(jadwalMulai, jadwalSelesai, aktualMulai, aktualSelesai, progress) {
    if (!jadwalMulai || !jadwalSelesai) return { status: '-', selisih: 0, notice: '' };
    
    const jMulai = new Date(jadwalMulai);
    const jSelesai = new Date(jadwalSelesai);
    const targetHari = Math.ceil((jSelesai - jMulai) / (1000 * 60 * 60 * 24)) + 1;
    
    let aMulai = aktualMulai ? new Date(aktualMulai) : null;
    let aSelesai = aktualSelesai ? new Date(aktualSelesai) : null;
    
    // Jika belum mulai, tapi sudah terlewat jadwal mulainya
    if (!aMulai && new Date() > jMulai) {
        return { status: '<span class="badge badge-orange">Belum Mulai (Terlambat)</span>', selisih: 0, notice: 'Harusnya sudah mulai' };
    }
    if (!aMulai) return { status: '<span class="badge badge-lain">Belum Mulai</span>', selisih: 0, notice: '' };
    
    // Jika belum selesai, gunakan hari ini sebagai cut-off untuk durasi
    const endDate = aSelesai ? aSelesai : new Date();
    let aktualHari = Math.ceil((endDate - aMulai) / (1000 * 60 * 60 * 24)) + 1;
    if (aktualHari <= 0) aktualHari = 1;
    
    const selisihHari = targetHari - aktualHari; // positif = lebih cepat, negatif = terlambat

    let notice = '';
    if (aMulai > jMulai) notice = 'Notice: Tidak Sesuai Tanggal Mulai';
    
    let status = '';
    if (progress >= 100 && selisihHari >= 0) {
        status = '<span class="badge badge-green">Selesai (Sesuai)</span>';
    } else if (progress >= 100 && selisihHari < 0) {
        status = '<span class="badge badge-red">Selesai (Terlambat)</span>';
    } else {
        if (selisihHari < 0) {
            status = '<span class="badge badge-red">Terlambat</span>';
        } else {
            status = '<span class="badge badge-blue">Sesuai (On-track)</span>';
        }
    }
    
    return { status, selisih: selisihHari, notice, targetHari, aktualHari };
}

// ==========================================
// 19. GLOBAL DETAIL MODAL FOR MATERIAL TABLES
// ==========================================
window.showDetailModal = function(type, id) {
    const titleEl = document.getElementById("modal-detail-title");
    const mainNameEl = document.getElementById("detail-main-name");
    const subNameEl = document.getElementById("detail-sub-name");
    const gridEl = document.getElementById("detail-info-grid");
    const ketBox = document.getElementById("detail-keterangan-box");
    const ketText = document.getElementById("detail-keterangan-text");
    const iconBox = document.getElementById("detail-icon-box");

    let dataObj = null;
    let matObj = null;
    let gridHTML = "";

    const generateGridItem = (label, value) => `
        <div class="detail-item">
            <div class="detail-item-label">${label}</div>
            <div class="detail-item-value">${value}</div>
        </div>
    `;

    if (type === 'stok') {
        dataObj = stok.find(s => s.id === id);
        if (!dataObj) return;
        
        titleEl.textContent = "Detail Stok Material";
        mainNameEl.textContent = dataObj.nama;
        subNameEl.textContent = "PN: " + dataObj.kode;
        iconBox.innerHTML = '<i data-lucide="boxes"></i>';
        
        gridHTML += generateGridItem("Gudang Penyimpanan", dataObj.gudang || "-");
        gridHTML += generateGridItem("Stok Saat Ini", `${dataObj.stok} ${dataObj.satuan}`);
        gridHTML += generateGridItem("Batas Minimum", `${dataObj.min} ${dataObj.satuan}`);
        
        let status = "Aman";
        let color = "var(--accent-green)";
        if (dataObj.stok === 0) { status = "Habis"; color = "var(--accent-red)"; }
        else if (dataObj.stok <= dataObj.min) { status = "Menipis"; color = "var(--accent-orange)"; }
        gridHTML += generateGridItem("Status Keamanan", `<strong style="color:${color}">${status}</strong>`);
        
        ketBox.style.display = "none";
        
    } else if (type === 'penggunaan') {
        dataObj = penggunaan.find(p => p.id === id);
        if (!dataObj) return;
        matObj = stok.find(s => s.id === dataObj.materialId);
        
        const fase = fases.find(f => f.id === dataObj.faseId);
        
        titleEl.textContent = "Detail Penggunaan Material";
        mainNameEl.textContent = matObj ? matObj.nama : "Unknown Material";
        subNameEl.textContent = "ID Transaksi: " + dataObj.id;
        iconBox.innerHTML = '<i data-lucide="package-minus"></i>';
        
        gridHTML += generateGridItem("Tanggal", dataObj.tanggal);
        gridHTML += generateGridItem("Jumlah Dipakai", `<strong>${dataObj.jumlah}</strong> ${matObj ? matObj.satuan : ""}`);
        gridHTML += generateGridItem("Kategori Pekerjaan", fase ? fase.nama : "Umum");
        gridHTML += generateGridItem("Penerima", dataObj.penerima);
        
        if (dataObj.keterangan && dataObj.keterangan.trim() !== "") {
            ketBox.style.display = "block";
            ketText.textContent = dataObj.keterangan;
        } else {
            ketBox.style.display = "none";
        }
        
    } else if (type === 'masuk') {
        dataObj = barangMasuk.find(m => m.id === id);
        if (!dataObj) return;
        matObj = stok.find(s => s.id === dataObj.materialId);
        
        titleEl.textContent = "Detail Barang Masuk";
        mainNameEl.textContent = matObj ? matObj.nama : "Unknown Material";
        subNameEl.textContent = "ID Transaksi: " + dataObj.id;
        iconBox.innerHTML = '<i data-lucide="package-plus"></i>';
        
        gridHTML += generateGridItem("Tanggal Masuk", dataObj.tanggal);
        gridHTML += generateGridItem("Jumlah Masuk", `<strong style="color:var(--accent-green)">+${dataObj.jumlah}</strong> ${matObj ? matObj.satuan : ""}`);
        gridHTML += generateGridItem("No. MR", dataObj.mr || "-");
        gridHTML += generateGridItem("No. PR", dataObj.pr || "-");
        
        if (dataObj.keperluan && dataObj.keperluan.trim() !== "") {
            ketBox.style.display = "block";
            ketText.textContent = dataObj.keperluan;
        } else {
            ketBox.style.display = "none";
        }
    } else if (type === 'order') {
        dataObj = ordersData.find(o => o.id === id);
        if (!dataObj) return;
        
        let qtyMasuk = 0;
        barangMasuk.forEach(m => {
            const mat = stok.find(s => s.id === m.materialId);
            const matKode = mat ? mat.kode : "";
            const matNama = mat ? mat.nama : "";
            const matchMR = dataObj.mr && m.mr && dataObj.mr.toLowerCase() === m.mr.toLowerCase();
            const matchPR = dataObj.pr && m.pr && dataObj.pr.toLowerCase() === m.pr.toLowerCase();
            const matchKode = dataObj.partnumber && matKode && dataObj.partnumber.toLowerCase() === matKode.toLowerCase();
            const matchNama = dataObj.nama && matNama && dataObj.nama.toLowerCase() === matNama.toLowerCase();
            if ((matchMR || matchPR) && (matchKode || matchNama)) qtyMasuk += m.jumlah;
        });

        titleEl.textContent = "Detail Order Barang";
        mainNameEl.textContent = dataObj.nama;
        subNameEl.textContent = "Part Number: " + (dataObj.partnumber || "-");
        iconBox.innerHTML = '<i data-lucide="shopping-cart"></i>';
        
        gridHTML += generateGridItem("Tanggal Order", dataObj.tanggal);
        gridHTML += generateGridItem("No. MR", dataObj.mr || "-");
        gridHTML += generateGridItem("No. PR", dataObj.pr || "-");
        gridHTML += generateGridItem("Jumlah Order", `<strong>${dataObj.qty}</strong> ${dataObj.satuan}`);
        gridHTML += generateGridItem("Telah Tersupply", `<strong style="color:var(--accent-green)">${qtyMasuk}</strong> ${dataObj.satuan}`);
        
        let statusText = "Pending";
        let color = "var(--accent-red)";
        if (qtyMasuk >= dataObj.qty) { statusText = "Completed"; color = "var(--accent-green)"; }
        else if (qtyMasuk > 0) { statusText = `Partial`; color = "var(--accent-orange)"; }
        gridHTML += generateGridItem("Status", `<strong style="color:${color}">${statusText}</strong>`);

        if (dataObj.keperluan && dataObj.keperluan.trim() !== "") {
            gridHTML += generateGridItem("Keperluan", dataObj.keperluan);
        }
        
        if (dataObj.remark && dataObj.remark.trim() !== "") {
            ketBox.style.display = "block";
            ketText.textContent = dataObj.remark;
        } else {
            ketBox.style.display = "none";
        }
    }

    gridEl.innerHTML = gridHTML;
    lucide.createIcons();
    openModal('modal-detail-card');
};

// ==========================================
// 20. KPI CARD INFO MODAL LOGIC
// ==========================================
window.showCardInfo = function(cardId) {
    const titleEl = document.getElementById("modal-card-info-title");
    const descEl = document.getElementById("modal-card-info-desc");
    
    let title = "Informasi Card";
    let desc = "";

    switch(cardId) {
        case "card-total-kategori":
            title = "Kategori Pekerjaan";
            desc = "Menunjukkan jumlah total Fase Konstruksi atau Kategori Pekerjaan utama yang sedang atau akan dikerjakan pada proyek ini.";
            break;
        case "card-total-item":
            title = "Rincian Item Pekerjaan";
            desc = "Menunjukkan total rincian pekerjaan (sub-task & item material/jasa) yang telah dijabarkan di seluruh proyek.";
            break;
        case "card-progres-akumulatif":
            title = "Progres Proyek Akumulatif";
            desc = "Merupakan persentase rata-rata penyelesaian seluruh fase pekerjaan di proyek. Angka ini dihitung berdasarkan bobot item.";
            break;
        case "card-material-warning":
            title = "Peringatan Material";
            desc = "Menunjukkan jumlah item material yang jumlah stoknya berada di bawah batas minimum (safety stock). Segera lakukan re-order untuk item tersebut.";
            break;
        case "card-klasifikasi-baru":
            title = "Project Baru";
            desc = "Total jumlah kategori pekerjaan yang berstatus sebagai instalasi atau proyek konstruksi baru.";
            break;
        case "card-klasifikasi-maintenance":
            title = "Maintenance";
            desc = "Total jumlah kategori pekerjaan yang merupakan perawatan (maintenance) dari fasilitas yang sudah ada.";
            break;
        case "card-klasifikasi-lain":
            title = "Pekerjaan Lain-lain";
            desc = "Total jumlah kategori pekerjaan yang tidak termasuk ke dalam Project Baru maupun Maintenance.";
            break;
        case "card-status-selesai":
            title = "Status: Selesai";
            desc = "Jumlah kategori pekerjaan yang persentase penyelesaian fisiknya sudah mencapai 100%.";
            break;
        case "card-status-proses":
            title = "Status: Proses";
            desc = "Jumlah kategori pekerjaan yang saat ini sedang dikerjakan (progres di atas 0% dan di bawah 100%).";
            break;
        case "card-status-belum":
            title = "Status: Belum Selesai";
            desc = "Jumlah kategori pekerjaan yang belum dimulai sama sekali (progres 0%).";
            break;
    }

    titleEl.textContent = title;
    descEl.textContent = desc;
    openModal("modal-card-info");
};

// ==========================================
// 21. ORDER BARANG LOGIC
// ==========================================
document.getElementById("btn-add-order")?.addEventListener("click", () => {
    document.getElementById("form-order").reset();
    document.getElementById("order-id").value = "";
    document.getElementById("modal-order-title").textContent = "Tambah Order Barang";
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("order-tanggal").value = today;
    openModal("modal-order");
});

window.openEditOrder = function(id) {
    const item = ordersData.find(o => o.id === id);
    if (!item) return;

    document.getElementById("order-id").value = item.id;
    document.getElementById("order-tanggal").value = item.tanggal;
    document.getElementById("order-partnumber").value = item.partnumber || "";
    document.getElementById("order-nama").value = item.nama;
    document.getElementById("order-mr").value = item.mr || "";
    document.getElementById("order-pr").value = item.pr || "";
    document.getElementById("order-qty").value = item.qty;
    document.getElementById("order-satuan").value = item.satuan;
    document.getElementById("order-keperluan").value = item.keperluan || "";
    document.getElementById("order-remark").value = item.remark || "";

    document.getElementById("modal-order-title").textContent = "Edit Order Barang";
    openModal("modal-order");
};

document.getElementById("form-order")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("order-id").value;
    const orderObj = {
        id: id || "o-" + Date.now() + Math.floor(Math.random()*1000),
        tanggal: document.getElementById("order-tanggal").value,
        partnumber: document.getElementById("order-partnumber").value,
        nama: document.getElementById("order-nama").value,
        mr: document.getElementById("order-mr").value,
        pr: document.getElementById("order-pr").value,
        qty: parseFloat(document.getElementById("order-qty").value) || 0,
        satuan: document.getElementById("order-satuan").value,
        keperluan: document.getElementById("order-keperluan").value,
        remark: document.getElementById("order-remark").value
    };

    if (id) {
        const index = ordersData.findIndex(o => o.id === id);
        if (index !== -1) ordersData[index] = orderObj;
    } else {
        ordersData.push(orderObj);
    }

    saveState();
    closeModal("modal-order");
    showToast('success', 'Order Disimpan', `Order barang ${orderObj.nama} berhasil ${id ? 'diperbarui' : 'ditambahkan'}.`);
    renderAllTables();
});

window.deleteOrder = function(id) {
    const item = ordersData.find(o => o.id === id);
    if (!item) return;
    showConfirm('Hapus Order Barang?', `Apakah Anda yakin ingin menghapus order "${item.nama}"?`, () => {
        ordersData = ordersData.filter(o => o.id !== id);
        saveState();
        showToast('success', 'Order Dihapus', `Order "${item.nama}" berhasil dihapus.`);
        renderAllTables();
    }, true);
};

document.getElementById("btn-export-order")?.addEventListener("click", () => {
    const headers = ["Tanggal", "No. MR", "No. PR", "Part Number", "Nama Material", "Qty", "Satuan", "Status", "Keperluan", "Remark"];
    const rows = [];
    ordersData.forEach(o => {
        let qtyMasuk = 0;
        barangMasuk.forEach(m => {
            const mat = stok.find(s => s.id === m.materialId);
            const matKode = mat ? mat.kode : "";
            const matNama = mat ? mat.nama : "";

            const matchMR = o.mr && m.mr && o.mr.toLowerCase() === m.mr.toLowerCase();
            const matchPR = o.pr && m.pr && o.pr.toLowerCase() === m.pr.toLowerCase();
            const matchKode = o.partnumber && matKode && o.partnumber.toLowerCase() === matKode.toLowerCase();
            const matchNama = o.nama && matNama && o.nama.toLowerCase() === matNama.toLowerCase();

            if ((matchMR || matchPR) && (matchKode || matchNama)) {
                qtyMasuk += m.jumlah;
            }
        });

        let statusText = "Pending";
        if (qtyMasuk >= o.qty) statusText = "Completed";
        else if (qtyMasuk > 0) statusText = `Partial (${qtyMasuk}/${o.qty})`;

        rows.push([
            o.tanggal,
            o.mr || "-",
            o.pr || "-",
            o.partnumber || "-",
            o.nama,
            o.qty.toString(),
            o.satuan,
            statusText,
            o.keperluan || "-",
            o.remark || "-"
        ]);
    });
    exportDataToXLS(headers, rows, `Laporan_Order_Barang_${new Date().toISOString().split('T')[0]}`);
    showToast('success', 'Export Berhasil', 'Data Order Barang berhasil diunduh dalam format Excel (.xls).');
});

document.getElementById("search-order")?.addEventListener("input", renderAllTables);
document.getElementById("clear-search-order")?.addEventListener("click", () => {
    const input = document.getElementById("search-order");
    if(input) { input.value = ""; renderAllTables(); }
});

// 20. INITIALIZATION TRIGGER
let isInitialLoad = true;

function applyFallbackData() {
    fases = fases || INITIAL_FASES;
    subPekerjaan = subPekerjaan || INITIAL_SUB_PEKERJAAN;
    rab = rab || INITIAL_RAB;
    stok = stok || INITIAL_STOK;
    penggunaan = penggunaan || INITIAL_PENGGUNAAN;
    barangMasuk = barangMasuk || INITIAL_MASUK;
    ordersData = ordersData || INITIAL_ORDERS;
    projectName = projectName || DEFAULT_PROJECT_NAME;
}

// Listen to real-time updates from Firebase immediately
function startFirebaseSync() {
    try {
        db.collection('projects').doc('main-project').onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                projectName = data.projectName || DEFAULT_PROJECT_NAME;
                fases = data.fases || [];
                subPekerjaan = data.subPekerjaan || [];
                rab = data.rab || [];
                stok = data.stok || [];
                penggunaan = data.penggunaan || [];
                barangMasuk = data.barangMasuk || [];
                ordersData = data.ordersData || [];
                currentAppPassword = data.appPassword || "admin123";
                
                hasSyncedWithCloud = true;

                // Sync data to local storage as fallback
                localStorage.setItem("arta_project_name", projectName);
                localStorage.setItem("arta_fases", JSON.stringify(fases));
                localStorage.setItem("arta_sub_pekerjaan", JSON.stringify(subPekerjaan));
                localStorage.setItem("arta_rab", JSON.stringify(rab));
                localStorage.setItem("arta_stok", JSON.stringify(stok));
                localStorage.setItem("arta_penggunaan", JSON.stringify(penggunaan));
                localStorage.setItem("arta_masuk", JSON.stringify(barangMasuk));
                localStorage.setItem("arta_orders", JSON.stringify(ordersData));
                localStorage.setItem("arta_app_password", currentAppPassword);

                console.log("Data berhasil dimuat dari Firebase Cloud!");
                
                runLegacyMigration();

                // Jika data berubah dari perangkat lain dan bukan load awal, re-render UI
                if(!isInitialLoad && !window._waitingForDataToInit) {
                    calculateKPIs();
                    renderAllTables();
                    renderCharts();
                }
            } else {
                console.log("Dokumen Firebase kosong. Memuat default data...");
                hasSyncedWithCloud = true; // Sinkronisasi selesai (kosong)
                applyFallbackData();
                runLegacyMigration();
                if(!isInitialLoad) saveState();
            }
            
            if(window._waitingForDataToInit) {
                window._waitingForDataToInit = false;
                completeAppInit();
            }
        }, (error) => {
            console.error("Gagal memuat data dari Firebase: ", error);
            applyFallbackData();
            runLegacyMigration();
            if(window._waitingForDataToInit) {
                window._waitingForDataToInit = false;
                completeAppInit();
            }
        });
    } catch (e) {
        console.error("Firebase init failed, using LocalStorage fallback", e);
        applyFallbackData();
        runLegacyMigration();
        if(window._waitingForDataToInit) {
            window._waitingForDataToInit = false;
            completeAppInit();
        }
    }
}

// Mulai sinkronisasi Firebase secepatnya
startFirebaseSync();

function completeAppInit() {
    if(isInitialLoad) {
        isInitialLoad = false;
        setupProjectTitleEditor();
        calculateKPIs();
        renderAllTables();
        renderCharts();
    }
}

function initApp() {
    if (fases && subPekerjaan && hasSyncedWithCloud) {
        completeAppInit();
    } else {
        window._waitingForDataToInit = true;
        // Timeout pengaman 5 detik
        setTimeout(() => {
            if(window._waitingForDataToInit) {
                console.warn("Timeout menunggu Firebase, menggunakan data lokal / default");
                window._waitingForDataToInit = false;
                applyFallbackData();
                runLegacyMigration();
                completeAppInit();
            }
        }, 5000);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupLoginAuthentication();
    lucide.createIcons();

    // Change Password Logic
    const btnChangePassword = document.getElementById("btn-change-password");
    if (btnChangePassword) {
        btnChangePassword.addEventListener("click", () => {
            document.getElementById("form-change-password").reset();
            document.getElementById("modal-change-password").classList.add("active");
        });
    }
    const formChangePassword = document.getElementById("form-change-password");
    if (formChangePassword) {
        formChangePassword.addEventListener("submit", (e) => {
            e.preventDefault();
            const oldPass = document.getElementById("old-password").value;
            const newPass = document.getElementById("new-password").value;
            const confirmPass = document.getElementById("confirm-password").value;

            if (oldPass !== currentAppPassword) {
                showToast('error', 'Gagal', 'Kata sandi saat ini salah!');
                return;
            }
            if (newPass !== confirmPass) {
                showToast('error', 'Gagal', 'Konfirmasi kata sandi tidak cocok!');
                return;
            }
            if (newPass.length < 5) {
                showToast('error', 'Gagal', 'Kata sandi baru minimal 5 karakter!');
                return;
            }

            currentAppPassword = newPass;
            localStorage.setItem("arta_app_password", currentAppPassword);
            if(hasSyncedWithCloud) {
                saveState();
            }
            closeModal('modal-change-password');
            showToast('success', 'Berhasil', 'Kata sandi berhasil diubah.');
        });
    }

    // Network Status Logic
    function updateNetworkStatus() {
        const dot = document.getElementById("network-dot");
        const txt = document.getElementById("network-text");
        const card = document.getElementById("network-status-card");
        if(!dot || !txt || !card) return;

        if (navigator.onLine) {
            dot.style.background = "var(--accent-green)";
            dot.style.boxShadow = "0 0 10px var(--accent-green)";
            txt.textContent = "Online - Tersinkron";
            txt.style.color = "var(--text-secondary)";
            card.style.borderColor = "rgba(255,255,255,0.1)";
        } else {
            dot.style.background = "var(--accent-red)";
            dot.style.boxShadow = "0 0 10px var(--accent-red)";
            txt.textContent = "Offline - Belum Sinkron";
            txt.style.color = "var(--accent-red)";
            card.style.borderColor = "rgba(239, 68, 68, 0.3)";
        }
    }
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus(); // initial check

    // Setup Progress Filter Event Listeners
    const searchProgres = document.getElementById("search-progres");
    const clearSearchProgres = document.getElementById("clear-search-progres");
    const filterStatusProgres = document.getElementById("filter-status-progres");

    if (searchProgres) {
        searchProgres.addEventListener('input', renderAllTables);
    }
    if (clearSearchProgres) {
        clearSearchProgres.addEventListener('click', () => {
            if(searchProgres) searchProgres.value = "";
            renderAllTables();
        });
    }
    if (filterStatusProgres) {
        filterStatusProgres.addEventListener('change', renderAllTables);
    }

    // Setup Status KPI Click Listeners
    const setupStatusClick = (cardId, statusTitle, statusFilterCondition) => {
        const card = document.getElementById(cardId);
        if (card) {
            card.addEventListener('click', () => {
                const modal = document.getElementById("modal-status-detail");
                const modalTitle = document.getElementById("modal-status-detail-title");
                const tbody = document.getElementById("table-status-detail-body");
                
                modalTitle.textContent = "Detail Proyek: " + statusTitle;
                tbody.innerHTML = "";
                
                const filtered = fases.filter(statusFilterCondition);
                
                if (filtered.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: var(--text-muted);">Tidak ada data pekerjaan untuk status ini.</td></tr>`;
                } else {
                    filtered.forEach(f => {
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td><a href="#" onclick="closeModal('modal-status-detail'); navigateToFaseDetails('${f.id}'); return false;" class="project-link" style="color: var(--accent-blue); text-decoration: none; font-weight: 600;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'"><i data-lucide="link" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-right:4px;"></i>${f.nama}</a></td>
                            <td><span class="badge" style="background:var(--bg-glass); color:var(--text-light); border:1px solid rgba(255,255,255,0.1);">${f.klasifikasi || '-'}</span></td>
                            <td style="font-weight: bold; color: ${(f.progres || 0) >= 100 ? 'var(--accent-green)' : ((f.progres || 0) > 0 ? 'var(--accent-blue)' : 'var(--text-muted)')};">${(f.progres || 0).toFixed(1)}%</td>
                            <td>${f.selesai || '-'}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
                
                modal.classList.add("active");
            });
        }
    };

    setupStatusClick("card-status-selesai", "Selesai (100%)", f => f.progres >= 100);
    setupStatusClick("card-status-proses", "Sedang Proses (1% - 99%)", f => f.progres > 0 && f.progres < 100);
    setupStatusClick("card-status-belum", "Belum Selesai (0%)", f => f.progres === 0 || !f.progres);

    setupStatusClick("card-klasifikasi-baru", "Klasifikasi: Project Baru", f => f.klasifikasi === "Project Baru");
    setupStatusClick("card-klasifikasi-maintenance", "Klasifikasi: Maintenance", f => f.klasifikasi === "Maintenance");
    setupStatusClick("card-klasifikasi-lain", "Klasifikasi: Pekerjaan Lain-lain", f => f.klasifikasi === "Pekerjaan Lain-lain" || f.klasifikasi === "Lain-lain");

    // Setup Material Warning Click Listener
    const cardMaterialWarning = document.getElementById("card-material-warning");
    if(cardMaterialWarning) {
        cardMaterialWarning.addEventListener("click", () => {
            const modal = document.getElementById("modal-material-warning");
            const tbody = document.getElementById("table-material-warning-body");
            tbody.innerHTML = "";
            const criticalItems = stok.filter(item => item.stok <= item.min);
            if(criticalItems.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--text-muted);">Semua stok material aman.</td></tr>`;
            } else {
                criticalItems.forEach(item => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td><strong>${item.nama}</strong></td>
                        <td>${item.kategori || '-'}</td>
                        <td>${item.satuan}</td>
                        <td><strong class="text-red">${item.stok}</strong></td>
                        <td>${item.min}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
            modal.classList.add("active");
        });
    }

    // Setup Dashboard Global Filter Event
    const dashboardYearFilter = document.getElementById("dashboard-year-filter");
    if(dashboardYearFilter) {
        dashboardYearFilter.addEventListener("change", () => {
            calculateKPIs();
            renderAllTables();
            renderCharts();
        });
    }
});

