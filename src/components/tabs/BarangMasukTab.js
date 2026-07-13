"use client";
import React, { useState } from "react";
import { FileSpreadsheet, Plus, PackageCheck, Boxes, Search, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { customConfirm } from "@/lib/confirm";
import { updateItem, addItem, addBarangMasukTransaction, updateBarangMasukTransaction, deleteBarangMasukTransaction } from "@/lib/db";
import { exportToExcel } from "@/lib/exportUtils";

export default function BarangMasukTab({ masukLogs, materials, loading, refreshData, saveData, allData }) {
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
            maxHeight: '300px',
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
  const [monthFilter, setMonthFilter] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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

  const pendingOrders = (allData.ordersData || []).filter(o => {
    const relatedBM = (allData.barangMasuk || []).filter(bm => bm.orderId === o.id);
    const totalReceived = relatedBM.reduce((sum, bm) => sum + Number(bm.jumlah || 0), 0);
    return totalReceived < Number(o.qty);
  });
  const [selectedOrder, setSelectedOrder] = useState("");


  const handleSave = async (e) => {
    e.preventDefault();

    const targetOrderId = form.orderId || selectedOrder;
    if (!targetOrderId) {
        toast.error("Silakan pilih Order Barang terlebih dahulu!");
        return;
    }
    
    const orderData = allData.ordersData.find(o => o.id === targetOrderId);
    if (!orderData) {
        toast.error("Data order tidak ditemukan!");
        return;
    }

    let finalMaterialId = form.materialId;

    if (!isEdit && !finalMaterialId) {
       const existingMat = materials.find(m => m.kode === orderData.partnumber || m.nama === orderData.nama);
       if (existingMat) {
           finalMaterialId = existingMat.id;
       } else {
           const newMatData = {
              kode: orderData.partnumber || `PN-${Date.now().toString().slice(-6)}`,
              nama: orderData.nama || "Material Baru",
              stok: 0,
              min: 0,
              satuan: orderData.satuan || "Unit",
              gudang: "Gudang Utama"
           };
           try {
               finalMaterialId = await addItem("stok", newMatData);
           } catch (err) {
               toast.error("Gagal membuat data stok otomatis!");
               return;
           }
       }
    }

    if (!finalMaterialId) {
       toast.error("Error: Material ID gagal diidentifikasi!");
       return;
    }

    const data = { tanggal: form.tanggal, materialId: finalMaterialId, orderId: targetOrderId, jumlah: Number(form.jumlah), mr: form.mr, pr: form.pr, keperluan: form.keperluan };
    
    setIsSaving(true);
    const toastId = toast.loading("Memproses penyimpanan...");

    try {
      if (isEdit) {
        const oldLog = masukLogs.find(l => l.id === form.id);
        const oldJumlah = oldLog ? Number(oldLog.jumlah) : 0;
        const oldMaterialId = oldLog ? oldLog.materialId : null;
        await updateBarangMasukTransaction(form.id, oldMaterialId, oldJumlah, data);
      } else {
        await addBarangMasukTransaction(data);
      }

      if (targetOrderId && !isEdit) {
        if (orderData) {
            const newStatus = Number(form.jumlah) >= Number(orderData.qty) ? "Selesai" : "Partial";
            await updateItem("ordersData", targetOrderId, { status: newStatus });
        }
      }

      saveData();
      setShowModal(false);
      toast.success("Data penerimaan berhasil dicatat!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan data!", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (item) => {
    customConfirm("Hapus catatan barang masuk ini?", async () => {
      const toastId = toast.loading("Menghapus catatan...");
      try {
        await deleteBarangMasukTransaction(item.id, item.materialId, item.jumlah);
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
  const getMaterialKode = (matId) => materials.find(m => m.id === matId)?.kode || '-';
  const getMaterialSatuan = (matId) => materials.find(m => m.id === matId)?.satuan || '-';

  const totalTransaksi = masukLogs.length;
  const totalKuantitas = masukLogs.reduce((sum, m) => sum + (Number(m.jumlah) || 0), 0);

  // Search logic
  const filteredLogs = masukLogs.filter(item => {
    if (monthFilter) {
      if (!item.tanggal) return false;
      if (!item.tanggal.startsWith(monthFilter)) return false;
    }
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    const matName = getMaterialName(item.materialId).toLowerCase();
    const matKode = getMaterialKode(item.materialId).toLowerCase();
    return matName.includes(s) || matKode.includes(s) || (item.mr || "").toLowerCase().includes(s) || (item.pr || "").toLowerCase().includes(s);
  });

  const handleExportExcel = () => {
    const columns = [
      { header: "Tanggal Masuk", key: "tanggal", width: 15 },
      { header: "No. MR", key: "mr", width: 15 },
      { header: "No. PR", key: "pr", width: 15 },
      { header: "Part Number", accessor: (row) => getMaterialKode(row.materialId), width: 15 },
      { header: "Nama Material", accessor: (row) => getMaterialName(row.materialId), width: 30 },
      { header: "Jumlah Masuk", key: "jumlah", width: 15 },
      { header: "Satuan", accessor: (row) => getMaterialSatuan(row.materialId), width: 10 },
      { header: "Keperluan", key: "keperluan", width: 30 },
    ];
    exportToExcel(filteredLogs, columns, "Data_Barang_Masuk");
  };

  const orderOptions = pendingOrders.map(o => ({
    value: o.id,
    label: `${o.partnumber ? o.partnumber + ' - ' : ''}${o.nama} (Order: ${o.qty}) - MR/PR: ${o.mr||o.pr||'-'}`
  }));

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
                placeholder="Cari barang masuk..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <button className="btn-clear-search" onClick={() => setSearchTerm("")}>✕ Hapus Pencarian</button>}
            </div>
            <input 
              type="month" 
              className="input-search" 
              style={{ paddingLeft: '15px', paddingRight: '15px', width: 'auto', backgroundColor: 'var(--input-bg)' }} 
              value={monthFilter} 
              onChange={e => setMonthFilter(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary" title="Export data ke Excel" onClick={handleExportExcel}>
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
          <div className="modal-content glass-card" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>{isEdit ? 'Edit Barang Masuk' : 'Catat Penerimaan Barang'}</h3>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form className="modal-body" onSubmit={handleSave} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>1. Cari & Pilih Order Barang</label>
                <SearchableSelect 
                  options={orderOptions}
                  value={form.orderId || selectedOrder}
                  onChange={(val) => {
                    setSelectedOrder(val);
                    const order = pendingOrders.find(o => o.id === val);
                    if (order) {
                        const mat = materials.find(m => m.kode === order.partnumber || m.nama === order.nama);
                        setForm(prev => ({
                            ...prev, 
                            orderInput: val,
                            materialNameInput: mat ? `[${mat.kode}] ${mat.nama}` : order.nama, 
                            materialId: mat ? mat.id : "", 
                            orderId: val,
                            mr: order.mr || "", 
                            pr: order.pr || "", 
                            jumlahOrder: order.qty,
                            jumlah: order.qty, 
                            keperluan: order.keperluan || ""
                        }));
                    } else {
                        setSelectedOrder("");
                        setForm(prev => ({...prev, jumlahOrder: 0, orderId: ""}));
                    }
                  }}
                  disabled={isEdit}
                  placeholder="Ketik part number / nama material / No MR / PR..."
                />
                <small style={{ color: 'var(--text-muted)' }}>*Memilih order akan mengupdate status order otomatis.</small>
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
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
