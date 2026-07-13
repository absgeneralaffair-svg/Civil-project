"use client";
import React, { useState } from "react";
import { X, Key, UserPlus, Eye, EyeOff } from "lucide-react";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "react-hot-toast";

// Firebase config for secondary app (to avoid logging out the current user)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

export function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Kata sandi baru dan konfirmasi tidak cocok.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Kata sandi baru minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Tidak ada user yang login.");

      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      toast.success("Kata sandi berhasil diubah!");
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Kata sandi saat ini salah.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Terlalu banyak percobaan. Coba lagi nanti.");
      } else {
        setError("Gagal mengubah kata sandi: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active" style={{ zIndex: 9999 }}>
      <div className="modal-content glass-card" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} /> Ubah Kata Sandi
          </h3>
          <button type="button" className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {error && <div style={{ color: 'var(--accent-red)', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Kata Sandi Saat Ini</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showCurrent ? "text" : "password"} 
                  required 
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Kata Sandi Baru</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showNew ? "text" : "password"} 
                  required 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Konfirmasi Kata Sandi Baru</label>
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AddAccountModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      // Use secondary app to prevent signing out the current user
      const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp" + Date.now());
      const secondaryAuth = getAuth(secondaryApp);

      await createUserWithEmailAndPassword(secondaryAuth, email, password);
      
      // Sign out the new user from secondary app immediately
      await secondaryAuth.signOut();

      toast.success("Akun baru berhasil ditambahkan!");
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email sudah terdaftar.");
      } else {
        setError("Gagal menambahkan akun: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active" style={{ zIndex: 9999 }}>
      <div className="modal-content glass-card" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} /> Tambah Akun Baru
          </h3>
          <button type="button" className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {error && <div style={{ color: 'var(--accent-red)', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Email Akses</label>
              <input 
                type="email" 
                required 
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Kata Sandi</label>
              <input 
                type="password" 
                required 
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Menambahkan..." : "Tambah Akun"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
