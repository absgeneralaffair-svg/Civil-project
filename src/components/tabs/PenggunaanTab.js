"use client";
import React, { useState } from "react";
import { FileSpreadsheet, Plus, ArrowUpRight, Search } from "lucide-react";
import { addPenggunaanTransaction, updatePenggunaanTransaction, deletePenggunaanTransaction } from "@/lib/db";
import { toast } from "react-hot-toast";
import { customConfirm } from "@/lib/confirm";

export default function PenggunaanTab({ logs, materials, projects, subPekerjaan, loading, refreshData, saveData, allData }) {
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
    const data = { tanggal: form.tanggal, materialId: form.materialId, jumlah: Number(form.jumlah), faseId: form.faseId, subPekerjaanId: form.subPekerjaanId, penerima: form.penerima, keterangan: form.keterangan, mr: form.mr, pr: form.pr };
    
    try {
      if (isEdit) {
        const oldLog = logs.find(l => l.id === form.id);
        const oldJumlah = oldLog ? Number(oldLog.jumlah) : 0;
        await updatePenggunaanTransaction(form.id, form.materialId, oldJumlah, data);
      } else {
        await addPenggunaanTransaction(data);
      }
      saveData();
      setShowModal(false);
      toast.success("Data berhasil disimpan.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan data!");
    }
  };

  const handleDelete = (item) => {
    customConfirm("Hapus log penggunaan ini?", async () => {
      try {
        await deletePenggunaanTransaction(item.id, item.materialId, item.jumlah);
        saveData();
        toast.success("Catatan barang keluar dihapus.");
      } catch (err) {
        console.error(err);
        toast.error("Gagal menghapus data!");
      }
    });
  };

  const getMaterialName = (matId) => materials.find(m => m.id === matId)?.nama || matId || '-';
  const getMaterialSatuan = (matId) => materials.find(m => m.id === matId)?.satuan || '';
  const getMaterialKode = (matId) => materials.find(m => m.id === matId)?.kode || '-';
  const getFaseName = (fId) => projects.find(f => f.id === fId)?.nama || '-';
  const getSubName = (sId) => subPekerjaan.find(s => s.id === sId)?.nama || '-';

  const filteredSubs = subPekerjaan.filter(s => s.faseId === form.faseId);

  const pendingOrders = (allData.ordersData || []).filter(o => o.status !== "Selesai");

  const checkAutoFill = (mrVal, prVal) => {
     if (!mrVal && !prVal) return;
     const matchingOrders = pendingOrders.filter(o => (mrVal && o.mr === mrVal) || (prVal && o.pr === prVal));
     
     const relevantOrder = form.materialId 
       ? matchingOrders.find(o => materials.find(m => m.id === form.materialId)?.kode === o.partnumber)
       : matchingOrders[0];

     if (relevantOrder) {
        setForm(prev => ({
          ...prev,
          jumlah: relevantOrder.qty || prev.jumlah,
          keterangan: relevantOrder.keperluan || prev.keterangan,
          mr: relevantOrder.mr || prev.mr,
          pr: relevantOrder.pr || prev.pr
        }));
     }
  };

  // Dropdown MR dan PR difilter berdasarkan Part Number yang dipilih
  const availableOrdersForMaterial = form.materialId 
    ? pendingOrders.filter(o => {
        const mat = materials.find(m => m.id === form.materialId);
        return mat && o.partnumber === mat.kode;
      })
    : pendingOrders;

  const availableMRs = [...new Set(availableOrdersForMaterial.map(o => o.mr).filter(Boolean))];
  const availablePRs = [...new Set(availableOrdersForMaterial.map(o => o.pr).filter(Boolean))];

  // Search logic
  const filteredLogs = logs.filter(item => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    const matName = getMaterialName(item.materialId).toLowerCase();
    const faseName = getFaseName(item.faseId).toLowerCase();
    const subName = getSubName(item.subPekerjaanId).toLowerCase();
    return matName.includes(s) || faseName.includes(s) || subName.includes(s) || (item.penerima || "").toLowerCase().includes(s) || (item.keterangan || "").toLowerCase().includes(s) || (item.mr || "").toLowerCase().includes(s) || (item.pr || "").toLowerCase().includes(s);
  });

  return (
    <section className="tab-panel active" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="glass-card">
        <div className="action-bar" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div className="search-filter-bar">
            <div className="search-box">
              <Search className="search-icon" />
              <input 
                type="text" 
                className="input-search" 
                placeholder="Cari barang keluar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <button className="btn-clear-search" onClick={() => setSearchTerm("")}>✕</button>}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-secondary" title="Export data ke Excel">
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
                <input 
                  type="text" 
                  list="material-list" 
                  required 
                  value={form.materialNameInput || ""} 
                  onChange={(e) => {
                    const val = e.target.value;
                    const mat = materials.find(m => `[${m.kode}] ${m.nama}` === val);
                    let newMr = "";
                    let newPr = "";
                    let autoJumlah = 0;
                    let autoKeterangan = "";
                    if (mat) {
                        const matchingOrders = pendingOrders.filter(o => o.partnumber === mat.kode || o.nama === mat.nama);
                        if (matchingOrders.length === 1) {
                            newMr = matchingOrders[0].mr || "";
                            newPr = matchingOrders[0].pr || "";
                            autoJumlah = matchingOrders[0].qty || 0;
                            autoKeterangan = matchingOrders[0].keperluan || "";
                        }
                    }
                    setForm({...form, materialNameInput: val, materialId: mat ? mat.id : "", mr: newMr, pr: newPr, jumlah: autoJumlah || form.jumlah, keterangan: autoKeterangan || form.keterangan});
                  }} 
                  placeholder="Ketik nama atau kode material..." 
                />
                <datalist id="material-list">
                  {materials.map(m => <option key={m.id} value={`[${m.kode}] ${m.nama}`} />)}
                </datalist>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: "15px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>2. No. MR (Terfilter by Material)</label>
                  <input type="text" list="mr-list" value={form.mr} onChange={(e) => {
                     setForm({...form, mr: e.target.value});
                     checkAutoFill(e.target.value, form.pr);
                  }} placeholder="Pilih MR..." disabled={!form.materialId} />
                  <datalist id="mr-list">
                    {availableMRs.map(mr => <option key={mr} value={mr} />)}
                  </datalist>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>3. No. PR (Terfilter by Material)</label>
                  <input type="text" list="pr-list" value={form.pr} onChange={(e) => {
                     setForm({...form, pr: e.target.value});
                     checkAutoFill(form.mr, e.target.value);
                  }} placeholder="Pilih PR..." disabled={!form.materialId} />
                  <datalist id="pr-list">
                    {availablePRs.map(pr => <option key={pr} value={pr} />)}
                  </datalist>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Jumlah Dipakai</label>
                  <input type="number" required min="0.1" step="any" value={form.jumlah} onChange={(e) => setForm({...form, jumlah: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tanggal</label>
                  <input type="date" required value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Kategori Pekerjaan</label>
                  <input 
                    type="text" 
                    list="fase-list" 
                    required 
                    value={form.faseNameInput} 
                    onChange={(e) => {
                      const val = e.target.value;
                      const f = projects.find(p => p.nama === val);
                      setForm({...form, faseNameInput: val, faseId: f ? f.id : "", subPekerjaanId: "", subPekerjaanNameInput: ""});
                    }} 
                    placeholder="Ketik/Pilih Kategori..." 
                  />
                  <datalist id="fase-list">
                    {projects.map(p => <option key={p.id} value={p.nama} />)}
                  </datalist>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Sub-Pekerjaan</label>
                  <input 
                    type="text" 
                    list="sub-list" 
                    required 
                    value={form.subPekerjaanNameInput} 
                    onChange={(e) => {
                      const val = e.target.value;
                      const s = filteredSubs.find(sub => sub.nama === val);
                      setForm({...form, subPekerjaanNameInput: val, subPekerjaanId: s ? s.id : ""});
                    }} 
                    placeholder="Ketik/Pilih Sub..." 
                  />
                  <datalist id="sub-list">
                    {filteredSubs.map(s => <option key={s.id} value={s.nama} />)}
                  </datalist>
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
                <button type="submit" className="btn btn-primary">Simpan Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
