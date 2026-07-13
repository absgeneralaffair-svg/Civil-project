"use client";
import { FileSpreadsheet, ChevronDown, ChevronRight, Edit, Printer, Briefcase, Image as ImageIcon, Settings2, Search, FolderOpen, FileText, ClipboardList } from "lucide-react";
import React, { useState } from "react";
import { updateItem } from "@/lib/db";
import { exportToExcel } from "@/lib/exportUtils";

function analyzeDateSchedule(jadwalMulai, jadwalSelesai, aktualMulai, aktualSelesai, progress) {
    if (!jadwalMulai || !jadwalSelesai) return { status: '<span class="badge" style="background:#555">Belum di-set</span>', selisih: 0, notice: '', targetHari: 0, aktualHari: 0 };
    
    const jMulai = new Date(jadwalMulai);
    const jSelesai = new Date(jadwalSelesai);
    const targetHari = Math.ceil((jSelesai - jMulai) / (1000 * 60 * 60 * 24)) + 1;
    
    let aMulai = aktualMulai ? new Date(aktualMulai) : null;
    let aSelesai = aktualSelesai ? new Date(aktualSelesai) : null;
    const now = new Date();
    
    if (!aMulai && now > jMulai) {
        const terlambatMulai = Math.ceil((now - jMulai) / (1000 * 60 * 60 * 24));
        return { status: `<span class="badge" style="background:var(--danger-color)">Belum Mulai (Terlambat ${terlambatMulai} Hari)</span>`, selisih: 0, notice: 'Harusnya sudah mulai', targetHari, aktualHari: 0 };
    }
    if (!aMulai) return { status: '<span class="badge" style="background:#555">Belum Mulai</span>', selisih: 0, notice: '', targetHari, aktualHari: 0 };
    
    const endDate = aSelesai ? aSelesai : now;
    let aktualHari = Math.ceil((endDate - aMulai) / (1000 * 60 * 60 * 24)) + 1;
    if (aktualHari <= 0) aktualHari = 1;
    
    const selisihHari = targetHari - aktualHari; 

    let hariTerlambat = 0;
    if (endDate > jSelesai) {
        hariTerlambat = Math.ceil((endDate - jSelesai) / (1000 * 60 * 60 * 24));
    }

    let notice = '';
    if (aMulai > jMulai) notice = 'Mulai Terlambat';
    
    let status = '';
    if (progress >= 100) {
        if (hariTerlambat > 0) {
            status = `<span class="badge" style="background:var(--warning-color)">Selesai (Terlambat ${hariTerlambat} Hari)</span>`;
        } else {
            status = '<span class="badge" style="background:var(--success-color)">Selesai (Sesuai)</span>';
        }
    } else {
        if (hariTerlambat > 0) {
            status = `<span class="badge" style="background:var(--warning-color)">Berjalan (Terlambat ${hariTerlambat} Hari)</span>`;
        } else {
            status = '<span class="badge" style="background:var(--primary-color)">Berjalan (Sesuai)</span>';
        }
    }

    return { status, selisih: selisihHari, notice, targetHari, aktualHari };
}

