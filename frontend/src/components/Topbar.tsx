import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getJson } from '../lib/api';
import { supabase } from '../lib/supabase';
import NotificationPanel from './NotificationPanel';

interface Props { onOpenPalette: () => void; onToggleAi: () => void; }
type WorkspaceSummary = {
  user?: { full_name?: string | null; email?: string | null; role?: string };
  organization?: { name?: string; plan?: string };
};

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard', applications: 'Applications', products: 'Loan Products',
  analytics: 'Analytics', emi: 'EMI Calculator', reports: 'Reports', team: 'Team',
  audit: 'Audit Log', billing: 'Billing', settings: 'Settings',
};

export default function Topbar({ onOpenPalette, onToggleAi }: Props) {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);

  useEffect(() => {
    let active = true;
    void getJson<WorkspaceSummary>('/settings').then(result => { if (active) setWorkspace(result); }).catch(() => {
      // The current page surfaces API failures; avoid showing a duplicate toast from the shared header.
    });
    return () => { active = false; };
  }, []);

  const segments = location.pathname.split('/').filter(Boolean);
  const section = segments[1] || 'dashboard';
  const isDetail = segments[1] === 'applications' && segments[2];
  const crumb = isDetail ? `Application #${segments[2]}` : (LABELS[section] || 'Dashboard');
  const displayName = workspace?.user?.full_name?.trim() || workspace?.user?.email?.split('@')[0] || 'Account';
  const displayRole = (workspace?.user?.role || 'member').replaceAll('_', ' ');
  const organizationName = workspace?.organization?.name || 'Your organization';

  const logout = async () => {
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      navigate('/login');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to log out', 'error');
    }
  };

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 gap-4 relative"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div className="flex items-center gap-2 text-sm min-w-0" style={{ color: 'var(--text-dim)' }}>
        <span className="truncate max-w-40">{organizationName}</span><span>/</span>
        <span style={{ color: 'var(--text)' }} className="font-medium">{crumb}</span>
      </div>
      <div className="flex-1 max-w-md relative hidden md:block">
        <input aria-label="Open search" placeholder="Search applicants, applications… (Ctrl/⌘+K)" onClick={onOpenPalette} readOnly className="cursor-pointer" />
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button type="button" className="btn btn-ghost btn-sm" aria-label="Toggle theme" onClick={toggle}>{theme === 'dark' ? '☀️' : '🌙'}</button>
        <div className="relative">
          <button type="button" className="btn btn-ghost btn-sm relative" aria-label="Notifications" aria-expanded={showNotifs} onClick={() => { setShowNotifs(s => !s); setShowProfile(false); }}>🔔</button>
          {showNotifs && <div className="absolute top-11 right-0 z-40"><NotificationPanel /></div>}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onToggleAi}>✨ Assistant</button>
        <div className="relative">
          <button type="button" aria-label="Account menu" aria-expanded={showProfile} className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0"
            style={{ background: 'var(--color-indigo-500)', color: '#fff' }}
            onClick={() => { setShowProfile(s => !s); setShowNotifs(false); }}>{displayName.charAt(0).toUpperCase()}</button>
          {showProfile && (
            <div className="absolute top-11 right-0 z-40 card p-2 shadow-2xl w-56">
              <div className="px-3 py-2 text-sm">
                <div className="font-semibold truncate">{displayName}</div>
                <div className="text-xs capitalize" style={{ color: 'var(--text-dim)' }}>{displayRole} · {organizationName}</div>
              </div>
              <button type="button" className="nav-item w-full text-left" onClick={() => { navigate('/app/settings'); setShowProfile(false); }}>⚙️ Account settings</button>
              <button type="button" className="nav-item w-full text-left" onClick={() => { navigate('/app/billing'); setShowProfile(false); }}>💳 Billing</button>
              <button type="button" className="nav-item w-full text-left" onClick={() => void logout()}>🚪 Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
