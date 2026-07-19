"use client";
import { 
  LayoutDashboard, 
  Activity, 
  Calculator, 
  ShoppingCart, 
  PackageMinus, 
  PackagePlus, 
  Boxes,
  Key,
  UserPlus,
  LogOut,
  X
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, onLogout, currentUser, onOpenPasswordModal, onOpenAddAccountModal, isOpen, onClose }) {
  const navItems = [
    { id: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { id: "progres", icon: <Activity size={18} />, label: "Progres Project" },
    { id: "listPekerjaan", icon: <Calculator size={18} />, label: "List Pekerjaan" },
    { id: "order", icon: <ShoppingCart size={18} />, label: "Order Material" },
    { id: "penggunaan", icon: <PackageMinus size={18} />, label: "Barang Keluar" },
    { id: "masuk", icon: <PackagePlus size={18} />, label: "Barang Masuk" },
    { id: "stok", icon: <Boxes size={18} />, label: "Stok Material" }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 95 }}></div>}
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
            <div className="logo-box" style={{ background: "transparent", boxShadow: "none", width: "50px", height: "50px", padding: 0 }}>
              <img src="/logo.png" alt="ABS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div className="brand-info">
              <span className="brand-name" style={{ fontWeight: 800, textTransform: "uppercase" }}>PT. ARTA BUMI SAKTI</span>
              <span className="brand-type" style={{ color: "var(--accent-orange)", fontSize: "0.75rem" }}>CIVIL & CONSTRUCTION</span>
            </div>
          </div>
          <button className="mobile-close-btn" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button 
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile" style={{ marginBottom: '16px' }}>
          <div className="user-avatar">
            <span>AS</span>
          </div>
          <div className="user-details">
            <span className="user-name" style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{currentUser?.email || "Admin Project"}</span>
            <span className="user-role">Site Engineer</span>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={onOpenAddAccountModal} style={{ width: '100%', marginBottom: '8px', justifyContent: 'center', display: 'flex', gap: '8px' }}>
          <UserPlus size={16} /> Tambah Akun Baru
        </button>

        <button className="btn btn-secondary" onClick={onOpenPasswordModal} style={{ width: '100%', marginBottom: '8px', justifyContent: 'center', display: 'flex', gap: '8px' }}>
          <Key size={16} /> Ubah Kata Sandi
        </button>

        <button 
          onClick={onLogout}
          className="btn btn-secondary" 
          style={{ width: '100%', marginBottom: '16px', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5', justifyContent: 'center', display: 'flex', gap: '8px' }}
        >
          <LogOut size={16} /> Keluar Aplikasi
        </button>
        
        <div className="copyright-box">
          <div className="copyright-text">
            &copy; 2026 HRGA Management
          </div>
          <div className="version-badge" title="Pembaruan Sistem v2.7.0">
            <span className="pulse-dot"></span> v2.7.0
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
