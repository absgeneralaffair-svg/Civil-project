"use client";
import { useEffect, useState } from "react";
import { Filter, CalendarClock, Menu } from "lucide-react";

export default function TopBar({ title, subtitle, selectedYear, setSelectedYear, onMenuClick }) {
  const [currentTime, setCurrentTime] = useState("--:--:--");
  const [currentDate, setCurrentDate] = useState("Memuat tanggal...");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID"));
      setCurrentDate(
        now.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric"
        }).replace(",", "")
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="top-bar">
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <button 
          className="mobile-menu-btn" 
          onClick={onMenuClick}
          style={{ background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", padding: "5px" }}
        >
          <Menu size={24} />
        </button>
        <div className="page-title-section">
          <h2>{title}</h2>
          <p className="tab-subtitle">{subtitle}</p>
        </div>
      </div>
      
      <div className="top-bar-actions" style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {/* Global Dashboard Filter */}
        <div className="global-filter" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label htmlFor="dashboard-year-filter" style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
            <Filter size={14} /> Tahun:
          </label>
          <select 
             id="dashboard-year-filter" 
             value={selectedYear} 
             onChange={(e) => setSelectedYear && setSelectedYear(e.target.value)}
             style={{ padding: "6px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-light)", outline: "none", cursor: "pointer" }}
          >
            <option value="all" style={{ color: "black" }}>Semua Waktu</option>
            <option value="2026" style={{ color: "black" }}>2026</option>
            <option value="2025" style={{ color: "black" }}>2025</option>
            <option value="2024" style={{ color: "black" }}>2024</option>
          </select>
        </div>

        {/* Network Sync Indicator */}
        <div className="sync-status-card" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 15px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s ease" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 10px var(--accent-green)", transition: "all 0.3s ease" }}></div>
          <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)", transition: "all 0.3s ease" }}>Online - Tersinkron</span>
        </div>

        <div className="live-clock-card premium-clock">
          <div className="clock-icon-wrapper">
            <CalendarClock size={24} color="white" />
          </div>
          <div className="clock-details">
            <span className="time-text-large">{currentTime}</span>
            <span className="date-text-full">{currentDate}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
