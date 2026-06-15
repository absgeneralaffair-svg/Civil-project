"use client";
import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-screen" className="login-container" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--bg-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glow-bg">
        <div className="glow-circle glow-circle-1"></div>
        <div className="glow-circle glow-circle-2"></div>
        <div className="glow-circle glow-circle-3"></div>
      </div>
      
      <div className="login-card" style={{ position: 'relative', zIndex: 10 }}>
        <div className="login-icon-box" style={{ background: "transparent", boxShadow: "none", width: "100px", height: "100px", margin: '0 auto 20px auto' }}>
          <img src="/logo.png" alt="ABS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h1 className="login-title" style={{ fontWeight: 800, textTransform: "uppercase", textAlign: 'center', color: 'white' }}>PT. ARTA BUMI SAKTI</h1>
        <p className="login-subtitle" style={{ color: "var(--accent-orange)", fontSize: "0.85rem", textAlign: 'center', marginBottom: '20px' }}>CIVIL & CONSTRUCTION</p>
        
        <div className="divider"></div>
        
        <form id="form-login" className="login-form" onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="login-email">Email Akses</label>
            <input 
              type="email" 
              id="login-email" 
              required 
              placeholder="Masukkan email..." 
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(false); }}
              style={{ width: '100%', borderColor: error ? 'var(--accent-red)' : '' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="login-password">Kata Sandi Akses</label>
            <div className="password-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                id="login-password" 
                required 
                placeholder="Masukkan kata sandi..." 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                style={{ width: '100%', paddingRight: '40px', borderColor: error ? 'var(--accent-red)' : '' }}
              />
              <button 
                type="button" 
                className="btn-toggle-password" 
                title="Lihat/Sembunyikan Sandi"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <span style={{color: 'var(--accent-red)', fontSize: '0.8rem', marginTop: '5px', display: 'block'}}>Kredensial tidak valid atau salah!</span>}
            <span className="input-helper">Hanya user terdaftar di sistem.</span>
          </div>
          
          <button type="submit" disabled={loading} className="btn btn-primary btn-login" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <span>{loading ? "Memverifikasi..." : "Masuk Aplikasi"}</span>
            <LogIn size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
