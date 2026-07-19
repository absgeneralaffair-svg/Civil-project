"use client";
import React, { useState, useEffect, useCallback } from "react";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { subscribeCollection, migrateArrayToCollection } from "@/lib/db";
import { Toaster, toast } from "react-hot-toast";

import LoginScreen from "@/components/LoginScreen";
import SplashScreen from "@/components/SplashScreen";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import DashboardTab from "@/components/tabs/DashboardTab";
import ProgresTab from "@/components/tabs/ProgresTab";
import ListPekerjaanTab from "@/components/tabs/ListPekerjaanTab";
import OrderTab from "@/components/tabs/OrderTab";
import PenggunaanTab from "@/components/tabs/PenggunaanTab";
import BarangMasukTab from "@/components/tabs/BarangMasukTab";
import StokTab from "@/components/tabs/StokTab";
import { ChangePasswordModal, AddAccountModal } from "@/components/AccountManager";

// === INITIAL DATA (sama persis dengan Vercel app) ===
const INITIAL_FASES = [
  { id: "f-1", nama: "Pekerjaan Persiapan & Mobilisasi", klasifikasi: "Project Baru", mulai: "2026-05-01", selesai: "2026-05-10" },
  { id: "f-2", nama: "Pekerjaan Galian & Pondasi Bored Pile", klasifikasi: "Project Baru", mulai: "2026-05-11", selesai: "2026-05-31" },
  { id: "f-3", nama: "Pekerjaan Struktur Beton Balok & Plat Lt.1", klasifikasi: "Project Baru", mulai: "2026-06-01", selesai: "2026-07-15" },
  { id: "f-4", nama: "Pekerjaan MEP (Mekanis, Elektrikal, Plambing)", klasifikasi: "Project Baru", mulai: "2026-06-15", selesai: "2026-08-15" },
  { id: "f-5", nama: "Pekerjaan Finishing & Arsitektur Lt.1", klasifikasi: "Maintenance", mulai: "2026-07-01", selesai: "2026-09-30" }
];

const INITIAL_SUB_PEKERJAAN = [
  { id: "sp-1", faseId: "f-1", nama: "Pekerjaan Mobilisasi & Demobilisasi", progres: 100, target: 100 },
  { id: "sp-2", faseId: "f-1", nama: "Pembuatan Sarana Lapangan & Direksi Keet", progres: 100, target: 100 },
  { id: "sp-3", faseId: "f-2", nama: "Pekerjaan Galian Tanah Pondasi", progres: 100, target: 100 },
  { id: "sp-4", faseId: "f-2", nama: "Fabrikasi Besi & Pengecoran Bored Pile", progres: 100, target: 100 },
  { id: "sp-5", faseId: "f-3", nama: "Pekerjaan Bekisting & Pembesian Struktur Lt.1", progres: 55, target: 65 },
  { id: "sp-6", faseId: "f-3", nama: "Pengecoran Ready Mix Beton Lt.1", progres: 25, target: 30 },
  { id: "sp-7", faseId: "f-4", nama: "Instalasi Pemipaan Air Bersih & Kotor", progres: 20, target: 30 },
  { id: "sp-8", faseId: "f-4", nama: "Instalasi Kabel Listrik & Penerangan Utama", progres: 0, target: 0 },
  { id: "sp-9", faseId: "f-5", nama: "Pekerjaan Dinding Bata & Plesteran", progres: 0, target: 10 },
  { id: "sp-10", faseId: "f-5", nama: "Pekerjaan Pengecatan Dasar & Finishing", progres: 0, target: 0 }
];

