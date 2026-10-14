import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props { open: boolean; onClose: () => void; }

export default function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  if (!open) return null;
  const go = (path: string) => { navigate(path); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-28"
         style={{ background: 'rgba(8,10,20,.55)', backdropFilter: 'blur(2px)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card w-full max-w-xl shadow-2xl overflow-hidden">
        <input ref={inputRef} placeholder="Search applicants, applications, settings…"
               className="border-0 rounded-none" style={{ padding: 16 }} />
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div className="nav-item" style={{ borderRadius: 0, padding: '12px 18px' }} onClick={() => go('/app/dashboard')}>📊 Go to Dashboard</div>
          <div className="nav-item" style={{ borderRadius: 0, padding: '12px 18px' }} onClick={() => go('/app/applications')}>📋 Go to Applications</div>
          <div className="nav-item" style={{ borderRadius: 0, padding: '12px 18px' }} onClick={() => go('/app/applications/LP-2200')}>👤 Ramesh Kulkarni — Application #LP-2200</div>
          <div className="nav-item" style={{ borderRadius: 0, padding: '12px 18px' }} onClick={() => go('/app/emi')}>🧮 Open EMI Calculator</div>
        </div>
      </div>
    </div>
  );
}
