import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJson, putJson } from '../lib/api';
import { useToast } from '../context/ToastContext';

const TABS = ['Business Profile', 'Users & Roles', 'AI Settings', 'Notifications', 'Security', 'API Keys'];
type BusinessType = 'nbfc' | 'fintech_startup' | 'loan_agency' | 'consultant';
type NotificationPreferences = { new_application: boolean; high_risk: boolean };
type SettingsResponse = {
  organization: { id: string; name: string; business_type: BusinessType | null; plan: string };
  settings: { ai_detail: 'concise' | 'standard' | 'detailed'; notification_preferences: NotificationPreferences; updated_at: string };
};

export default function Settings() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const result = await getJson<SettingsResponse>('/settings');
      setData(result);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const save = async (changes: Record<string, unknown>) => {
    setSaving(true);
    try {
      const updated = await putJson<SettingsResponse>('/settings', changes);
      setData(updated);
      toast('Settings saved to your organization.', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card p-8">Loading settings…</div>;
  if (!data) return <div className="card p-8">Settings could not be loaded. Check your API connection and access permissions.</div>;

  const patchProfile = (field: 'name' | 'business_type', value: string) => {
    setData(current => current ? { ...current, organization: { ...current.organization, [field]: value } } : current);
  };
  const patchNotifications = (field: keyof NotificationPreferences, value: boolean) => {
    setData(current => current ? {
      ...current,
      settings: {
        ...current.settings,
        notification_preferences: { ...current.settings.notification_preferences, [field]: value },
      },
    } : current);
  };

  return <div>
    <h1 className="display text-2xl font-semibold mb-5">Settings</h1>
    <div className="flex gap-6 mb-6 flex-wrap">{TABS.map((label, index) => <button type="button" key={label} className={`tab-btn ${tab === index ? 'active' : ''}`} onClick={() => setTab(index)}>{label}</button>)}</div>
    <div className="card p-6 max-w-2xl">
      {tab === 0 && <>
        <label htmlFor="business-name">Business name</label>
        <input id="business-name" value={data.organization.name} onChange={event => patchProfile('name', event.target.value)} className="mb-4" maxLength={120} />
        <label htmlFor="business-type">Business type</label>
        <select id="business-type" value={data.organization.business_type ?? 'fintech_startup'} onChange={event => patchProfile('business_type', event.target.value)} className="mb-4">
          <option value="nbfc">NBFC</option><option value="fintech_startup">Fintech Startup</option><option value="loan_agency">Loan Agency</option><option value="consultant">Independent Consultant</option>
        </select>
        <button className="btn btn-primary" disabled={saving || data.organization.name.trim().length < 2} onClick={() => void save({ organization_name: data.organization.name.trim(), business_type: data.organization.business_type ?? 'fintech_startup' })}>{saving ? 'Saving…' : 'Save business profile'}</button>
      </>}
      {tab === 1 && <>
        <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>Manage team members, invitations, roles and account access in the team workspace.</p>
        <button className="btn btn-ghost" onClick={() => navigate('/app/team')}>Go to Team →</button>
      </>}
      {tab === 2 && <>
        <label htmlFor="ai-detail">AI response detail</label>
        <select id="ai-detail" value={data.settings.ai_detail} onChange={event => setData(current => current ? { ...current, settings: { ...current.settings, ai_detail: event.target.value as SettingsResponse['settings']['ai_detail'] } } : current)} className="mb-4">
          <option value="concise">Concise — brief action steps</option><option value="standard">Standard — balanced explanation</option><option value="detailed">Detailed — structured reasoning and caveats</option>
        </select>
        <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>This preference is used by the backend AI assistant. AI suggestions are decision support only and never guarantee loan approval.</p>
        <button className="btn btn-primary" disabled={saving} onClick={() => void save({ ai_detail: data.settings.ai_detail })}>{saving ? 'Saving…' : 'Save AI settings'}</button>
      </>}
      {tab === 3 && <>
        <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>Choose which in-app alerts are created for your organization. This does not enable email or SMS delivery.</p>
        <label className="flex items-center gap-2 mb-3"><input type="checkbox" checked={data.settings.notification_preferences.new_application} onChange={event => patchNotifications('new_application', event.target.checked)} style={{ width: 'auto' }} /> Alert when a new application is created</label>
        <label className="flex items-center gap-2 mb-4"><input type="checkbox" checked={data.settings.notification_preferences.high_risk} onChange={event => patchNotifications('high_risk', event.target.checked)} style={{ width: 'auto' }} /> Alert when AI analysis flags high risk</label>
        <button className="btn btn-primary" disabled={saving} onClick={() => void save({ notification_preferences: data.settings.notification_preferences })}>{saving ? 'Saving…' : 'Save notification settings'}</button>
      </>}
      {tab === 4 && <>
        <p className="text-sm mb-3" style={{ color: 'var(--text-dim)' }}>Authentication is handled by Supabase Auth. Configure email confirmation, phone OTP, rate limits and any available MFA options in Supabase before inviting real users.</p>
        <p className="text-sm mb-3">Backend endpoints validate Supabase access tokens. Never expose the Supabase service-role key in browser variables.</p>
        <a className="text-sm underline" href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Open Supabase Dashboard ↗</a>
      </>}
      {tab === 5 && <>
        <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>Organization API-key management is not implemented in this release. The API currently authenticates requests using Supabase access tokens.</p>
        <div className="card p-4 text-sm">Provider credentials belong in Render environment variables. Do not paste them into this page or commit them to Git.</div>
      </>}
    </div>
  </div>;
}
