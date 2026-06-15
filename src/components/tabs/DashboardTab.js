"use client";
import { Layers, List, Percent, AlertTriangle, Clock, CheckCircle2, PlayCircle, AlertCircle, X } from "lucide-react";
import React, { useState } from "react";

function analyzeDateSchedule(jadwalMulai, jadwalSelesai, aktualMulai, aktualSelesai, progress) {
    let statusText = 'Belum Mulai';
    let isDelayed = false;
    let badgeClass = 'badge-gray';

    const now = new Date();
    const hasJadwal = jadwalMulai && jadwalSelesai;
    const jMulai = hasJadwal ? new Date(jadwalMulai) : null;
    const jSelesai = hasJadwal ? new Date(jadwalSelesai) : null;

    if (progress >= 100) {
        statusText = 'Selesai';
        badgeClass = 'badge-green';
        if (hasJadwal && now > jSelesai && !aktualSelesai) {
            statusText = 'Selesai (Terlambat)';
            isDelayed = true;
            badgeClass = 'badge-orange';
        } else if (hasJadwal) {
            statusText = 'Selesai (Sesuai)';
        }
    } else if (progress > 0) {
        statusText = 'Berjalan';
        badgeClass = 'badge-blue';
        if (hasJadwal && now > jSelesai) {
            statusText = 'Berjalan (Terlambat)';
            isDelayed = true;
            badgeClass = 'badge-orange';
        } else if (hasJadwal) {
            statusText = 'Berjalan (On-Track)';
        }
    } else {
        if (hasJadwal && now > jMulai) {
            statusText = 'Belum Mulai (Terlambat)';
            isDelayed = true;
            badgeClass = 'badge-red';
        }
    }
    return { statusText, isDelayed, badgeClass };
}

