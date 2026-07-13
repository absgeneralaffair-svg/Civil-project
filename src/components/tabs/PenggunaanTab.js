"use client";
import React, { useState } from "react";
import { FileSpreadsheet, Plus, ArrowUpRight, Search, ChevronDown } from "lucide-react";
import { addPenggunaanTransaction, updatePenggunaanTransaction, deletePenggunaanTransaction } from "@/lib/db";
import { toast } from "react-hot-toast";
import { customConfirm } from "@/lib/confirm";
import { exportToExcel } from "@/lib/exportUtils";

export default function PenggunaanTab({ logs, materials, projects, subPekerjaan, loading, refreshData, saveData, allData }) {
  const SearchableSelect = ({ options, value, onChange, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);
    const displayValue = selectedOption ? selectedOption.label : search;
    const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

    return (
      <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
        <div 
          onClick={() => !disabled && setIsOpen(!isOpen)}
          style={{
            background: 'var(--input-bg, rgba(255,255,255,0.05))',
            border: '1px solid var(--input-border, rgba(255,255,255,0.1))',
            padding: '10px 15px',
            borderRadius: '8px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <input 
            type="text"
            value={isOpen ? search : displayValue}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onClick={(e) => {
                if(!disabled) {
                   setIsOpen(true);
                   if(selectedOption) setSearch("");
                }
            }}
            placeholder={placeholder}
            disabled={disabled}
            style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100%' }}
          />
          <ChevronDown size={16} />
        </div>
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            marginTop: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
          }}>
            {filteredOptions.length > 0 ? filteredOptions.map(opt => (
              <div 
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setSearch("");
                  setIsOpen(false);
                }}
                style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                {opt.label}
              </div>
            )) : (
              <div style={{ padding: '10px 15px', color: 'var(--text-muted)' }}>Tidak ditemukan</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [faseFilter, setFaseFilter] = useState("All");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ id: "", tanggal: "", materialId: "", materialNameInput: "", jumlah: 0, faseId: "", faseNameInput: "", subPekerjaanId: "", subPekerjaanNameInput: "", penerima: "", keterangan: "", mr: "", pr: "" });

  const handleOpenModal = (item = null) => {
    if (item) { 
        const mat = materials.find(m => m.id === item.materialId);
        const f = projects.find(p => p.id === item.faseId);
        const s = subPekerjaan.find(sub => sub.id === item.subPekerjaanId);
        setForm({
            ...item, 
            materialNameInput: mat ? `[${mat.kode}] ${mat.nama}` : "",
            faseNameInput: f ? f.nama : "",
            subPekerjaanNameInput: s ? s.nama : ""
        }); 
        setIsEdit(true); 
    }
    else { 
        setForm({ id: "", tanggal: new Date().toISOString().split('T')[0], materialId: "", materialNameInput: "", jumlah: 0, faseId: "", faseNameInput: "", subPekerjaanId: "", subPekerjaanNameInput: "", penerima: "", keterangan: "", mr: "", pr: "" }); 
        setIsEdit(false); 
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.materialId) {
       toast.error("Error: Material harus dipilih dari daftar stok yang tersedia!");
       return;
    }

    const data = { tanggal: form.tanggal, materialId: form.materialId, jumlah: Number(form.jumlah), faseId: form.faseId, subPekerjaanId: form.subPekerjaanId, penerima: form.penerima, keterangan: form.keterangan, mr: form.mr, pr: form.pr };
    
    setIsSaving(true);
    const toastId = toast.loading("Memproses penyimpanan...");

    try {
      if (isEdit) {
        const oldLog = logs.find(l => l.id === form.id);
        const oldJumlah = oldLog ? Number(oldLog.jumlah) : 0;
        const oldMaterialId = oldLog ? oldLog.materialId : null;
        await updatePenggunaanTransaction(form.id, oldMaterialId, oldJumlah, data);
      } else {
        await addPenggunaanTransaction(data);
      }
      saveData();
      setShowModal(false);
      toast.success("Data berhasil disimpan!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan data!", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (item) => {
    customConfirm("Hapus catatan penggunaan ini?", async () => {
      const toastId = toast.loading("Menghapus catatan...");
      try {
        await deletePenggunaanTransaction(item.id, item.materialId, item.jumlah);
        saveData();
        toast.success("Catatan dihapus.", { id: toastId });
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Gagal menghapus data!", { id: toastId });
      }
    });
  };

  const getMaterialName = (matId) => {
    const mat = materials.find(m => m.id === matId);
    if (mat) return mat.nama;
    if (!matId) return '-';
    if (matId.length > 15) return '⚠ Material Dihapus / Tidak Valid';
    return matId;
  };
  const getMaterialSatuan = (matId) => materials.find(m => m.id === matId)?.satuan || '-';
  const getMaterialKode = (matId) => materials.find(m => m.id === matId)?.kode || '-';
  const getFaseName = (fId) => projects.find(f => f.id === fId)?.nama || '-';
  const getSubName = (sId) => subPekerjaan.find(s => s.id === sId)?.nama || '-';

  const filteredSubs = subPekerjaan.filter(s => s.faseId === form.faseId);

  const barangMasukList = allData.barangMasuk || [];

  const checkAutoFill = (mrVal, prVal) => {
     if (!mrVal && !prVal) return;
     const matchingMasuk = barangMasukList.filter(m => (mrVal && m.mr === mrVal) || (prVal && m.pr === prVal));
     
     const relevantMasuk = form.materialId 
       ? matchingMasuk.find(m => m.materialId === form.materialId)
       : matchingMasuk[0];

     if (relevantMasuk) {
        setForm(prev => ({
          ...prev,
          jumlah: relevantMasuk.jumlah || prev.jumlah,
          keterangan: relevantMasuk.keperluan || prev.keterangan,
          mr: relevantMasuk.mr || prev.mr,
          pr: relevantMasuk.pr || prev.pr,
          faseId: relevantMasuk.keperluan ? (projects.find(p => relevantMasuk.keperluan.toLowerCase().includes(p.nama.toLowerCase()))?.id || prev.faseId) : prev.faseId
        }));
     }
  };

  // Dropdown MR dan PR difilter berdasarkan Part Number yang dipilih dari riwayat Barang Masuk
  const availableMasukForMaterial = form.materialId 
    ? barangMasukList.filter(m => m.materialId === form.materialId)
    : barangMasukList;

  const availableMRs = [...new Set(availableMasukForMaterial.map(m => m.mr).filter(Boolean))];
  const availablePRs = [...new Set(availableMasukForMaterial.map(m => m.pr).filter(Boolean))];

  // Search logic
  const filteredLogs = logs.filter(item => {
    if (faseFilter !== "All" && item.faseId !== faseFilter) return false;
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    const matName = getMaterialName(item.materialId).toLowerCase();
    const faseName = getFaseName(item.faseId).toLowerCase();
    const subName = getSubName(item.subPekerjaanId).toLowerCase();
    return matName.includes(s) || faseName.includes(s) || subName.includes(s) || (item.penerima || "").toLowerCase().includes(s) || (item.keterangan || "").toLowerCase().includes(s) || (item.mr || "").toLowerCase().includes(s) || (item.pr || "").toLowerCase().includes(s);
  });

  const handleExportExcel = () => {
    const columns = [
      { header: "Tanggal", key: "tanggal", width: 15 },
      { header: "Part Number", accessor: (row) => getMaterialKode(row.materialId), width: 15 },
      { header: "Nama Material", accessor: (row) => getMaterialName(row.materialId), width: 30 },
      { header: "Jumlah", key: "jumlah", width: 10 },
      { header: "Satuan", accessor: (row) => getMaterialSatuan(row.materialId), width: 10 },
      { header: "Fase Pekerjaan", accessor: (row) => getFaseName(row.faseId), width: 30 },
      { header: "MR", key: "mr", width: 15 },
      { header: "PR", key: "pr", width: 15 },
      { header: "Petugas/Penerima", key: "penerima", width: 20 },
      { header: "Keterangan", key: "keterangan", width: 25 },
    ];
    exportToExcel(filteredLogs, columns, "Data_Barang_Keluar");
  };

  const materialOptions = materials
    .filter(m => Number(m.stok) > 0 || m.id === form.materialId)
    .map(m => ({ value: m.id, label: `[${m.kode}] ${m.nama} (Stok: ${m.stok})` }));
  const mrOptions = availableMRs.map(mr => ({ value: mr, label: mr }));
  const prOptions = availablePRs.map(pr => ({ value: pr, label: pr }));
  const faseOptions = projects.map(p => ({ value: p.id, label: p.nama }));
  const subOptions = filteredSubs.map(s => ({ value: s.id, label: s.nama }));
  const isFormReady = form.materialId && form.faseId && Number(form.jumlah) > 0;

  return (
    <section className="tab-panel active" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="glass-card">
        <div className="action-bar" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div className="search-filter-bar" style={{ display: 'flex', gap: '10px' }}>
            <div className="search-box">
              <Search className="search-icon" />
              <input 
                type="text" 
                className="input-search" 
                placeholder="Cari barang keluar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <button className="btn-clear-search" onClick={() => setSearchTerm("")}>✕ Hapus Pencarian</button>}
            </div>
            <select 
              className="input-search" 
              style={{ paddingLeft: '15px', paddingRight: '15px', width: 'auto', backgroundColor: 'var(--input-bg)' }} 
              value={faseFilter} 
              onChange={e => setFaseFilter(e.target.value)}
            >
              <option value="All">Semua Fase Pekerjaan</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-secondary" title="Export data ke Excel" onClick={handleExportExcel}>
              <FileSpreadsheet size={16} style={{ marginRight: '8px' }} /> Export Excel
            </button>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={16} style={{ marginRight: '8px' }} /> Catat Barang Keluar Baru
            </button>
          </div>
        </div>

        <div className="table-container" style={{ marginTop: "20px" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Part Number</th>
                <th>Nama Material</th>
                <th>Jumlah</th>
                <th>Satuan</th>
                <th>Fase Pekerjaan</th>
                <th>MR/PR</th>
                <th>Petugas/Penerima</th>
                <th>Keterangan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Memuat data...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Data tidak ditemukan.</td></tr>
              ) : (
                [...filteredLogs].sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal)).map(item => (
                  <tr key={item.id}>
                    <td>{item.tanggal}</td>
                    <td>{getMaterialKode(item.materialId)}</td>
                    <td style={{ fontWeight: 600 }}>{getMaterialName(item.materialId)}</td>
                    <td>{item.jumlah}</td>
                    <td>{getMaterialSatuan(item.materialId)}</td>
                    <td><span className="badge badge-blue">{getFaseName(item.faseId)}</span></td>
                    <td style={{ fontSize: "0.8rem" }}>
                        {item.mr ? <div>MR: {item.mr}</div> : null}
                        {item.pr ? <div>PR: {item.pr}</div> : null}
                    </td>
                    <td>{item.penerima || '-'}</td>
                    <td>{item.keterangan || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-small" onClick={() => handleOpenModal(item)}>Edit</button>
                        <button className="btn btn-small btn-danger" onClick={() => handleDelete(item)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal active" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-card" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{isEdit ? 'Edit Barang Keluar' : 'Catat Pengeluaran Barang'}</h3>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form className="modal-body" onSubmit={handleSave}>
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>1. Pilih Material / Part Number</label>
                <SearchableSelect 
                  options={materialOptions}
                  value={form.materialId}
                  onChange={(val) => {
                    const mat = materials.find(m => m.id === val);
                    let newMr = "";
                    let newPr = "";
                    let autoJumlah = 0;
                    let autoKeterangan = "";
                    if (mat) {
                        const matchingMasuk = barangMasukList.filter(m => m.materialId === mat.id);
                        if (matchingMasuk.length === 1) {
                            newMr = matchingMasuk[0].mr || "";
                            newPr = matchingMasuk[0].pr || "";
                            autoJumlah = matchingMasuk[0].jumlah || 0;
                            autoKeterangan = matchingMasuk[0].keperluan || "";
                        }
                    }
                    setForm({
                      ...form, 
                      materialId: val, 
                      mr: newMr, 
                      pr: newPr, 
                      jumlah: autoJumlah || form.jumlah, 
                      keterangan: autoKeterangan || form.keterangan,
                      faseId: autoKeterangan ? (projects.find(p => autoKeterangan.toLowerCase().includes(p.nama.toLowerCase()))?.id || form.faseId) : form.faseId
                    });
                  }}
                  placeholder="Ketik/Pilih material..."
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: "15px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>2. No. MR (Terfilter by Material)</label>
                  <SearchableSelect 
                    options={mrOptions}
                    value={form.mr}
                    onChange={(val) => {
                       setForm({...form, mr: val});
                       checkAutoFill(val, form.pr);
                    }}
                    placeholder="Pilih MR..."
                    disabled={!form.materialId || availableMRs.length === 0}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>3. No. PR (Terfilter by Material)</label>
                  <SearchableSelect 
                    options={prOptions}
                    value={form.pr}
                    onChange={(val) => {
                       setForm({...form, pr: val});
                       checkAutoFill(form.mr, val);
                    }}
                    placeholder="Pilih PR..."
                    disabled={!form.materialId || availablePRs.length === 0}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Jumlah Dipakai</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="number" required min="0.1" step="any" value={form.jumlah} onChange={(e) => setForm({...form, jumlah: e.target.value})} style={{ flex: 1 }} />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{form.materialId ? getMaterialSatuan(form.materialId) : ""}</span>
                  </div>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tanggal</label>
                  <input type="date" required value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Kategori Pekerjaan</label>
                  <SearchableSelect 
                    options={faseOptions}
                    value={form.faseId}
                    onChange={(val) => {
                      setForm({...form, faseId: val, subPekerjaanId: ""});
                    }}
                    placeholder="Pilih Kategori..."
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Sub-Pekerjaan</label>
                  <SearchableSelect 
                    options={subOptions}
                    value={form.subPekerjaanId}
                    onChange={(val) => {
                      setForm({...form, subPekerjaanId: val});
                    }}
                    placeholder="Pilih Sub..."
                    disabled={!form.faseId || filteredSubs.length === 0}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Petugas / Penerima</label>
                  <input type="text" required value={form.penerima} onChange={(e) => setForm({...form, penerima: e.target.value})} placeholder="Nama mandor" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Keterangan</label>
                  <input type="text" value={form.keterangan} onChange={(e) => setForm({...form, keterangan: e.target.value})} placeholder="Catatan" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                {isFormReady ? (
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? "Menyimpan..." : "Simpan Log"}
                  </button>
                ) : (
                  <div style={{ color: 'var(--accent-orange)', alignSelf: 'center', fontSize: '0.9rem' }}>
                    Mohon lengkapi Material, Kategori, dan Jumlah untuk menyimpan.
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
