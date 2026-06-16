"use client";
import React, { useState } from "react";
import { FileSpreadsheet, Printer, Plus, ChevronDown, ChevronRight, Edit, Trash2, Briefcase, Link as LinkIcon, Image as ImageIcon, Search } from "lucide-react";
import { addItem, updateItem, deleteItem } from "@/lib/db";
import { toast } from "react-hot-toast";
import { customConfirm } from "@/lib/confirm";

export default function RabTab({ rabs, projects, subPekerjaan, materials, loading, refreshData, saveData, allData }) {
  const [expandedFases, setExpandedFases] = useState({});
  const [expandedSubs, setExpandedSubs] = useState({});
  const [expandedKlasifikasi, setExpandedKlasifikasi] = useState({ "Project Baru": false, "Maintenance": false, "Pekerjaan Lain-lain": false });
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({ id: "", subPekerjaanId: "", subPekerjaanNameInput: "", tipe: "Jasa", nama: "", materialId: "", satuan: "", volume: 0, bobotManual: "" });

  // Modals for Fase
  const [showFaseModal, setShowFaseModal] = useState(false);
  const [isEditFase, setIsEditFase] = useState(false);
  const [faseForm, setFaseForm] = useState({ id: "", nama: "", klasifikasi: "Project Baru", mulai: "", selesai: "", aktualMulai: "", aktualSelesai: "", linkGambar: "", bobotManual: "" });

  // Modals for Sub
  const [showSubModal, setShowSubModal] = useState(false);
  const [isEditSub, setIsEditSub] = useState(false);
  const [subForm, setSubForm] = useState({ id: "", faseId: "", nama: "", bobotManual: "" });

  const toggleFase = (id) => setExpandedFases(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSub = (id) => setExpandedSubs(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleKlasifikasi = (id) => setExpandedKlasifikasi(prev => ({ ...prev, [id]: !prev[id] }));

  const [isSaving, setIsSaving] = useState(false);

  // --- FASE CRUD ---
  const handleOpenFaseModal = (item = null) => {
    if (item) { setFaseForm({ ...item, bobotManual: item.bobotManual ?? "", aktualMulai: item.aktualMulai || "", aktualSelesai: item.aktualSelesai || "" }); setIsEditFase(true); }
    else { setFaseForm({ id: "", nama: "", klasifikasi: "Project Baru", mulai: "", selesai: "", aktualMulai: "", aktualSelesai: "", linkGambar: "", bobotManual: "" }); setIsEditFase(false); }
    setShowFaseModal(true);
  };
  const handleSaveFase = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditFase) {
        await updateItem("fases", faseForm.id, faseForm);
      } else {
        await addItem("fases", { ...faseForm, bobot: 0, target: 0, progres: 0 });
      }
      saveData(); // to show toast
      setShowFaseModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan Fase!");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteFase = (id) => {
    customConfirm("Hapus Fase/Kategori ini? Seluruh sub-pekerjaan di bawahnya akan terputus referensinya.", async () => {
      try {
        await deleteItem("fases", id);
        saveData();
        toast.success("Fase dihapus.");
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Gagal menghapus Fase!");
      }
    });
  };

  // --- SUB-PEKERJAAN CRUD ---
  const handleOpenSubModal = (item = null, defaultFaseId = "") => {
    if (item) { 
        const fase = projects.find(p => p.id === item.faseId);
        setSubForm({ ...item, bobotManual: item.bobotManual ?? "" }); 
        setIsEditSub(true); 
    }
    else { 
        setSubForm({ id: "", faseId: defaultFaseId, nama: "", bobotManual: "" }); 
        setIsEditSub(false); 
    }
    setShowSubModal(true);
  };
  const handleSaveSub = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditSub) {
        await updateItem("subPekerjaan", subForm.id, subForm);
      } else {
        await addItem("subPekerjaan", { ...subForm, progres: 0, target: 0 });
      }
      saveData();
      setShowSubModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan Sub-pekerjaan!");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteSub = (id) => {
    customConfirm("Hapus Sub-Pekerjaan ini?", async () => {
      try {
        await deleteItem("subPekerjaan", id);
        saveData();
        toast.success("Sub-pekerjaan dihapus.");
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Gagal menghapus Sub!");
      }
    });
  };

  // --- ITEM RAB CRUD ---
  const handleOpenModal = (item = null, defaultSubId = "") => {
    if (item) { 
        const sub = subPekerjaan.find(s => s.id === item.subPekerjaanId);
        setForm({ ...item, bobotManual: item.bobotManual ?? "" }); 
        setIsEdit(true); 
    }
    else { 
        setForm({ id: "", subPekerjaanId: defaultSubId, tipe: "Jasa", nama: "", materialId: "", satuan: "", volume: 0, bobotManual: "" }); 
        setIsEdit(false); 
    }
    setShowModal(true);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const data = { 
        subPekerjaanId: form.subPekerjaanId, 
        tipe: form.tipe, 
        nama: form.nama, 
        materialId: form.materialId || null, 
        satuan: form.satuan, 
        volume: Number(form.volume),
        bobotManual: form.bobotManual
    };
    
    try {
      if (isEdit) {
        await updateItem("rab", form.id, data);
      } else {
        await addItem("rab", { ...data, progres: 0, target: 0 });
      }
      saveData();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan Item RAB!");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDelete = (id) => {
    customConfirm("Hapus item RAB ini?", async () => {
      try {
        await deleteItem("rab", id);
        saveData();
        toast.success("Item RAB dihapus.");
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Gagal menghapus Item!");
      }
    });
  };

  const filteredSubs = (faseId) => subPekerjaan.filter(s => s.faseId === faseId);
  const filteredRabs = (subId) => rabs.filter(r => r.subPekerjaanId === subId);

  // Search logic
  const lowerSearch = searchTerm.toLowerCase();
  const matchSearch = (name) => name?.toLowerCase().includes(lowerSearch);
  const isItemMatch = (item) => matchSearch(item.nama);
  const isSubMatch = (sub, items) => matchSearch(sub.nama) || items.some(isItemMatch);
  const isFaseMatch = (fase, subs) => matchSearch(fase.nama) || subs.some(sub => isSubMatch(sub, filteredRabs(sub.id)));

  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Kategori/Pekerjaan/Item,Bobot,Tipe,Satuan,Volume\n";
    projects.forEach(fase => {
      csvContent += `"${fase.nama}","${Number(fase.bobot || 0).toFixed(1)}",,,\n`;
      const subs = filteredSubs(fase.id);
      subs.forEach(sub => {
        csvContent += `"- ${sub.nama}","${Number(sub.bobot || 0).toFixed(1)}",,,\n`;
        const items = filteredRabs(sub.id);
        items.forEach(item => {
          csvContent += `"-- ${item.nama}","${Number(item.bobot || 0).toFixed(1)}","${item.tipe}","${item.satuan}","${item.volume}"\n`;
        });
      });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "RAB_Data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    window.print();
  };

  const KLASIFIKASI_DATA = [
    { id: "Project Baru", color: "var(--accent-blue)" },
    { id: "Maintenance", color: "var(--accent-green)" },
    { id: "Pekerjaan Lain-lain", color: "var(--text-muted)" }
  ];

  return (
    <section className="tab-panel active printable-area" style={{ animation: 'fadeIn 0.3s ease' }}>

      <div className="glass-card">
        <div className="card-header-action non-printable" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h4 className="card-title">Struktur Pekerjaan & RAB</h4>
            <p className="card-subtitle">Sentralisasi kerangka proyek (Kategori → Sub-Pekerjaan → Rincian Item).</p>
          </div>
          <div className="btn-group" style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Search size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
              <input 
                 type="text" 
                 placeholder="Cari Pekerjaan / Item..." 
                 value={searchTerm} 
                 onChange={(e) => setSearchTerm(e.target.value)} 
                 style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '200px' }} 
              />
            </div>
            <button className="btn btn-secondary" onClick={exportToExcel} title="Export data ke Excel (CSV)">
              <FileSpreadsheet size={16} style={{ marginRight: '8px' }} /> Export Excel
            </button>
            <button className="btn btn-secondary" onClick={exportToPDF} title="Cetak / Export Laporan ke PDF">
              <Printer size={16} style={{ marginRight: '8px' }} /> Cetak PDF
            </button>
            <button className="btn btn-primary" onClick={() => handleOpenFaseModal()}>
              <Plus size={16} style={{ marginRight: '8px' }} /> Tambah Kategori / Fase
            </button>
          </div>
        </div>

        <div className="printable-header" style={{ display: 'none', marginBottom: '20px' }}>
          <h2>Laporan Rencana Kebutuhan Material/Jasa (RAB)</h2>
          <p>Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
        </div>

        <div className="table-container" style={{ marginTop: "20px", overflowX: "auto" }}>
          <table className="table" style={{ minWidth: "900px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                <th className="non-printable" style={{ width: "40px" }}></th>
                <th>Kategori / Pekerjaan / Item</th>
                <th style={{ width: "80px" }}>Bobot</th>
                <th>Tipe</th>
                <th>Satuan</th>
                <th>Volume</th>
                <th>Gambar Kerja</th>
                <th className="non-printable">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Memuat data RAB...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Belum ada data struktur proyek. Silakan Tambah Kategori / Fase.</td></tr>
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
                          <td colSpan="7" style={{ fontWeight: 800, color: klas.color, fontSize: "1.05rem", textTransform: 'uppercase', letterSpacing: '1px' }}>
                              <Briefcase size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> {klas.id}
                          </td>
                      </tr>

                      {isKlasExpanded && klasProjects.map(fase => {
                        const isFaseExpanded = searchTerm ? true : expandedFases[fase.id] === true; // default collapsed
                        let subs = filteredSubs(fase.id);
                        if (searchTerm) subs = subs.filter(sub => isSubMatch(sub, filteredRabs(sub.id)));
                        const hasManualBobot = fase.bobotManual !== undefined && fase.bobotManual !== "" && fase.bobotManual !== null;

                        return (
                          <React.Fragment key={fase.id}>
                            <tr onClick={() => toggleFase(fase.id)} className="row-hover" style={{ cursor: "pointer", background: "rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                              <td className="non-printable">
                                <button className="btn-expand non-printable" style={{ background: "none", border: "none", pointerEvents: "none", color: "#fff", padding: "4px" }}>
                                  {isFaseExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </button>
                              </td>
                              <td style={{ fontWeight: 700, color: "var(--primary-color)" }}>
                                📁 {fase.nama}
                                {fase.linkGambar && (
                                    <a href={fase.linkGambar} target="_blank" rel="noopener noreferrer" className="btn btn-small non-printable" style={{ marginLeft: '10px', display: 'inline-flex', padding: '2px 6px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(56, 189, 248, 0.2)' }} onClick={(e) => e.stopPropagation()}>
                                      <ImageIcon size={12} style={{ marginRight: '4px' }}/> Gambar
                                    </a>
                                )}
                              </td>
                              <td style={{ fontWeight: 'bold' }}>
                                {Number(fase.bobot || 0).toFixed(1)}%
                                {hasManualBobot && <div style={{ fontSize: '0.65rem', color: 'var(--accent-orange)' }}>(Manual)</div>}
                              </td>
                              <td colSpan="4"></td>
                              <td className="non-printable">
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleOpenSubModal(null, fase.id); }}>+ Sub</button>
                                    <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleOpenFaseModal(fase); }}><Edit size={12}/></button>
                                    <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDeleteFase(fase.id); }}><Trash2 size={12}/></button>
                                </div>
                              </td>
                            </tr>

                            {isFaseExpanded && fase.linkGambar && (
                                <tr style={{ background: "rgba(255,255,255,0.02)" }} className="non-printable">
                                    <td className="non-printable"></td>
                                    <td colSpan="7">
                                        <div style={{ padding: '10px 0', marginLeft: '20px' }}>
                                            <a href={fase.linkGambar} target="_blank" rel="noopener noreferrer">
                                                <img src={fase.linkGambar} alt="Lampiran" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--card-border)', objectFit: 'contain' }} />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {isFaseExpanded && subs.map(sub => {
                              const isSubExpanded = searchTerm ? true : expandedSubs[sub.id] === true; // default collapsed
                              let items = filteredRabs(sub.id);
                              if (searchTerm && !matchSearch(sub.nama)) {
                                  items = items.filter(isItemMatch);
                              }
                              const hasManualSubBobot = sub.bobotManual !== undefined && sub.bobotManual !== "" && sub.bobotManual !== null;

                              return (
                                <React.Fragment key={sub.id}>
                                  <tr onClick={() => toggleSub(sub.id)} className="row-hover" style={{ cursor: "pointer", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <td className="non-printable"></td>
                                    <td style={{ paddingLeft: "20px", fontWeight: 600 }}>
                                      <button className="btn-expand non-printable" style={{ background: "none", border: "none", pointerEvents: "none", color: "var(--text-secondary)", marginRight: "8px" }}>
                                        {isSubExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                      </button>
                                      📄 {sub.nama}
                                    </td>
                                    <td style={{ fontWeight: 'bold' }}>
                                      {Number(sub.bobot || 0).toFixed(1)}%
                                      {hasManualSubBobot && <div style={{ fontSize: '0.65rem', color: 'var(--accent-orange)' }}>(Manual)</div>}
                                    </td>
                                    <td colSpan="4"></td>
                                    <td className="non-printable">
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleOpenModal(null, sub.id); }}>+ Item</button>
                                        <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleOpenSubModal(sub); }}><Edit size={12}/></button>
                                        <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDeleteSub(sub.id); }}><Trash2 size={12}/></button>
                                      </div>
                                    </td>
                                  </tr>

                                  {isSubExpanded && items.length === 0 && (
                                      <tr><td colSpan="8" style={{ paddingLeft: "50px", color: "var(--text-muted)", fontSize: "0.85rem" }}>— Belum ada item rincian</td></tr>
                                  )}
                                  {isSubExpanded && items.map(item => {
                                      const hasManualItemBobot = item.bobotManual !== undefined && item.bobotManual !== "" && item.bobotManual !== null;
                                      return (
                                        <tr key={item.id} style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px dashed rgba(255,255,255,0.05)" }}>
                                          <td className="non-printable"></td>
                                          <td style={{ paddingLeft: "50px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>• {item.nama}</td>
                                          <td>
                                              {Number(item.bobot || 0).toFixed(1)}%
                                              {hasManualItemBobot && <div style={{ fontSize: '0.65rem', color: 'var(--accent-orange)' }}>(Manual)</div>}
                                          </td>
                                          <td><span className={`badge badge-${item.tipe === 'Bahan' ? 'blue' : 'orange'}`}>{item.tipe}</span></td>
                                          <td>{item.satuan}</td>
                                          <td>{item.volume}</td>
                                          <td>
                                            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontStyle: "italic" }}>-</span>
                                          </td>
                                          <td className="non-printable">
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                              <button className="btn btn-small" onClick={() => handleOpenModal(item)}>
                                                  <Edit size={12} style={{ marginRight: '4px' }}/> Edit
                                              </button>
                                              <button className="btn btn-small btn-danger" onClick={() => handleDelete(item.id)}>
                                                  <Trash2 size={12} style={{ marginRight: '4px' }}/> Hapus
                                              </button>
                                            </div>
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

      {/* MODAL FASE */}
      {showFaseModal && (
        <div className="modal active non-printable" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-card" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{isEditFase ? 'Edit Kategori/Fase' : 'Tambah Kategori/Fase'}</h3>
              <button type="button" className="btn-close" onClick={() => setShowFaseModal(false)}>&times;</button>
            </div>
            <form className="modal-body" onSubmit={handleSaveFase}>
              <div className="form-group">
                <label>Nama Kategori Pekerjaan</label>
                <input type="text" required value={faseForm.nama} onChange={(e) => setFaseForm({...faseForm, nama: e.target.value})} placeholder="Contoh: Pekerjaan Persiapan" />
              </div>
              <div className="form-group">
                <label>Klasifikasi Kategori</label>
                <select 
                  required 
                  value={faseForm.klasifikasi} 
                  onChange={(e) => setFaseForm({...faseForm, klasifikasi: e.target.value})} 
                >
                    <option value="">-- Pilih Klasifikasi --</option>
                    <option value="Project Baru">Project Baru</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Pekerjaan Lain-lain">Pekerjaan Lain-lain</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Jadwal Mulai</label>
                  <input type="date" required value={faseForm.mulai} onChange={(e) => setFaseForm({...faseForm, mulai: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Jadwal Selesai</label>
                  <input type="date" required value={faseForm.selesai} onChange={(e) => setFaseForm({...faseForm, selesai: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Aktual Mulai</label>
                  <input type="date" value={faseForm.aktualMulai || ""} onChange={(e) => setFaseForm({...faseForm, aktualMulai: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Aktual Selesai</label>
                  <input type="date" value={faseForm.aktualSelesai || ""} onChange={(e) => setFaseForm({...faseForm, aktualSelesai: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label>Bobot Pekerjaan (%) (Opsional)</label>
                <input type="number" step="0.1" min="0" max="100" value={faseForm.bobotManual} onChange={(e) => setFaseForm({...faseForm, bobotManual: e.target.value})} placeholder="Kosongkan untuk bagi rata otomatis" />
              </div>
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label>Link Gambar Kerja (Opsional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <LinkIcon size={16} style={{ color: 'var(--text-muted)' }} />
                  <input type="url" value={faseForm.linkGambar || ''} onChange={(e) => setFaseForm({...faseForm, linkGambar: e.target.value})} placeholder="https://drive.google.com/... atau URL gambar" style={{ flex: 1 }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFaseModal(false)} disabled={isSaving}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                   {isSaving ? "Menyimpan..." : "Simpan Fase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SUB-PEKERJAAN */}
      {showSubModal && (
        <div className="modal active non-printable" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{isEditSub ? 'Edit Sub-Pekerjaan' : 'Tambah Sub-Pekerjaan'}</h3>
              <button type="button" className="btn-close" onClick={() => setShowSubModal(false)}>&times;</button>
            </div>
            <form className="modal-body" onSubmit={handleSaveSub}>
              <div className="form-group">
                <label>Kategori (Fase) Induk</label>
                <select 
                  required 
                  value={subForm.faseId} 
                  onChange={(e) => setSubForm({...subForm, faseId: e.target.value})} 
                >
                  <option value="">-- Pilih Kategori Induk --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Nama Sub-Pekerjaan</label>
                <input type="text" required value={subForm.nama} onChange={(e) => setSubForm({...subForm, nama: e.target.value})} placeholder="Contoh: Pekerjaan Dinding" />
              </div>
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label>Bobot Pekerjaan (%) (Opsional)</label>
                <input type="number" step="0.1" min="0" max="100" value={subForm.bobotManual} onChange={(e) => setSubForm({...subForm, bobotManual: e.target.value})} placeholder="Kosongkan untuk bagi rata otomatis" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSubModal(false)} disabled={isSaving}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                   {isSaving ? "Menyimpan..." : "Simpan Sub-Pekerjaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ITEM RAB */}
      {showModal && (
        <div className="modal active non-printable" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-card" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{isEdit ? 'Edit Item RAB' : 'Tambah Item RAB'}</h3>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form className="modal-body" onSubmit={handleSave}>
              <div className="form-group">
                <label>Sub-Pekerjaan</label>
                <select 
                  required 
                  value={form.subPekerjaanId} 
                  onChange={(e) => setForm({...form, subPekerjaanId: e.target.value})} 
                >
                  <option value="">-- Pilih Sub-Pekerjaan --</option>
                  {subPekerjaan.map(sub => <option key={sub.id} value={sub.id}>{sub.nama}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tipe</label>
                  <select 
                    required 
                    value={form.tipe} 
                    onChange={(e) => setForm({...form, tipe: e.target.value})} 
                  >
                    <option value="Jasa">Upah / Jasa</option>
                    <option value="Bahan">Bahan / Material</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Nama Item</label>
                  <input type="text" required value={form.nama} onChange={(e) => setForm({...form, nama: e.target.value})} placeholder="Contoh: Semen Portland" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Satuan</label>
                  <input type="text" required value={form.satuan} onChange={(e) => setForm({...form, satuan: e.target.value})} placeholder="m3, kg, Lsf" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Volume</label>
                  <input type="number" required min="0" step="any" value={form.volume} onChange={(e) => setForm({...form, volume: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label>Bobot Pekerjaan (%) (Opsional)</label>
                <input type="number" step="0.1" min="0" max="100" value={form.bobotManual} onChange={(e) => setForm({...form, bobotManual: e.target.value})} placeholder="Kosongkan untuk bagi rata otomatis" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={isSaving}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? "Menyimpan..." : "Simpan Item"}
                </button>
              </div>
            </form>
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
