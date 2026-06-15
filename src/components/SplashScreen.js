"use client";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // Update time
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID") + " WIB");
      setCurrentDate(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }, 1000);

    // Simulate loading progress
    let p = 0;
    const progressInterval = setInterval(() => {
      p += Math.floor(Math.random() * 15) + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(progressInterval);
        setShowButton(true);
      }
      setProgress(p);
    }, 150);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div id="splash-screen" className="splash-container" style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'var(--bg-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glow-bg">
        <div className="glow-circle glow-circle-1"></div>
        <div className="glow-circle glow-circle-2"></div>
      </div>

      <div className="splash-card" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <div className="splash-icon-box" style={{ background: "transparent", boxShadow: "none", width: "120px", height: "120px", margin: '0 auto 20px auto' }}>
          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--accent-blue)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{color: 'white', fontWeight: 'bold', fontSize: '32px'}}>ABS</span>
          </div>
        </div>
        <h1 className="splash-title" style={{ fontWeight: 800, textTransform: "uppercase", color: 'white' }}>PT. ARTA BUMI SAKTI</h1>
        <p className="splash-subtitle" style={{ color: "var(--accent-orange)", fontSize: "1rem" }}>CIVIL & CONSTRUCTION</p>
        
        <div className="divider" style={{ margin: '20px 0' }}></div>
        
        <div className="welcome-box" style={{ marginBottom: '30px' }}>
          <h2 className="welcome-greeting" style={{ fontSize: '1.5rem', color: 'white', marginBottom: '10px' }}>Selamat Datang</h2>
          <p className="welcome-date" style={{ color: 'var(--text-secondary)' }}>{currentDate || "Memuat Tanggal..."}</p>
          <p className="welcome-time" style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 600 }}>{currentTime || "00:00:00 WIB"}</p>
        </div>
        
        <div className="loader-container" style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
          <div className="loader-bar" style={{ height: '100%', background: 'var(--accent-blue)', width: `${progress}%`, transition: 'width 0.2s ease' }}></div>
        </div>
        
        <button 
          className="btn btn-primary btn-enter" 
          onClick={onComplete}
          style={{ 
            opacity: showButton ? 1 : 0, 
            pointerEvents: showButton ? 'auto' : 'none',
            transform: showButton ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.3s ease',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>Masuk ke Dashboard</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
