"use client";
import React, { useState } from "react";
import { FileSpreadsheet, Plus, PackageCheck, Boxes, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { customConfirm } from "@/lib/confirm";
import { addItem, updateItem, deleteItem } from "@/lib/db";

export default function BarangMasukTab({ masukLogs, materials, loading, refreshData, saveData, allData }) {
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ id: "", tanggal: "", materialId: "", materialNameInput: "", orderInput: "", orderId: "", jumlahOrder: 0, jumlah: 0, mr: "", pr: "", keperluan: "" });
  const handleOpenModal = (item = null) => {
    if (item) { 
        const mat = materials.find(m => m.id === item.materialId);
        setForm({...item, materialNameInput: mat ? `[${mat.kode}] ${mat.nama}` : "", orderInput: "", jumlahOrder: item.jumlah}); 
        setIsEdit(true); 
    }
    else { 
        setForm({ id: "", tanggal: new Date().toISOString().split('T')[0], materialId: "", materialNameInput: "", orderInput: "", orderId: "", jumlahOrder: 0, jumlah: 0, mr: "", pr: "", keperluan: "" }); 
        setIsEdit(false); 
    }
    setSelectedOrder("");
    setShowModal(true);
  };

  const pendingOrders = (allData.ordersData || []).filter(o => o.status !== "Selesai");
  const [selectedOrder, setSelectedOrder] = useState("");


  const handleSave = async (e) => {
    e.preventDefault();
    const data = { tanggal: form.tanggal, materialId: form.materialId, orderId: form.orderId || selectedOrder || "", jumlah: Number(form.jumlah), mr: form.mr, pr: form.pr, keperluan: form.keperluan };
    
    try {
      if (isEdit) {
        await updateItem("barangMasuk", form.id, data);
      } else {
        await addItem("barangMasuk", data);
      }

      if (selectedOrder && !isEdit) {
        const orderData = pendingOrders.find(o => o.id === selectedOrder);
        if (orderData) {
            const newStatus = Number(form.jumlah) >= Number(orderData.qty) ? "Selesai" : "Partial";
            await updateItem("ordersData", selectedOrder, { status: newStatus });
        }
      }

      saveData();
      setShowModal(false);
      toast.success("Data berhasil disimpan!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan data!");
    }
  };

  const handleDelete = (id) => {
    customConfirm("Hapus catatan barang masuk ini?", async () => {
      try {
        await deleteItem("barangMasuk", id);
        saveData();
        toast.success("Catatan dihapus.");
      } catch (err) {
        console.error(err);
        toast.error("Gagal menghapus data!");
      }
    });
  };

  const getMaterialName = (matId) => materials.find(m => m.id === matId)?.nama || matId || '-';
  const getMaterialKode = (matId) => materials.find(m => m.id === matId)?.kode || '-';
  const getMaterialSatuan = (matId) => materials.find(m => m.id === matId)?.satuan || '';

  const totalTransaksi = masukLogs.length;
  const totalKuantitas = masukLogs.reduce((sum, m) => sum + (Number(m.jumlah) || 0), 0);

  // Search logic
  const filteredLogs = masukLogs.filter(item => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    const matName = getMaterialName(item.materialId).toLowerCase();
    const matKode = getMaterialKode(item.materialId).toLowerCase();
    return matName.includes(s) || matKode.includes(s) || (item.mr || "").toLowerCase().includes(s) || (item.pr || "").toLowerCase().includes(s);
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
                placeholder="Cari barang masuk..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <button className="btn-clear-search" onClick={() => setSearchTerm("")}>✕</button>}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary" title="Export data ke Excel">
              <FileSpreadsheet size={16} style={{ marginRight: '8px' }} /> Export Excel
            </button>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={16} style={{ marginRight: '8px' }} /> Tambah Barang Masuk
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid" style={{ marginTop: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          <div className="kpi-card glow-blue">
            <div className="kpi-icon-box bg-blue"><PackageCheck size={20} /></div>
            <div className="kpi-info">
              <span className="kpi-label">Total Transaksi Masuk</span>
              <h3 className="kpi-value">{totalTransaksi}</h3>
            </div>
          </div>
          <div className="kpi-card glow-green">
            <div className="kpi-icon-box bg-green"><Boxes size={20} /></div>
            <div className="kpi-info">
              <span className="kpi-label">Total Kuantitas Material</span>
              <h3 className="kpi-value">{totalKuantitas.toLocaleString('id-ID')}</h3>
            </div>
          </div>
        </div>

        <div className="table-container" style={{ marginTop: "20px" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal Masuk</th>
                <th>No. MR</th>
                <th>No. PR</th>
                <th>Part Number</th>
                <th>Nama Material</th>
                <th>Jumlah Masuk</th>
                <th>Satuan</th>
                <th>Keperluan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Memuat data...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Data tidak ditemukan.</td></tr>
              ) : (
                [...filteredLogs].sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal)).map(item => (
                  <tr key={item.id}>
                    <td>{item.tanggal}</td>
                    <td>{item.mr || '-'}</td>
                    <td>{item.pr || '-'}</td>
                    <td>{getMaterialKode(item.materialId)}</td>
                    <td style={{ fontWeight: 600 }}>{getMaterialName(item.materialId)}</td>
                    <td>{item.jumlah}</td>
                    <td>{getMaterialSatuan(item.materialId)}</td>
                    <td>{item.keperluan || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-small" onClick={() => handleOpenModal(item)}>Edit</button>
                        <button className="btn btn-small btn-danger" onClick={() => handleDelete(item.id)}>Hapus</button>
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
          <div className="modal-content glass-card" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>{isEdit ? 'Edit Barang Masuk' : 'Catat Penerimaan Barang'}</h3>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form className="modal-body" onSubmit={handleSave} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>1. Cari & Pilih Order Barang</label>
                <input 
                  type="text" 
                  list="order-list" 
                  value={form.orderInput || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({...form, orderInput: val});
                    
                    // Ekstrak ID dari string (format: [ID] - ...)
                    const match = val.match(/^\[(.*?)\]/);
                    if (match) {
                        const oid = match[1];
                        setSelectedOrder(oid);
                        const order = pendingOrders.find(o => o.id === oid);
                        if (order) {
                            const mat = materials.find(m => m.kode === order.partnumber || m.nama === order.nama);
                            setForm(prev => ({
                                ...prev, 
                                materialNameInput: mat ? `[${mat.kode}] ${mat.nama}` : order.nama, 
                                materialId: mat ? mat.id : "", 
                                orderId: oid,
                                mr: order.mr || "", 
                                pr: order.pr || "", 
                                jumlahOrder: order.qty,
                                jumlah: order.qty, 
                                keperluan: order.keperluan || ""
                            }));
                        }
                    } else {
                        setSelectedOrder("");
                        setForm(prev => ({...prev, jumlahOrder: 0, orderId: ""}));
                    }
                  }}
                  disabled={isEdit}
                  placeholder="Ketik nama material / No MR / PR untuk mencari order..."
                />
                <datalist id="order-list">
                  {pendingOrders.map(o => <option key={o.id} value={`[${o.id}] ${o.nama} (Order: ${o.qty}) - MR/PR: ${o.mr||o.pr||'-'}`} />)}
                </datalist>
                <small style={{ color: 'var(--text-muted)' }}>*Memilih order akan mengupdate status order otomatis.</small>
              </div>

              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>2. Cari / Hubungkan dengan Material di Stok Inventaris</label>
                <input 
                  type="text" 
                  list="material-list" 
                  required 
                  value={form.materialNameInput || ""} 
                  onChange={(e) => {
                    const val = e.target.value;
                    const mat = materials.find(m => `[${m.kode}] ${m.nama}` === val);
                    setForm({...form, materialNameInput: val, materialId: mat ? mat.id : ""});
                  }} 
                  placeholder="Ketik nama atau kode material dari daftar stok..." 
                />
                <datalist id="material-list">
                  {materials.map(m => <option key={m.id} value={`[${m.kode}] ${m.nama}`} />)}
                </datalist>
                {!form.materialId && form.materialNameInput && <small style={{ color: 'var(--accent-orange)' }}>Perhatian: Material belum ada di stok utama. Pastikan menambahkannya di menu Stok Material agar tercatat.</small>}
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>No. MR</label>
                  <input type="text" value={form.mr} onChange={(e) => setForm({...form, mr: e.target.value})} placeholder="Pilih MR..." />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>No. PR</label>
                  <input type="text" value={form.pr} onChange={(e) => setForm({...form, pr: e.target.value})} placeholder="Pilih PR..." />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Jumlah Sesuai Order</label>
                  <input type="number" readOnly value={form.jumlahOrder || 0} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Jumlah Aktual Masuk</label>
                  <input type="number" required min="0" step="any" value={form.jumlah} onChange={(e) => setForm({...form, jumlah: e.target.value})} style={{ borderColor: 'var(--accent-blue)' }} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tanggal Penerimaan</label>
                  <input type="date" required value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Keperluan / Keterangan</label>
                <input type="text" value={form.keperluan} onChange={(e) => setForm({...form, keperluan: e.target.value})} placeholder="Keterangan pengiriman / penerimaan" />
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
