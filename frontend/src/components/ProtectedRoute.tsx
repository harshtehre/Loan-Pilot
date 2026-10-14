import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const demoMode = import.meta.env.VITE_DEMO_MODE !== 'false';
  const [loading, setLoading] = useState(Boolean(supabase) && !demoMode);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!supabase || demoMode) {
      setLoading(false);
      setOk(demoMode);
      return;
    }
    let active = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setOk(!error && Boolean(data.session));
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setOk(Boolean(session));
      setLoading(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [demoMode]);

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text-dim)' }}>Loading secure workspace…</div>;
  return ok ? <>{children}</> : <Navigate to="/login" replace />;
}
