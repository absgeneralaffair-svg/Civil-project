import { toast } from "react-hot-toast";

export const customConfirm = (message, onConfirm) => {
  toast((t) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{message}</span>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button 
          className="btn btn-small" 
          onClick={() => toast.dismiss(t.id)}
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          Batal
        </button>
        <button 
          className="btn btn-small btn-danger" 
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
        >
          Ya, Hapus
        </button>
      </div>
    </div>
  ), { 
    duration: Infinity, 
    style: { border: '1px solid var(--accent-red)' }
  });
};
