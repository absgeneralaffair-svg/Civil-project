import { toast } from "react-hot-toast";

export const customConfirm = (message, onConfirm) => {
  toast.custom((t) => (
    <div 
      className={`${t.visible ? 'animate-enter' : 'animate-leave'}`}
      style={{
        maxWidth: '450px',
        width: '100%',
        backgroundColor: '#1e293b',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '24px',
        borderTop: '4px solid #ef4444',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ 
          backgroundColor: 'rgba(239, 68, 68, 0.15)', 
          padding: '12px', 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>
            Verifikasi Penghapusan
          </h3>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            {message}
          </p>
          <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#ef4444', fontWeight: 500 }}>
              Peringatan: Tindakan ini permanen dan tidak dapat dibatalkan.
            </p>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button 
          onClick={() => toast.dismiss(t.id)}
          style={{ 
            padding: '10px 20px', 
            borderRadius: '8px', 
            border: '1px solid rgba(255,255,255,0.1)', 
            backgroundColor: 'transparent',
            color: '#e2e8f0',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Batalkan
        </button>
        <button 
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          style={{ 
            padding: '10px 24px', 
            borderRadius: '8px', 
            border: 'none', 
            backgroundColor: '#ef4444',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
            transition: 'background 0.2s, transform 0.1s',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.96)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          Ya, Hapus Data
        </button>
      </div>
    </div>
  ), { 
    id: 'confirm-dialog',
    duration: Infinity, 
    position: 'top-center'
  });
};