const ProgressBar = ({ value, color = "var(--primary-color)" }) => (
  <div style={{ width: "100%", background: "rgba(255,255,255,0.1)", borderRadius: "4px", height: "18px", position: "relative", overflow: "hidden" }}>
    <div style={{ width: `${value || 0}%`, background: color, height: "100%", transition: "width 0.3s ease" }}></div>
    <span style={{ position: "absolute", width: "100%", textAlign: "center", top: "1px", left: 0, fontSize: "0.7rem", color: "#fff", fontWeight: "bold", textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>
      {Number(value || 0).toFixed(1)}%
    </span>
  </div>
);

export default function DashboardTab({ projects, subPekerjaan, rabs, materials, penggunaanLogs, loading, selectedYear }) {
  const [modalData, setModalData] = useState(null);
  
  // Filter projects by selectedYear
  const filteredProjects = projects.filter(p => {
    if (!selectedYear || selectedYear === "all") return true;
    const m = p.mulai || "";
    const s = p.selesai || "";
    return m.startsWith(selectedYear) || s.startsWith(selectedYear);
  });

  const totalProyek = filteredProjects.length;
  
  let avgProgres = 0;
  if (totalProyek > 0) {
    avgProgres = (filteredProjects.reduce((sum, f) => sum + (Number(f.progres) || 0), 0) / totalProyek).toFixed(1);
  }

  // Analisis Jadwal
  let delayedCount = 0;
  let ongoingCount = 0;
  let completedCount = 0;
  let notStartedCount = 0;

  const analyzedProjects = filteredProjects.map(p => {
      const schedule = analyzeDateSchedule(p.mulai, p.selesai, null, null, p.progres); // using null for actual since fase doesn't have it directly or we use logic
      if (schedule.statusText.includes("Terlambat")) delayedCount++;
      if (schedule.statusText.includes("Selesai")) completedCount++;
      if (schedule.statusText.includes("Berjalan")) ongoingCount++;
      if (schedule.statusText.includes("Belum Mulai")) notStartedCount++;
      return { ...p, schedule };
  });

  const delayedProjects = analyzedProjects.filter(p => p.schedule.isDelayed && !p.schedule.statusText.includes("Selesai"));
  const activeProjects = analyzedProjects.filter(p => p.schedule.statusText.includes("Berjalan") && !p.schedule.isDelayed);
  const completedProjects = analyzedProjects.filter(p => p.schedule.statusText.includes("Selesai"));
  const notStartedProjects = analyzedProjects.filter(p => p.schedule.statusText.includes("Belum Mulai"));

  const criticalMaterials = materials.filter((m) => (Number(m.stok) || 0) <= (Number(m.min) || 0));

  return (
    <section id="tab-dashboard" className="tab-panel active" style={{ display: 'block', animation: 'fadeIn 0.3s ease', overflowY: 'auto', paddingRight: '10px' }}>
      
      {/* KPI CARDS (Schedule Focused) */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '24px' }}>
        <div className="kpi-card glow-blue" onClick={() => setModalData({ title: "Semua Fase Proyek", data: analyzedProjects })} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
          <div className="kpi-icon-box bg-blue"><Percent size={20} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Progres Proyek Akumulatif</span>
            <h3 className="kpi-value">{loading ? "..." : `${avgProgres}%`}</h3>
            <div className="progress-mini-bar">
              <div className="progress-mini-fill" style={{ width: `${avgProgres}%` }}></div>
            </div>
            <span className="kpi-trend trend-blue" style={{ fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Klik untuk melihat daftar lengkap</span>
          </div>
        </div>

        <div className="kpi-card glow-orange" onClick={() => setModalData({ title: "Fase Terlambat / Kritis", data: delayedProjects })} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
          <div className="kpi-icon-box bg-orange" style={{ background: "rgba(249, 115, 22, 0.2)", color: "#f97316" }}><Clock size={20} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Fase Terlambat</span>
            <h3 className="kpi-value">{loading ? "..." : delayedCount} Fase</h3>
            <span className="kpi-trend trend-orange" style={{ color: delayedCount > 0 ? "#f97316" : "#22c55e", fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
              {delayedCount > 0 ? "Butuh Perhatian Segera!" : "Semua sesuai jadwal"}
            </span>
          </div>
        </div>

        <div className="kpi-card glow-green" onClick={() => setModalData({ title: "Fase Berjalan (On-Track)", data: activeProjects })} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
          <div className="kpi-icon-box bg-green"><PlayCircle size={20} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Fase Berjalan (On-Track)</span>
            <h3 className="kpi-value">{loading ? "..." : activeProjects.length} Fase</h3>
            <span className="kpi-trend trend-blue" style={{ fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Sedang dieksekusi</span>
          </div>
        </div>

        <div className="kpi-card glow-purple" onClick={() => setModalData({ title: "Fase Selesai", data: completedProjects })} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
          <div className="kpi-icon-box bg-purple" style={{ background: "rgba(168, 85, 247, 0.2)", color: "#a855f7" }}><CheckCircle2 size={20} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Fase Selesai</span>
            <h3 className="kpi-value">{loading ? "..." : completedCount} Fase</h3>
            <span className="kpi-trend trend-green" style={{ fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Telah rampung</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* PEKERJAAN TERLAMBAT (CRITICAL) */}
        <div className="glass-card" style={{ borderTop: delayedProjects.length > 0 ? "4px solid var(--accent-red)" : "4px solid var(--card-border)" }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={22} color={delayedProjects.length > 0 ? "var(--accent-red)" : "var(--text-muted)"} />
            <div>
              <h4 className="card-title">Pekerjaan Terlambat / Kritis</h4>
              <p className="card-subtitle">Fase yang tertinggal dari jadwal target (EVM).</p>
            </div>
          </div>
          <div className="table-container" style={{ marginTop: '16px', maxHeight: '350px', overflowY: 'auto' }}>
            <table className="table" style={{ minWidth: "100%" }}>
              <thead>
                <tr>
                  <th>Fase Pekerjaan</th>
                  <th>Jadwal Selesai</th>
                  <th>Target</th>
                  <th>Realisasi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ textAlign: "center" }}>Memuat...</td></tr>
                ) : delayedProjects.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>Bagus! Tidak ada pekerjaan yang terlambat.</td></tr>
                ) : (
                  delayedProjects.map(fase => (
                    <tr key={fase.id} style={{ background: "rgba(239, 68, 68, 0.05)" }}>
                      <td style={{ fontWeight: 600, color: "var(--accent-red)" }}>{fase.nama}</td>
                      <td>{fase.selesai}</td>
                      <td>{fase.target}%</td>
                      <td>
                        <ProgressBar value={fase.progres} color="var(--accent-red)" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PEKERJAAN BERJALAN (ON-TRACK) */}
        <div className="glass-card" style={{ borderTop: "4px solid var(--accent-blue)" }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PlayCircle size={22} color="var(--accent-blue)" />
            <div>
              <h4 className="card-title">Pekerjaan Sedang Berjalan</h4>
              <p className="card-subtitle">Fase yang sedang aktif dikerjakan di lapangan.</p>
            </div>
          </div>
          <div className="table-container" style={{ marginTop: '16px', maxHeight: '350px', overflowY: 'auto' }}>
            <table className="table" style={{ minWidth: "100%" }}>
              <thead>
                <tr>
                  <th>Fase Pekerjaan</th>
                  <th>Jadwal Selesai</th>
                  <th>Realisasi Progres</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" style={{ textAlign: "center" }}>Memuat...</td></tr>
                ) : activeProjects.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>Belum ada pekerjaan yang aktif berjalan.</td></tr>
                ) : (
                  activeProjects.map(fase => (
                    <tr key={fase.id}>
                      <td style={{ fontWeight: 600, color: "var(--accent-blue)" }}>{fase.nama}</td>
                      <td>{fase.selesai}</td>
                      <td>
                        <ProgressBar value={fase.progres} color="var(--accent-blue)" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div className="dashboard-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px", marginTop: "20px" }}>
        {/* PEKERJAAN BELUM MULAI (OPEN) */}
        <div className="glass-card" style={{ borderTop: "4px solid var(--text-muted)" }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <List size={22} color="var(--text-muted)" />
            <div>
              <h4 className="card-title">Pekerjaan Belum Mulai (Open)</h4>
              <p className="card-subtitle">Fase yang belum dikerjakan (0%).</p>
            </div>
          </div>
          <div className="table-container" style={{ marginTop: '16px', maxHeight: '350px', overflowY: 'auto' }}>
            <table className="table" style={{ minWidth: "100%" }}>
              <thead>
                <tr>
                  <th>Fase Pekerjaan</th>
                  <th>Jadwal Mulai</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="2" style={{ textAlign: "center" }}>Memuat...</td></tr>
                ) : notStartedProjects.length === 0 ? (
                  <tr><td colSpan="2" style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>Tidak ada pekerjaan yang belum mulai.</td></tr>
                ) : (
                  notStartedProjects.map(fase => (
                    <tr key={fase.id}>
                      <td style={{ fontWeight: 600 }}>{fase.nama}</td>
                      <td>{fase.mulai || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PEKERJAAN SELESAI (CLOSED) */}
        <div className="glass-card" style={{ borderTop: "4px solid var(--accent-purple, #a855f7)" }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={22} color="var(--accent-purple, #a855f7)" />
            <div>
              <h4 className="card-title">Pekerjaan Selesai (Closed)</h4>
              <p className="card-subtitle">Fase yang telah mencapai progres 100%.</p>
            </div>
          </div>
          <div className="table-container" style={{ marginTop: '16px', maxHeight: '350px', overflowY: 'auto' }}>
            <table className="table" style={{ minWidth: "100%" }}>
              <thead>
                <tr>
                  <th>Fase Pekerjaan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="2" style={{ textAlign: "center" }}>Memuat...</td></tr>
                ) : completedProjects.length === 0 ? (
                  <tr><td colSpan="2" style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>Belum ada pekerjaan yang selesai.</td></tr>
                ) : (
                  completedProjects.map(fase => (
                    <tr key={fase.id}>
                      <td style={{ fontWeight: 600, color: "var(--accent-purple, #a855f7)" }}>{fase.nama}</td>
                      <td><span className={`status-badge ${fase.schedule.badgeClass}`}>{fase.schedule.statusText}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MATERIAL ALERT WIDGET */}
      {criticalMaterials.length > 0 && (
        <div className="glass-card" style={{ marginTop: "24px", borderLeft: "4px solid var(--accent-orange)" }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={22} color="var(--accent-orange)" />
            <div>
              <h4 className="card-title">Peringatan Stok Material</h4>
              <p className="card-subtitle">Material di bawah batas minimum, butuh pemesanan (Order) segera.</p>
            </div>
          </div>
          <div className="table-container" style={{ marginTop: '16px', maxHeight: '350px', overflowY: 'auto' }}>
            <table className="table" style={{ minWidth: "100%" }}>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Stok Tersedia</th>
                  <th>Batas Minimum</th>
                </tr>
              </thead>
              <tbody>
                {criticalMaterials.map(mat => (
                  <tr key={mat.id}>
                    <td style={{ fontWeight: 600 }}>{mat.nama}</td>
                    <td style={{ color: "var(--accent-red)", fontWeight: 700 }}>{mat.stok} {mat.satuan}</td>
                    <td>{mat.min} {mat.satuan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KPI DETAIL MODAL */}
      {modalData && (
        <div className="modal active" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-card" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>{modalData.title}</h3>
              <button type="button" className="btn-close" onClick={() => setModalData(null)}><X size={20} /></button>
            </div>
            <div className="modal-body table-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table className="table" style={{ minWidth: "100%" }}>
                <thead>
                  <tr>
                    <th>Fase Pekerjaan</th>
                    <th>Status Jadwal</th>
                    <th>Jadwal Selesai</th>
                    <th>Target</th>
                    <th>Realisasi</th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.data.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Tidak ada data</td></tr>
                  ) : (
                    modalData.data.map(fase => (
                      <tr key={fase.id}>
                        <td style={{ fontWeight: 600 }}>{fase.nama}</td>
                        <td><span className={`status-badge ${fase.schedule.badgeClass}`}>{fase.schedule.statusText}</span></td>
                        <td>{fase.selesai || '-'}</td>
                        <td>{fase.target}%</td>
                        <td><ProgressBar value={fase.progres} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
               <button className="btn btn-secondary" onClick={() => setModalData(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
