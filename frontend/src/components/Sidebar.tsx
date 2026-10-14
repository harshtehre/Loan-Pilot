import { NavLink, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

const NAV_ITEMS = [
  { to: '/app/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/app/applications', label: 'Applications', icon: '📋' },
  { to: '/app/products', label: 'Loan Products', icon: '🎯' },
  { to: '/app/analytics', label: 'Analytics', icon: '📈' },
  { to: '/app/emi', label: 'EMI Calculator', icon: '🧮' },
  { to: '/app/reports', label: 'Reports', icon: '📄' },
  { to: '/app/team', label: 'Team', icon: '👥' },
  { to: '/app/audit', label: 'Audit Log', icon: '🕓' },
  { to: '/app/billing', label: 'Billing', icon: '💳' },
  { to: '/app/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const toast = useToast();
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
    <aside className="app-sidebar w-64 flex-shrink-0 flex flex-col overflow-y-auto"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
      <div className="h-16 flex items-center gap-2.5 px-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="7" fill="#4F46E5" />
          <path d="M7 15.5L10.2 11L13 13.5L17 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="display font-semibold text-[15px]">LoanPilot AI</span>
      </div>
      <nav className="p-3 flex-1 space-y-0.5" aria-label="Main navigation">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span aria-hidden="true">{item.icon}</span> <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="card p-3 mb-3 plan-card" style={{ background: 'var(--surface-2)', borderColor: 'transparent' }}>
          <div className="text-xs font-semibold mb-1">Organization workspace</div>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Manage your loan applications, products and team access.</p>
        </div>
        <button type="button" className="nav-item w-full text-left" onClick={() => void logout()}><span>🚪</span> Log out</button>
      </div>
    </aside>
  );
}