const ProgressBar = ({ value, color = "var(--primary-color)", dynamicColor = false }) => {
  let finalColor = color;
  const numValue = Number(value || 0);
  if (dynamicColor) {
     if (numValue < 40) finalColor = "var(--accent-red, #ef4444)";
     else if (numValue < 75) finalColor = "var(--accent-orange, #f59e0b)";
     else finalColor = "var(--accent-green, #10b981)";
  }

  return (
    <div style={{ width: "100%", background: "rgba(0,0,0,0.3)", borderRadius: "12px", height: "22px", position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div style={{ 
          width: `${numValue}%`, 
          background: finalColor,
          height: "100%", 
          transition: "width 0.5s ease",
          boxShadow: `0 0 10px ${finalColor}`
      }}></div>
      <span style={{ position: "absolute", width: "100%", textAlign: "center", top: "3px", left: 0, fontSize: "0.75rem", color: "#fff", fontWeight: "bold", textShadow: "1px 1px 3px rgba(0,0,0,0.9)" }}>
        {numValue.toFixed(1)}%
      </span>
    </div>
  );
};

export default function ProgresTab({ projects, subPekerjaan, rabs, loading, refreshData, saveData, allData }) {
  const PercentBadge = ({ value, type = "progres" }) => {
      const numValue = Number(value || 0);
      if (type === "bobot") {
          return (
              <span style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold", border: "1px solid rgba(255,255,255,0.1)" }}>
                  {numValue.toFixed(1)}%
              </span>
          );
      }
      let color = "var(--accent-blue)";
      if (numValue >= 100) { color = "var(--accent-green)"; }
      else if (numValue > 0 && numValue < 30) { color = "var(--accent-red)"; }
      else if (numValue >= 30 && numValue < 70) { color = "var(--accent-orange)"; }
      else if (numValue === 0) { color = "var(--text-muted)"; }
      return (
        <div style={{ width: "100%", minWidth: "60px", maxWidth: "90px", background: "rgba(255,255,255,0.05)", border: '1px solid rgba(255,255,255,0.1)', borderRadius: "12px", height: "18px", position: "relative", overflow: "hidden", display: 'inline-block', verticalAlign: 'middle' }}>
          <div style={{ width: `${Math.min(numValue, 100)}%`, background: color, height: "100%", transition: "width 0.5s ease", opacity: 0.8 }}></div>
          <span style={{ position: "absolute", width: "100%", textAlign: "center", top: "0", left: 0, lineHeight: "16px", fontSize: "0.7rem", color: "#fff", fontWeight: "bold", textShadow: "1px 1px 3px rgba(0,0,0,0.9)" }}>
            {numValue.toFixed(1)}%
          </span>
        </div>
      );
  };
  const [expandedFases, setExpandedFases] = useState({});
  const [expandedSubs, setExpandedSubs] = useState({});
  const [expandedKlasifikasi, setExpandedKlasifikasi] = useState({ "Project Baru": false, "Maintenance": false, "Pekerjaan Lain-lain": false });
  const [searchTerm, setSearchTerm] = useState("");
  
  // States for ITEM Modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemForm, setItemForm] = useState({ id: "", target: 0, progres: 0, aktualMulai: "", aktualSelesai: "", kendala: "" });

  // States for FASE Update Modal (Manual Progress)
  const [showFaseUpdateModal, setShowFaseUpdateModal] = useState(false);
  const [faseUpdateForm, setFaseUpdateForm] = useState({ id: "", progresManual: "", kendala: "" });

  // States for SUB Update Modal (Manual Progress)
  const [showSubUpdateModal, setShowSubUpdateModal] = useState(false);
  const [subUpdateForm, setSubUpdateForm] = useState({ id: "", progresManual: "", kendala: "" });

  const toggleFase = (id) => setExpandedFases(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSub = (id) => setExpandedSubs(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleKlasifikasi = (id) => setExpandedKlasifikasi(prev => ({ ...prev, [id]: !prev[id] }));

  // Handlers for Item
  const handleOpenItemModal = (item) => {
    setItemForm({ id: item.id, target: item.target || 0, progres: item.progres || 0, aktualMulai: item.aktualMulai || "", aktualSelesai: item.aktualSelesai || "", kendala: item.kendala || "" });
    setShowItemModal(true);
  };
  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      await updateItem("rab", itemForm.id, { 
        target: Number(itemForm.target), 
        progres: Number(itemForm.progres), 
        aktualMulai: itemForm.aktualMulai, 
        aktualSelesai: itemForm.aktualSelesai, 
        kendala: itemForm.kendala 
      });
      saveData();
      setShowItemModal(false);
    } catch (err) {
      console.error(err);
      alert("Gagal mengupdate progres Item!");
    }
  };

  // Handlers for Fase Update
  const handleOpenFaseUpdate = (item) => {
    setFaseUpdateForm({ id: item.id, progresManual: item.progresManual ?? "", kendala: item.kendala || "" });
    setShowFaseUpdateModal(true);
  };
  const handleSaveFaseUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateItem("fases", faseUpdateForm.id, { progresManual: faseUpdateForm.progresManual, kendala: faseUpdateForm.kendala });
      saveData();
      setShowFaseUpdateModal(false);
    } catch (err) {
      console.error(err);
      alert("Gagal mengupdate progres manual Kategori!");
    }
  };

  // Handlers for Sub Update
  const handleOpenSubUpdate = (item) => {
    setSubUpdateForm({ id: item.id, progresManual: item.progresManual ?? "", kendala: item.kendala || "" });
    setShowSubUpdateModal(true);
  };
  const handleSaveSubUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateItem("subPekerjaan", subUpdateForm.id, { progresManual: subUpdateForm.progresManual, kendala: subUpdateForm.kendala });
      saveData();
      setShowSubUpdateModal(false);
    } catch (err) {
      console.error(err);
      alert("Gagal mengupdate progres manual Sub-Pekerjaan!");
    }
  };

  const filteredSubs = (faseId) => subPekerjaan.filter(s => s.faseId === faseId);
  const filteredRabs = (subId) => rabs.filter(r => r.subPekerjaanId === subId);

  // Search logic
  const lowerSearch = searchTerm.toLowerCase();
  const matchSearch = (name) => name?.toLowerCase().includes(lowerSearch);
  const isItemMatch = (item) => matchSearch(item.nama);
  const isSubMatch = (sub, items) => matchSearch(sub.nama) || items.some(isItemMatch);
  const isFaseMatch = (fase, subs) => matchSearch(fase.nama) || subs.some(sub => isSubMatch(sub, filteredRabs(sub.id)));

  const handleExportExcel = () => {
    const data = [];
    projects.forEach(fase => {
      data.push({
        nama: fase.nama,
        bobot: Number(fase.bobot || 0).toFixed(1),
        jadwal: `${fase.mulai || ''} s.d ${fase.selesai || ''}`,
        target: fase.target,
        realisasi: fase.progres,
        kendala: fase.kendala || ''
      });
      const subs = filteredSubs(fase.id);
      subs.forEach(sub => {
        data.push({
          nama: `- ${sub.nama}`,
          bobot: Number(sub.bobot || 0).toFixed(1),
          jadwal: "",
          target: sub.target,
          realisasi: sub.progres,
          kendala: ""
        });
        const items = filteredRabs(sub.id);
        items.forEach(item => {
          data.push({
            nama: `-- ${item.nama}`,
            bobot: Number(item.bobot || 0).toFixed(1),
            jadwal: `${item.aktualMulai || ''} s.d ${item.aktualSelesai || ''}`,
            target: item.target,
            realisasi: item.progres,
            kendala: item.kendala || ''
          });
        });
      });
    });

    const columns = [
      { header: "Kategori/Pekerjaan/Item", key: "nama", width: 40 },
      { header: "Bobot (%)", key: "bobot", width: 10 },
      { header: "Jadwal", key: "jadwal", width: 25 },
      { header: "Target (%)", key: "target", width: 15 },
      { header: "Realisasi (%)", key: "realisasi", width: 15 },
      { header: "Kendala", key: "kendala", width: 30 },
    ];
    exportToExcel(data, columns, "Progres_Project");
  };

  const exportToPDF = () => {
    window.print();
  };

  const [showRekapModal, setShowRekapModal] = useState(false);
  const [selectedFaseRekap, setSelectedFaseRekap] = useState(null);

  const handleOpenRekapModal = (fase) => {
    setSelectedFaseRekap(fase);
    setShowRekapModal(true);
  };

  const getRekapMaterial = (faseId) => {
    if (!allData || !allData.penggunaan || !allData.stok) return [];
    const logs = allData.penggunaan.filter(p => p.faseId === faseId);
    const aggregated = {};
    logs.forEach(log => {
        if (!aggregated[log.materialId]) {
            aggregated[log.materialId] = 0;
        }
        aggregated[log.materialId] += Number(log.jumlah || 0);
    });
    
    return Object.keys(aggregated).map(matId => {
        const material = allData.stok.find(m => m.id === matId);
        return {
            id: matId,
            kode: material ? material.kode : "N/A",
            nama: material ? material.nama : "Material Terhapus",
            satuan: material ? material.satuan : "",
            totalJumlah: aggregated[matId]
        };
    }).sort((a, b) => b.totalJumlah - a.totalJumlah);
  };

  const KLASIFIKASI_DATA = [
    { id: "Project Baru", color: "var(--accent-blue)" },
    { id: "Maintenance", color: "var(--accent-green)" },
    { id: "Pekerjaan Lain-lain", color: "var(--text-muted)" }
  ];

  const getKlasifikasiProgress = (klasId) => {
    const klasFases = projects.filter(p => p.klasifikasi === klasId);
    if (klasFases.length === 0) return { avgTarget: 0, avgProgres: 0, count: 0 };
    const totalTarget = klasFases.reduce((sum, f) => sum + (f.target || 0), 0);
    const totalProgres = klasFases.reduce((sum, f) => sum + (f.progres || 0), 0);
    return {
        avgTarget: (totalTarget / klasFases.length).toFixed(1),
        avgProgres: (totalProgres / klasFases.length).toFixed(1),
        count: klasFases.length
    };
  };

  return (
    <section className="tab-panel active printable-area" style={{ animation: 'fadeIn 0.3s ease' }}>

      <div className="glass-card">
        <div className="card-header-action non-printable" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h4 className="card-title">Progres Fisik & Jadwal</h4>
            <p className="card-subtitle">Manajemen Pembaruan Progres (Pembuatan Sub/Fase dipindah ke menu RAB)</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Search size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
              <input 
                 type="text" 
                 placeholder="Cari Fase/Pekerjaan..." 
                 value={searchTerm} 
                 onChange={(e) => setSearchTerm(e.target.value)} 
                 style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '200px' }} 
              />
            </div>
            <button className="btn btn-secondary" onClick={handleExportExcel} title="Export data ke Excel (xlsx)">
              <FileSpreadsheet size={16} style={{ marginRight: '8px' }} /> Export Excel
            </button>
            <button className="btn btn-secondary" onClick={exportToPDF} title="Cetak / Export Laporan ke PDF">
              <Printer size={16} style={{ marginRight: '8px' }} /> Cetak PDF
            </button>
          </div>
        </div>

        <div className="printable-header" style={{ display: 'none', marginBottom: '20px' }}>
          <h2>Laporan Progres Fisik Pekerjaan</h2>
          <p>Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
        </div>

        <div className="table-container" style={{ marginTop: "20px", overflowX: "auto" }}>
          <table className="table" style={{ minWidth: "900px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                <th className="non-printable" style={{ width: "40px" }}></th>
                <th>Kategori Pekerjaan</th>
                <th>Gambar Kerja</th>
                <th style={{ width: "10%" }}>Bobot</th>
                <th>Jadwal / Status</th>
                <th style={{ width: "15%" }}>Target Progres</th>
                <th style={{ width: "15%" }}>Realisasi Progres</th>
                <th>Kendala</th>
                <th className="non-printable">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Memuat data proyek...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Belum ada data pekerjaan.</td></tr>
              ) : (
                KLASIFIKASI_DATA.map(klas => {
                  const klasProjects = projects.filter(p => p.klasifikasi === klas.id).filter(fase => {
                     if (!searchTerm) return true;
                     const subs = filteredSubs(fase.id);
                     return isFaseMatch(fase, subs);
                  });
                  if (klasProjects.length === 0) return null;
                  const isKlasExpanded = searchTerm ? true : expandedKlasifikasi[klas.id];
                  
                  return (
                    <React.Fragment key={klas.id}>
                        {/* KLASIFIKASI HEADER ROW */}
                        <tr onClick={() => toggleKlasifikasi(klas.id)} style={{ cursor: "pointer", background: "#10162a", borderBottom: `2px solid ${klas.color}`, position: "sticky", top: "45px", zIndex: 9 }} className="row-hover">
                            <td className="non-printable">
                                <button className="btn-expand" style={{ background: "none", border: "none", color: klas.color, padding: "4px", pointerEvents: "none" }}>
                                    {isKlasExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </button>
                            </td>
                            <td colSpan="8" style={{ fontWeight: 800, color: klas.color, fontSize: "1.05rem", textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <Briefcase size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> {klas.id}
                            </td>
                        </tr>

                        {isKlasExpanded && klasProjects.map(project => {
                            let subs = filteredSubs(project.id);
                            if (searchTerm) subs = subs.filter(sub => isSubMatch(sub, filteredRabs(sub.id)));
                            const isFaseExpanded = searchTerm ? true : expandedFases[project.id];
                            const schedule = analyzeDateSchedule(project.mulai, project.selesai, null, null, project.progres);
                            const hasManualProgres = project.progresManual !== undefined && project.progresManual !== "" && project.progresManual !== null;

                            return (
                                <React.Fragment key={project.id}>
                                <tr onClick={() => toggleFase(project.id)} style={{ cursor: "pointer", background: "rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.1)" }} className="row-hover">
                                    <td className="non-printable">
                                    <button className="btn-expand" style={{ background: "none", border: "none", color: "#fff", padding: "4px", pointerEvents: "none" }}>
                                        {isFaseExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>
                                    </td>
                                    <td style={{ fontWeight: 700, color: "var(--primary-color)" }}>
                                      <FolderOpen size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }}/> {project.nama}
                                    </td>
                                    <td>
                                      {(() => {
                                        const gambars = project.gambarList ? project.gambarList : (project.linkGambar ? [{judul: "Lampiran Utama", url: project.linkGambar}] : []);
                                        if (gambars.length === 0) return <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>-</span>;
                                        if (gambars.length === 1) return <a href={gambars[0].url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-orange)", textDecoration: "underline", fontSize: "0.85rem", fontWeight: "normal" }}>{gambars[0].judul || "Gambar 1"}</a>;
                                        return (
                                          <select style={{ background: "transparent", color: "var(--accent-orange)", border: "1px solid var(--accent-orange)", borderRadius: "4px", padding: "2px 4px", fontSize: "0.85rem", maxWidth: "140px", outline: "none", cursor: "pointer", fontWeight: "normal" }} onChange={(e) => { if(e.target.value) window.open(e.target.value, '_blank'); e.target.value = ''; }}>
                                            <option value="" style={{ color: "#000" }}>{gambars.length} Gambar</option>
                                            {gambars.map((g, idx) => (
                                              <option key={idx} value={g.url} style={{ color: "#000" }}>{g.judul || `Gambar ${idx + 1}`}</option>
                                            ))}
                                          </select>
                                        );
                                      })()}
                                    </td>
                                    <td><PercentBadge value={project.bobot} type="bobot" /></td>
                                    <td>
                                    <div style={{ fontSize: "0.8rem", marginBottom: "4px" }}>{project.mulai || '-'} s.d {project.selesai || '-'}</div>
                                    <div dangerouslySetInnerHTML={{ __html: schedule.status }}></div>
                                    </td>
                                    <td><ProgressBar value={project.target} color="var(--primary-color)" /></td>
                                    <td>
                                      <ProgressBar value={project.progres} dynamicColor={true} />
                                      {hasManualProgres && <span style={{ fontSize: '0.65rem', color: 'var(--accent-orange)' }}>(Manual Input)</span>}
                                    </td>
                                    <td style={{ fontSize: "0.8rem", color: "var(--warning-color)" }}>{project.kendala || '-'}</td>
                                    <td className="non-printable">
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleOpenRekapModal(project); }} title="Rekap Pemakaian Material Aktual" style={{ background: 'var(--accent-blue)', color: 'white', border: 'none', display: 'flex', alignItems: 'center' }}>
                                          <ClipboardList size={12} style={{ marginRight: '4px' }}/> Rekap Material
                                        </button>
                                        <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleOpenFaseUpdate(project); }} title="Update Progres Manual">
                                          <Settings2 size={12} style={{ marginRight: "4px" }}/> Update
                                        </button>
                                      </div>
                                    </td>
                                </tr>
                                
                                {isFaseExpanded && subs.map(sub => {
                                    let items = filteredRabs(sub.id);
                                    if (searchTerm && !matchSearch(sub.nama)) {
                                        items = items.filter(isItemMatch);
                                    }
                                    const isSubExpanded = searchTerm ? true : expandedSubs[sub.id];
                                    const hasManualSubProgres = sub.progresManual !== undefined && sub.progresManual !== "" && sub.progresManual !== null;

                                    return (
                                    <React.Fragment key={sub.id}>
                                        <tr onClick={() => toggleSub(sub.id)} style={{ cursor: "pointer", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="row-hover">
                                        <td className="non-printable"></td>
                                        <td style={{ paddingLeft: "20px" }}>
                                            <button className="btn-expand non-printable" style={{ background: "none", border: "none", color: "var(--text-secondary)", marginRight: "8px", pointerEvents: "none" }}>
                                            {isSubExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </button>
                                            <FileText size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> {sub.nama}
                                        </td>
                                        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>-</td>
                                        <td><PercentBadge value={sub.bobot} type="bobot" /></td>
                                        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>-</td>
                                        <td><ProgressBar value={sub.target} color="var(--primary-color)" /></td>
                                        <td>
                                          <ProgressBar value={sub.progres} dynamicColor={true} />
                                          {hasManualSubProgres && <span style={{ fontSize: '0.65rem', color: 'var(--accent-orange)' }}>(Manual Input)</span>}
                                        </td>
                                        <td style={{ fontSize: "0.8rem", color: "var(--warning-color)" }}>{sub.kendala || '-'}</td>
                                        <td className="non-printable">
                                          <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleOpenSubUpdate(sub); }} title="Update Progres Manual">
                                              <Settings2 size={12} style={{ marginRight: "4px" }}/> Update
                                            </button>
                                          </div>
                                        </td>
                                        </tr>

                                        {isSubExpanded && items.map(item => {
                                        const itemSchedule = analyzeDateSchedule(project.mulai, project.selesai, item.aktualMulai, item.aktualSelesai, item.progres);
                                        
                                        return (
                                            <tr key={item.id} style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px dashed rgba(255,255,255,0.05)" }}>
                                            <td className="non-printable"></td>
                                            <td style={{ paddingLeft: "50px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>• {item.nama}</td>
                                            <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>-</td>
                                            <td><PercentBadge value={item.bobot} type="bobot" /></td>
                                            <td style={{ fontSize: "0.8rem" }}>
                                                {item.aktualMulai ? (
                                                <div style={{ marginBottom: "4px" }}>
                                                    Mulai: <span style={{ color: "var(--text-primary)" }}>{item.aktualMulai}</span><br/>
                                                    Selesai: <span style={{ color: "var(--text-primary)" }}>{item.aktualSelesai || '-'}</span>
                                                </div>
                                                ) : (
                                                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Belum di-set</span>
                                                )}
                                                <div dangerouslySetInnerHTML={{ __html: itemSchedule.status }}></div>
                                            </td>
                                            <td><ProgressBar value={item.target} color="var(--primary-color)" /></td>
                                            <td><ProgressBar value={item.progres} dynamicColor={true} /></td>
                                            <td style={{ fontSize: "0.8rem", color: "var(--warning-color)" }}>{item.kendala || '-'}</td>
                                            <td className="non-printable">
                                                <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleOpenItemModal(item); }}>
                                                <Edit size={12} style={{ marginRight: "4px" }}/> Update
                                                </button>
                                            </td>
                                            </tr>
                                        );
                                        })}
                                    </React.Fragment>
                                    );
                                })}
                                </React.Fragment>
                            );
                        })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL UPDATE ITEM PROGRES */}
      {showItemModal && (
        <div className="modal active non-printable" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Update Progres & Aktual</h3>
              <button type="button" className="btn-close" onClick={() => setShowItemModal(false)}>&times;</button>
            </div>
            <form className="modal-body" onSubmit={handleSaveItem}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Target (%)</label>
                  <input type="number" step="0.1" required min="0" max="100" value={itemForm.target} onChange={(e) => setItemForm({...itemForm, target: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Realisasi (%)</label>
                  <input type="number" step="0.1" required min="0" max="100" value={itemForm.progres} onChange={(e) => setItemForm({...itemForm, progres: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Aktual Mulai</label>
                  <input type="date" value={itemForm.aktualMulai} onChange={(e) => setItemForm({...itemForm, aktualMulai: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Aktual Selesai</label>
                  <input type="date" value={itemForm.aktualSelesai} onChange={(e) => setItemForm({...itemForm, aktualSelesai: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Kendala / Catatan</label>
                <textarea rows="3" value={itemForm.kendala} onChange={(e) => setItemForm({...itemForm, kendala: e.target.value})} placeholder="Tuliskan kendala di lapangan jika ada..."></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowItemModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Progress</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UPDATE FASE (MANUAL PROGRES) */}
      {showFaseUpdateModal && (
        <div className="modal active non-printable" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Input Realisasi Progres Fase</h3>
              <button type="button" className="btn-close" onClick={() => setShowFaseUpdateModal(false)}>&times;</button>
            </div>
            <form className="modal-body" onSubmit={handleSaveFaseUpdate}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Realisasi Progres Manual (%)</label>
                <input type="number" step="0.1" min="0" max="100" value={faseUpdateForm.progresManual} onChange={(e) => setFaseUpdateForm({...faseUpdateForm, progresManual: e.target.value})} placeholder="Kosongkan untuk otomatis EVM" />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Angka ini akan meng-override perhitungan otomatis (EVM) dari sub-pekerjaan di bawahnya.</small>
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Kendala / Catatan</label>
                <textarea rows="3" value={faseUpdateForm.kendala} onChange={(e) => setFaseUpdateForm({...faseUpdateForm, kendala: e.target.value})} placeholder="Tuliskan kendala di lapangan untuk kategori ini jika ada..."></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFaseUpdateModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Progres</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UPDATE SUB-PEKERJAAN (MANUAL PROGRES) */}
      {showSubUpdateModal && (
        <div className="modal active non-printable" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Input Realisasi Progres Sub-Pekerjaan</h3>
              <button type="button" className="btn-close" onClick={() => setShowSubUpdateModal(false)}>&times;</button>
            </div>
            <form className="modal-body" onSubmit={handleSaveSubUpdate}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Realisasi Progres Manual (%)</label>
                <input type="number" step="0.1" min="0" max="100" value={subUpdateForm.progresManual} onChange={(e) => setSubUpdateForm({...subUpdateForm, progresManual: e.target.value})} placeholder="Kosongkan untuk otomatis EVM" />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Angka ini akan meng-override perhitungan otomatis (EVM) dari rincian item di bawahnya.</small>
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Kendala / Catatan</label>
                <textarea rows="3" value={subUpdateForm.kendala} onChange={(e) => setSubUpdateForm({...subUpdateForm, kendala: e.target.value})} placeholder="Tuliskan kendala di lapangan untuk sub-pekerjaan ini jika ada..."></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSubUpdateModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Progres</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* MODAL REKAP MATERIAL */}
      {showRekapModal && selectedFaseRekap && (
        <div className="modal active non-printable" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-card" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>Rekap Aktual Material: {selectedFaseRekap.nama}</h3>
              <button type="button" className="btn-close" onClick={() => setShowRekapModal(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
                Berikut adalah akumulasi material aktual yang telah digunakan (dikeluarkan dari gudang) untuk kategori pekerjaan ini. 
                Data ini diambil secara sinkron dari menu <strong>Barang Keluar</strong>.
              </p>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Part Number</th>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Nama Material</th>
                    <th style={{ textAlign: 'right', padding: '10px' }}>Total Pemakaian Aktual</th>
                  </tr>
                </thead>
                <tbody>
                  {getRekapMaterial(selectedFaseRekap.id).length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        Belum ada data pemakaian material aktual untuk pekerjaan ini di menu Barang Keluar.
                      </td>
                    </tr>
                  ) : (
                    getRekapMaterial(selectedFaseRekap.id).map(mat => (
                      <tr key={mat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{mat.kode}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{mat.nama}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-blue)' }}>
                          {mat.totalJumlah} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mat.satuan}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-footer" style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button className="btn btn-secondary" onClick={() => setShowRekapModal(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .row-hover:hover {
            background-color: rgba(255,255,255,0.15) !important;
            transition: background-color 0.2s ease;
        }
      `}} />
    </section>
  );
}
