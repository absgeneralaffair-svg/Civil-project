"use client";
import React, { useState } from "react";
import { FileSpreadsheet, Plus, CheckCircle, Clock, Search } from "lucide-react";
import { addItem, updateItem, deleteItem } from "@/lib/db";
import { customConfirm } from "@/lib/confirm";
import { toast } from "react-hot-toast";
import { exportToExcel } from "@/lib/exportUtils";

export default function OrderTab({ orders, loading, refreshData, saveData, allData }) {
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [form, setForm] = useState({ id: "", tanggal: "", mr: "", pr: "", partnumber: "", nama: "", qty: 0, satuan: "", keperluan: "", remark: "", status: "Pending" });

  const handleOpenModal = (item = null) => {
    if (item) { setForm({ ...item, status: item.status || "Pending" }); setIsEdit(true); }
    else { setForm({ id: "", tanggal: new Date().toISOString().split('T')[0], mr: "", pr: "", partnumber: "", nama: "", qty: 0, satuan: "", keperluan: "", remark: "", status: "Pending" }); setIsEdit(false); }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = { tanggal: form.tanggal, mr: form.mr, pr: form.pr, partnumber: form.partnumber, nama: form.nama, qty: Number(form.qty), satuan: form.satuan, keperluan: form.keperluan, remark: form.remark, status: form.status };
    try {
      if (isEdit) {
        await updateItem("ordersData", form.id, data);
      } else {
        await addItem("ordersData", data);
      }
      saveData(); // to show toast
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data!");
    }
  };

  const handleDelete = async (id) => {
    customConfirm("Hapus order ini?", async () => {
      try {
        await deleteItem("ordersData", id);
        saveData(); // to show toast
        toast.success("Order dihapus.");
      } catch (err) {
        console.error(err);
        toast.error("Gagal menghapus data!");
      }
    });
  };

  // Dynamic Status Calculation & Search Filter
  const barangMasuk = allData.barangMasuk || [];
  
  const processedOrders = orders.map(item => {
    // Cari semua barang masuk yang merujuk ke order ini
    const relatedBM = barangMasuk.filter(bm => bm.orderId === item.id);
    const totalReceived = relatedBM.reduce((sum, bm) => sum + Number(bm.jumlah || 0), 0);
    
    let calcStatus = "Belum Supply";
    if (totalReceived > 0) {
      if (totalReceived >= Number(item.qty)) {
        calcStatus = "Completed";
      } else {
        calcStatus = "Partial";
      }
    }
    
    return { ...item, calcStatus, totalReceived };
  }).filter(item => {
    if (statusFilter !== "All" && item.calcStatus !== statusFilter) return false;
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (item.nama || "").toLowerCase().includes(s) || 
           (item.partnumber || "").toLowerCase().includes(s) || 
           (item.mr || "").toLowerCase().includes(s) || 
           (item.pr || "").toLowerCase().includes(s);
  });

  const handleExportExcel = () => {
    const columns = [
      { header: "Tanggal", key: "tanggal", width: 15 },
      { header: "No. MR", key: "mr", width: 15 },
      { header: "No. PR", key: "pr", width: 15 },
      { header: "Part Number", key: "partnumber", width: 15 },
      { header: "Nama Material", key: "nama", width: 30 },
      { header: "Qty", key: "qty", width: 10 },
      { header: "Satuan", key: "satuan", width: 10 },
      { header: "Keperluan", key: "keperluan", width: 25 },
      { header: "Status", key: "calcStatus", width: 15 },
      { header: "Remark", key: "remark", width: 20 },
    ];
    exportToExcel(processedOrders, columns, "Data_Order_Material");
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
                placeholder="Cari order..." 
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
              <option value="Belum Supply">Belum Supply</option>
              <option value="Partial">Partial</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary" title="Export data ke Excel (xls)" onClick={handleExportExcel}>
              <FileSpreadsheet size={16} style={{ marginRight: '8px' }} /> Export Excel
            </button>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={16} style={{ marginRight: '8px' }} /> Tambah Order Barang
            </button>
          </div>
        </div>

        <div className="table-container" style={{ marginTop: "20px" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>No. MR</th>
                <th>No. PR</th>
                <th>Part Number</th>
                <th>Nama Material</th>
                <th>Qty</th>
                <th>Satuan</th>
                <th>Keperluan</th>
                <th>Status</th>
                <th>Remark</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Memuat data order...</td></tr>
              ) : processedOrders.length === 0 ? (
                <tr><td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Data tidak ditemukan.</td></tr>
              ) : (
                processedOrders.map(item => (
                  <tr key={item.id}>
                    <td>{item.tanggal}</td>
                    <td>{item.mr || '-'}</td>
                    <td>{item.pr || '-'}</td>
                    <td>{item.partnumber || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{item.nama}</td>
                    <td>{item.qty}</td>
                    <td>{item.satuan}</td>
                    <td>{item.keperluan || '-'}</td>
                    <td>
                      <span className={`badge badge-${item.calcStatus === 'Completed' ? 'green' : item.calcStatus === 'Partial' ? 'blue' : 'orange'}`}>
                        {item.calcStatus}
                      </span>
                      {item.calcStatus === 'Partial' && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Diterima: {item.totalReceived}</div>}
                    </td>
                    <td>{item.remark || '-'}</td>
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
          <div className="modal-content glass-card" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{isEdit ? 'Edit Order Barang' : 'Catat Order Barang'}</h3>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form className="modal-body" onSubmit={handleSave}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tanggal</label>
                  <input type="date" required value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Part Number</label>
                  <input type="text" value={form.partnumber} onChange={(e) => {
                    const val = e.target.value;
                    const mat = (allData.stok || []).find(m => m.kode === val);
                    if (mat) {
                       setForm({...form, partnumber: val, nama: mat.nama, satuan: mat.satuan || form.satuan});
                    } else {
                       const pastOrder = orders.find(o => o.partnumber === val && o.nama);
                       if (pastOrder) {
                           setForm({...form, partnumber: val, nama: pastOrder.nama, satuan: pastOrder.satuan || form.satuan});
                       } else {
                           setForm({...form, partnumber: val});
                       }
                    }
                  }} placeholder="PN-001" />
                </div>
              </div>
              <div className="form-group">
                <label>Nama Material</label>
                <input type="text" required value={form.nama} onChange={(e) => setForm({...form, nama: e.target.value})} placeholder="Contoh: Semen Portland" />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>No. MR</label>
                  <input type="text" value={form.mr} onChange={(e) => setForm({...form, mr: e.target.value})} placeholder="MR-2026-001" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>No. PR</label>
                  <input type="text" value={form.pr} onChange={(e) => setForm({...form, pr: e.target.value})} placeholder="PR-2026-001" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Jumlah (Qty)</label>
                  <input type="number" required min="0" step="any" value={form.qty} onChange={(e) => setForm({...form, qty: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Satuan</label>
                  <input type="text" required value={form.satuan} onChange={(e) => setForm({...form, satuan: e.target.value})} placeholder="Zak, Kg, m3" />
                </div>
              </div>
              <div className="form-group">
                <label>Keperluan</label>
                <select 
                  required 
                  value={form.keperluan} 
                  onChange={(e) => setForm({...form, keperluan: e.target.value})} 
                >
                  <option value="">-- Pilih Keperluan (Fase Pekerjaan) --</option>
                  {(allData.fases || []).map(fase => (
                     <option key={fase.id} value={fase.nama}>{fase.nama}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Status Order</label>
                  <input 
                    type="text" 
                    list="status-list" 
                    value={form.status} 
                    onChange={(e) => setForm({...form, status: e.target.value})} 
                    placeholder="Ketik/Pilih Status..."
                  />
                  <datalist id="status-list">
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial (Sebagian)</option>
                    <option value="Completed">Completed / Terpenuhi</option>
                  </datalist>
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Remark / Keterangan</label>
                  <input type="text" value={form.remark} onChange={(e) => setForm({...form, remark: e.target.value})} placeholder="Segera diproses" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
