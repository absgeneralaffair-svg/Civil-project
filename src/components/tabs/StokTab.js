"use client";
import React, { useState } from "react";
import { FileSpreadsheet, Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { customConfirm } from "@/lib/confirm";
import { addItem, updateItem, deleteItem } from "@/lib/db";
import { exportToExcel } from "@/lib/exportUtils";

export default function StokTab({ materials, loading, refreshData, saveData, allData }) {
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [form, setForm] = useState({ id: "", kode: "", nama: "", grup: "Material Alam", spesifikasi: "", satuan: "Unit", min: 0, stok: 0, lokasi: "", remark: "" });

  const handleOpenModal = (item = null) => {
    if (item) { setForm({ ...item, stok: item.stok ?? 0, min: item.min ?? 0, gudang: item.gudang ?? "" }); setIsEdit(true); }
    else { setForm({ id: "", kode: "", nama: "", stok: 0, min: 0, satuan: "", gudang: "" }); setIsEdit(false); }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (isEdit) {
      if (materials.some(m => m.kode === form.kode && m.id !== form.id)) {
        toast.error("Kode material (Part Number) sudah dipakai oleh material lain!");
        return;
      }
    } else {
      if (materials.some(m => m.kode === form.kode)) {
        toast.error("Kode material (Part Number) sudah ada!");
        return;
      }
    }

    const data = { kode: form.kode, nama: form.nama, stok: Number(form.stok), min: Number(form.min), satuan: form.satuan, gudang: form.gudang };
    try {
      if (isEdit) {
        await updateItem("stok", form.id, data);
      } else {
        await addItem("stok", data);
      }
      saveData();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data!");
    }
  };

  const handleDelete = (id) => {
    customConfirm("Hapus data material ini?", async () => {
      try {
        await deleteItem("stok", id);
        saveData();
        toast.success("Material dihapus.");
      } catch (err) {
        console.error(err);
        toast.error("Gagal menghapus material!");
      }
    });
  };

  const getStatusInfo = (item) => {
    if (item.stok <= 0) return { text: "Habis", class: "badge-red" };
    if (item.stok <= item.min) return { text: "Menipis", class: "badge-orange" };
    return { text: "Aman", class: "badge-green" };
  };

  // Search logic
  const filteredMaterials = materials.filter(item => {
    if (statusFilter !== "All") {
      const statusText = getStatusInfo(item).text;
      if (statusText !== statusFilter) return false;
    }
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (item.nama || "").toLowerCase().includes(s) || 
           (item.kode || "").toLowerCase().includes(s) || 
           (item.grup || "").toLowerCase().includes(s);
  });

  const handleExportExcel = () => {
    const columns = [
      { header: "Part Number", key: "kode", width: 15 },
      { header: "Nama Material", key: "nama", width: 30 },
      { header: "Stok Saat Ini", key: "stok", width: 15 },
      { header: "Batas Minimum", key: "min", width: 15 },
      { header: "Satuan", key: "satuan", width: 10 },
      { header: "Lokasi Gudang", key: "gudang", width: 20 },
      { header: "Status", accessor: (row) => getStatusInfo(row).text, width: 15 },
    ];
    exportToExcel(filteredMaterials, columns, "Data_Stok_Material");
  };

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
                placeholder="Cari material..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <button className="btn-clear-search" onClick={() => setSearchTerm("")}>✕ Hapus Pencarian</button>}
            </div>
            <select 
              className="input-search" 
              style={{ paddingLeft: '15px', paddingRight: '15px', width: 'auto', backgroundColor: 'var(--input-bg)' }} 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">Semua Status</option>
              <option value="Aman">Aman</option>
              <option value="Menipis">Menipis</option>
              <option value="Habis">Habis</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary" title="Export data ke Excel" onClick={handleExportExcel}>
              <FileSpreadsheet size={16} style={{ marginRight: '8px' }} /> Export Excel
            </button>
            <button className="btn btn-secondary" onClick={() => handleOpenModal()}>
              <Plus size={16} style={{ marginRight: '8px' }} /> Tambah Item Baru
            </button>
            <button className="btn btn-primary" onClick={() => refreshData()}>
              <RefreshCw size={16} style={{ marginRight: '8px' }} /> Sesuaikan Stok
            </button>
          </div>
        </div>

        <div className="table-container" style={{ marginTop: "20px" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Nama Material</th>
                <th>Stok Saat Ini</th>
                <th>Batas Minimum</th>
                <th>Satuan</th>
                <th>Lokasi Gudang</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Memuat data stok...</td></tr>
              ) : filteredMaterials.length === 0 ? (
                <tr><td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Data tidak ditemukan.</td></tr>
              ) : (
                filteredMaterials.map(item => {
                  const status = getStatusInfo(item);
                  return (
                    <tr key={item.id}>
                      <td>{item.kode}</td>
                      <td style={{ fontWeight: 600 }}>{item.nama}</td>
                      <td style={{ fontWeight: 700, color: item.stok <= item.min ? 'var(--accent-red)' : 'inherit' }}>{item.stok}</td>
                      <td>{item.min}</td>
                      <td>{item.satuan}</td>
                      <td>{item.gudang}</td>
                      <td><span className={`status-badge ${status.class}`}>{status.text}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-small" onClick={() => handleOpenModal(item)}>Edit</button>
                          <button className="btn btn-small btn-danger" onClick={() => handleDelete(item.id)}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal active" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-card" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{isEdit ? 'Edit Data Material / Stok' : 'Tambah Data Material Baru'}</h3>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form className="modal-body" onSubmit={handleSave}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Part Number / Kode</label>
                  <input type="text" required value={form.kode} onChange={(e) => setForm({...form, kode: e.target.value})} placeholder="PN-001" />
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Nama Material</label>
                  <input type="text" required value={form.nama} onChange={(e) => setForm({...form, nama: e.target.value})} placeholder="Semen Portland 50kg" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Kuantitas Stok</label>
                  <input type="number" required min="0" step="any" value={form.stok} onChange={(e) => setForm({...form, stok: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Batas Minimum</label>
                  <input type="number" required min="0" step="any" value={form.min} onChange={(e) => setForm({...form, min: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Satuan</label>
                  <input type="text" required value={form.satuan} onChange={(e) => setForm({...form, satuan: e.target.value})} placeholder="Zak, m3, Kg" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Lokasi Gudang</label>
                  <input type="text" value={form.gudang} onChange={(e) => setForm({...form, gudang: e.target.value})} placeholder="Gudang Utama A" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Material</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