const INITIAL_LIST_PEKERJAAN = [
  { id: "r-1", subPekerjaanId: "sp-1", tipe: "Jasa", nama: "Sewa Mobil Trailer Angkut Excavator", materialId: null, satuan: "Unit", volume: 2, harga: 4000000, realisasi: 8000000 },
  { id: "r-2", subPekerjaanId: "sp-1", tipe: "Jasa", nama: "Ongkos Bongkar Muat Alat Berat", materialId: null, satuan: "Lsf", volume: 1, harga: 2000000, realisasi: 2000000 },
  { id: "r-3", subPekerjaanId: "sp-2", tipe: "Bahan", nama: "Semen Portland 50kg (Gresik)", materialId: "s-1", satuan: "Zak", volume: 20, harga: 75000, realisasi: 1500000 },
  { id: "r-4", subPekerjaanId: "sp-2", tipe: "Jasa", nama: "Pembuatan Direksi Keet Kayu", materialId: null, satuan: "m2", volume: 15, harga: 400000, realisasi: 6000000 },
  { id: "r-5", subPekerjaanId: "sp-3", tipe: "Jasa", nama: "Upah Kerja Galian Tanah Manual", materialId: null, satuan: "m3", volume: 50, harga: 150000, realisasi: 7500000 },
  { id: "r-6", subPekerjaanId: "sp-4", tipe: "Bahan", nama: "Besi Ulir D16 (KS)", materialId: "s-2", satuan: "Batang", volume: 400, harga: 185000, realisasi: 74000000 },
  { id: "r-7", subPekerjaanId: "sp-4", tipe: "Bahan", nama: "Ready Mix Concrete K-350", materialId: "s-3", satuan: "m3", volume: 30, harga: 1200000, realisasi: 36000000 },
  { id: "r-8", subPekerjaanId: "sp-5", tipe: "Bahan", nama: "Besi Ulir D16 (KS)", materialId: "s-2", satuan: "Batang", volume: 400, harga: 185000, realisasi: 45000000 },
  { id: "r-9", subPekerjaanId: "sp-5", tipe: "Jasa", nama: "Upah Tukang Pembesian & Bekisting", materialId: null, satuan: "Lsf", volume: 1, harga: 30000000, realisasi: 18000000 },
  { id: "r-10", subPekerjaanId: "sp-6", tipe: "Bahan", nama: "Ready Mix Concrete K-350", materialId: "s-3", satuan: "m3", volume: 80, harga: 1200000, realisasi: 28800000 },
  { id: "r-11", subPekerjaanId: "sp-7", tipe: "Jasa", nama: "Upah Subkon Instalasi Plumbing", materialId: null, satuan: "Lsf", volume: 1, harga: 20000000, realisasi: 5000000 },
  { id: "r-12", subPekerjaanId: "sp-7", tipe: "Jasa", nama: "Pengadaan Pipa PVC 2 & 4 Inch", materialId: null, satuan: "Batang", volume: 150, harga: 120000, realisasi: 10000000 },
  { id: "r-13", subPekerjaanId: "sp-8", tipe: "Jasa", nama: "Upah Kerja Instalasi Listrik", materialId: null, satuan: "Lsf", volume: 1, harga: 15000000, realisasi: 0 },
  { id: "r-14", subPekerjaanId: "sp-8", tipe: "Jasa", nama: "Kabel NYM 3x2.5mm Suprema", materialId: null, satuan: "Roll", volume: 10, harga: 950000, realisasi: 0 },
  { id: "r-15", subPekerjaanId: "sp-9", tipe: "Jasa", nama: "Pengadaan Bata Ringan / Hebel", materialId: null, satuan: "m3", volume: 40, harga: 750000, realisasi: 0 },
  { id: "r-16", subPekerjaanId: "sp-9", tipe: "Bahan", nama: "Semen Portland 50kg (Gresik)", materialId: "s-1", satuan: "Zak", volume: 120, harga: 75000, realisasi: 0 },
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

function run3LevelEVMRollups(fases, subPekerjaan, listPekerjaan) {
  let clonedFases = JSON.parse(JSON.stringify(fases || []));
  let clonedSub = JSON.parse(JSON.stringify(subPekerjaan || []));
  let clonedListPekerjaan = JSON.parse(JSON.stringify(listPekerjaan || []));

  clonedFases.forEach(fase => {
      fase.bobot = 100;
      const faseSubs = clonedSub.filter(sub => sub.faseId === fase.id);
      
      let weightedFaseProgress = 0;
      let weightedFaseTarget = 0;

      faseSubs.forEach(sub => {
          sub.bobot = sub.bobotManual !== undefined && sub.bobotManual !== "" && sub.bobotManual !== null 
                        ? Number(sub.bobotManual) 
                        : (faseSubs.length > 0 ? (1 / faseSubs.length) * 100 : 0);
          
          const subItems = clonedListPekerjaan.filter(item => item.subPekerjaanId === sub.id);
          if (subItems.length > 0) {
              let weightedSubProgress = 0;
              let weightedSubTarget = 0;
              subItems.forEach(item => {
                  item.bobot = item.bobotManual !== undefined && item.bobotManual !== "" && item.bobotManual !== null 
                                 ? Number(item.bobotManual) 
                                 : (subItems.length > 0 ? (1 / subItems.length) * 100 : 0);
                  const itemProgres = item.progres || 0;
                  const itemTarget = item.target || 0;
                  weightedSubProgress += (itemProgres * (item.bobot / 100));
                  weightedSubTarget += (itemTarget * (item.bobot / 100));
              });
              sub.progres = sub.progresManual !== undefined && sub.progresManual !== "" && sub.progresManual !== null 
                              ? Number(sub.progresManual) 
                              : Math.round(weightedSubProgress * 10) / 10;
              sub.target = Math.round(weightedSubTarget * 10) / 10;
          } else {
              sub.progres = sub.progresManual !== undefined && sub.progresManual !== "" && sub.progresManual !== null 
                              ? Number(sub.progresManual) 
                              : (sub.progres || 0);
              sub.target = sub.target || 0;
          }

          weightedFaseProgress += (sub.progres * (sub.bobot / 100));
          weightedFaseTarget += (sub.target * (sub.bobot / 100));
      });

      if (faseSubs.length > 0) {
          fase.progres = fase.progresManual !== undefined && fase.progresManual !== "" && fase.progresManual !== null 
                           ? Number(fase.progresManual) 
                           : Math.round(weightedFaseProgress * 10) / 10;
          fase.target = Math.round(weightedFaseTarget * 10) / 10;
      } else {
          fase.progres = fase.progresManual !== undefined && fase.progresManual !== "" && fase.progresManual !== null 
                           ? Number(fase.progresManual) 
                           : 0;
          fase.target = 0;
      }
  });

  return { computedFases: clonedFases, computedSub: clonedSub, computedlistPekerjaan: clonedListPekerjaan };
}

export default function DashboardApp() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = React.useState(false);

  const [projects, setProjects] = React.useState([]);
  const [materials, setMaterials] = React.useState([]);
  const [subPekerjaan, setSubPekerjaan] = React.useState([]);
  const [listPekerjaans, setlistPekerjaans] = React.useState([]);
  const [penggunaanLogs, setPenggunaanLogs] = React.useState([]);
  const [barangMasuk, setBarangMasuk] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedYear, setSelectedYear] = React.useState("all");

  const showToast = (msg) => {
    toast.success(msg);
  };

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setShowSplash(false);
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const initializeData = React.useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    
    try {
      // Check if migration is needed by checking main-project blob
      const docRef = doc(db, "projects", "main-project");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().migrated !== true) {
         // Migrate existing data to subcollections
         const data = docSnap.data();
         await migrateArrayToCollection("fases", data.fases || INITIAL_FASES);
         await migrateArrayToCollection("subPekerjaan", data.subPekerjaan || INITIAL_SUB_PEKERJAAN);
         await migrateArrayToCollection("listPekerjaan", data.listPekerjaan || INITIAL_LIST_PEKERJAAN);
         await migrateArrayToCollection("stok", data.stok || INITIAL_STOK);
         await migrateArrayToCollection("penggunaan", data.penggunaan || INITIAL_PENGGUNAAN);
         await migrateArrayToCollection("barangMasuk", data.barangMasuk || INITIAL_MASUK);
         await migrateArrayToCollection("ordersData", data.ordersData || INITIAL_ORDERS);
         
         await setDoc(docRef, { ...data, migrated: true });
      } else if (!docSnap.exists()) {
         // First time setup
         await migrateArrayToCollection("fases", INITIAL_FASES);
         await migrateArrayToCollection("subPekerjaan", INITIAL_SUB_PEKERJAAN);
         await migrateArrayToCollection("listPekerjaan", INITIAL_LIST_PEKERJAAN);
         await migrateArrayToCollection("stok", INITIAL_STOK);
         await migrateArrayToCollection("penggunaan", INITIAL_PENGGUNAAN);
         await migrateArrayToCollection("barangMasuk", INITIAL_MASUK);
         await migrateArrayToCollection("ordersData", INITIAL_ORDERS);
         await setDoc(docRef, { projectName: "Pembangunan Gedung Perkantoran Modern PT. ARTA BUMI SAKTI", migrated: true, lastUpdated: serverTimestamp() });
      }

      // Subscribe to collections
      const unsubFases = subscribeCollection("fases", setProjects);
      const unsubSub = subscribeCollection("subPekerjaan", setSubPekerjaan);
      const unsublistPekerjaan = subscribeCollection("listPekerjaan", setlistPekerjaans);
      const unsubStok = subscribeCollection("stok", setMaterials);
      const unsubPenggunaan = subscribeCollection("penggunaan", setPenggunaanLogs);
      const unsubMasuk = subscribeCollection("barangMasuk", setBarangMasuk);
      const unsubOrders = subscribeCollection("ordersData", setOrders);

      setLoading(false);

      return () => {
        unsubFases(); unsubSub(); unsublistPekerjaan(); unsubStok(); unsubPenggunaan(); unsubMasuk(); unsubOrders();
      };
    } catch (error) {
      console.error("Error initializing data:", error);
      setLoading(false);
      // Optional: show a toast or alert to the user here
      return () => {};
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    let unsubscribe;
    if (isAuthenticated) {
      initializeData().then(unsub => { unsubscribe = unsub; });
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, [isAuthenticated, initializeData]);

  // Recalculate computed EVM arrays whenever raw arrays change
  const [computedFases, setComputedFases] = React.useState([]);
  const [computedSub, setComputedSub] = React.useState([]);
  const [computedlistPekerjaan, setComputedlistPekerjaan] = React.useState([]);

  React.useEffect(() => {
    if (projects.length > 0) {
      const { computedFases, computedSub, computedlistPekerjaan } = run3LevelEVMRollups(projects, subPekerjaan, listPekerjaans);
      setComputedFases(computedFases);
      setComputedSub(computedSub);
      setComputedlistPekerjaan(computedlistPekerjaan);
    }
  }, [projects, subPekerjaan, listPekerjaans]);

  const saveData = React.useCallback(async () => {
    // Legacy saveData fallback; no longer needed for primary operations
    showToast("Tindakan disinkronkan ke server secara real-time!");
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem("abs_session", "active");
    setIsAuthenticated(true);
    setShowSplash(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const tabTitles = {
    dashboard: { title: "Dashboard Utama", subtitle: "Ringkasan real-time status pembangunan infrastruktur." },
    progres: { title: "Progres Fisik Proyek", subtitle: "Rincian bobot dan kemajuan fisik pembangunan." },
    listPekerjaan: { title: "Rencana Kebutuhan Material/Jasa", subtitle: "Susunan rencana kebutuhan volume material/jasa." },
    order: { title: "Order Material", subtitle: "Pengajuan dan pelacakan pesanan material." },
    penggunaan: { title: "Barang Keluar", subtitle: "Catatan riwayat pengeluaran material dari gudang ke lapangan." },
    masuk: { title: "Penerimaan Barang Masuk", subtitle: "Log riwayat penerimaan material dari supplier ke gudang dengan referensi MR/PR." },
    stok: { title: "Stok Material Gudang", subtitle: "Inventarisasi stok bahan bangunan dan status keamanan kuantitas." }
  };

  const currentHeader = tabTitles[activeTab] || tabTitles.dashboard;

  // Build allData object to pass to tabs
  const allData = {
    fases: computedFases.length ? computedFases : projects,
    subPekerjaan: computedSub.length ? computedSub : subPekerjaan,
    listPekerjaan: computedlistPekerjaan.length ? computedlistPekerjaan : listPekerjaans,
    stok: materials,
    penggunaan: penggunaanLogs,
    barangMasuk,
    ordersData: orders
  };

  const fetchData = () => {
    // No-op: Data is automatically synced via Firestore real-time listeners.
  };

  return (
    <div className="app-wrapper" style={{ display: "flex" }}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(id) => { setActiveTab(id); setMobileSidebarOpen(false); }} 
        onLogout={handleLogout} 
        currentUser={auth.currentUser}
        onOpenPasswordModal={() => setShowPasswordModal(true)}
        onOpenAddAccountModal={() => setShowAddAccountModal(true)}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      
      <main className="main-content">
        <TopBar 
          title={currentHeader.title} 
          subtitle={currentHeader.subtitle} 
          selectedYear={selectedYear} 
          setSelectedYear={setSelectedYear} 
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        
        <div className="tab-content-wrapper">
          {activeTab === "dashboard" && <DashboardTab projects={allData.fases} subPekerjaan={allData.subPekerjaan} listPekerjaans={allData.listPekerjaan} materials={allData.stok} penggunaanLogs={allData.penggunaan} loading={loading} refreshData={fetchData} selectedYear={selectedYear} allData={allData} />}
          {activeTab === "progres" && <ProgresTab projects={allData.fases} subPekerjaan={allData.subPekerjaan} listPekerjaans={allData.listPekerjaan} loading={loading} refreshData={fetchData} saveData={saveData} allData={allData} />}
          {activeTab === "listPekerjaan" && <ListPekerjaanTab listPekerjaans={allData.listPekerjaan} projects={allData.fases} subPekerjaan={allData.subPekerjaan} materials={materials} loading={loading} refreshData={fetchData} saveData={saveData} allData={allData} />}
          {activeTab === "order" && <OrderTab orders={orders} loading={loading} refreshData={fetchData} saveData={saveData} allData={allData} />}
          {activeTab === "penggunaan" && <PenggunaanTab logs={penggunaanLogs} materials={materials} projects={projects} subPekerjaan={subPekerjaan} loading={loading} refreshData={fetchData} saveData={saveData} allData={allData} />}
          {activeTab === "masuk" && <BarangMasukTab masukLogs={barangMasuk} materials={materials} loading={loading} refreshData={fetchData} saveData={saveData} allData={allData} />}
          {activeTab === "stok" && <StokTab materials={materials} loading={loading} refreshData={fetchData} saveData={saveData} allData={allData} />}
        </div>
      </main>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      {showAddAccountModal && <AddAccountModal onClose={() => setShowAddAccountModal(false)} />}

      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#1e293b',
            },
            style: {
              borderLeft: '4px solid #10b981',
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e293b',
            },
            style: {
              borderLeft: '4px solid #ef4444',
            }
          }
        }} 
      />
    </div>
  );
}
