import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

type LoginMode = 'email' | 'phone';

function Shell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  return <div className="fixed inset-0 flex items-center justify-center overflow-y-auto py-10" style={{ background: 'var(--bg)' }}>
    <button onClick={() => navigate('/')} className="absolute top-6 left-6 btn btn-ghost btn-sm">← Back</button>
    <button onClick={toggle} className="absolute top-6 right-6 btn btn-ghost btn-sm">{theme === 'dark' ? '☀️' : '🌙'}</button>
    <div className="w-full max-w-sm px-6"><div className="flex items-center gap-2.5 justify-center mb-8">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: 'var(--color-indigo-500)' }}>↗</div><span className="display font-semibold text-[17px]">LoanPilot AI</span>
    </div>{children}</div>
  </div>;
}

export function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [mode, setMode] = useState<LoginMode>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submitEmail = async () => {
    if (!supabase) {
      toast('Local demo mode enabled. Entering the demo workspace.', 'success');
      navigate('/app/dashboard');
      return;
    }
    if (!email.trim() || !password) throw new Error('Enter your email and password.');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    toast('Signed in successfully.', 'success');
    navigate('/app/dashboard');
  };

  const submitPhone = async () => {
    if (!supabase) throw new Error('Phone login needs Supabase Auth configuration.');
    const normalizedPhone = phone.replace(/[\s()-]/g, '');
    if (!fullName.trim()) throw new Error('Enter your full name to continue with mobile sign-in.');
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      throw new Error('Enter a phone number in international format, for example +919876543210.');
    }
    if (!otpSent) {
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: fullName.trim(),
            organization_name: organizationName.trim() || `${fullName.trim() || 'New'} Workspace`,
          },
        },
      });
      if (error) throw error;
      setOtpSent(true);
      toast('Verification code sent. Check your SMS messages.', 'success');
      return;
    }
    if (!/^\d{4,8}$/.test(otp.trim())) throw new Error('Enter the verification code from your SMS.');
    const { error } = await supabase.auth.verifyOtp({ phone: normalizedPhone, token: otp.trim(), type: 'sms' });
    if (error) throw error;
    toast('Phone verified. You are signed in.', 'success');
    navigate('/app/dashboard');
  };

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === 'email') await submitEmail();
      else await submitPhone();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Unable to sign in', 'error');
    } finally {
      setBusy(false);
    }
  };

  return <Shell>
    <h2 className="text-xl font-semibold mb-1 text-center">Welcome back</h2>
    <p className="text-sm text-center mb-6" style={{ color: 'var(--text-dim)' }}>Sign in to your organization</p>
    <div className="grid grid-cols-2 gap-2 mb-5">
      <button type="button" className={`btn ${mode === 'email' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('email')}>Email</button>
      <button type="button" className={`btn ${mode === 'phone' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('phone')}>Mobile OTP</button>
    </div>
    {mode === 'email' ? <div className="space-y-4">
      <div><label>Work email</label><input autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@company.com" /></div>
      <div><label>Password</label><input autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Your password" /></div>
      <div className="text-right"><a className="text-xs font-semibold cursor-pointer" style={{ color: 'var(--color-indigo-500)' }} onClick={() => navigate('/forgot-password')}>Forgot password?</a></div>
    </div> : <div className="space-y-4">
      <div><label>Mobile number (include country code)</label><input autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+919876543210" disabled={otpSent} /></div>
      {!otpSent && <>
        <div><label>Full name</label><input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name" /></div>
        <div><label>Business / organization (optional)</label><input value={organizationName} onChange={e => setOrganizationName(e.target.value)} placeholder="Organization name" /></div>
      </>}
      {otpSent && <div><label>SMS verification code</label><input autoComplete="one-time-code" inputMode="numeric" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" /></div>}
      <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Phone sign-in requires phone authentication and an SMS provider to be enabled in Supabase. SMS charges may apply.</p>
      {otpSent && <button type="button" className="text-xs underline" onClick={() => { setOtpSent(false); setOtp(''); }}>Use a different number</button>}
    </div>}
    <button disabled={busy} className="btn btn-primary w-full mt-5" style={{ padding: 11 }} onClick={submit}>{busy ? 'Please wait…' : mode === 'email' ? 'Log in' : otpSent ? 'Verify code and log in' : 'Send OTP'}</button>
    <p className="text-center text-sm mt-6" style={{ color: 'var(--text-dim)' }}>No account? <a className="font-semibold cursor-pointer" style={{ color: 'var(--color-indigo-500)' }} onClick={() => navigate('/signup')}>Create one</a></p>
  </Shell>;
}

export function Signup() {
  const navigate = useNavigate();
  const toast = useToast();
  const [fullName, setFullName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      if (!supabase) {
        toast('Local demo mode enabled. Opening the demo workspace.', 'success');
        navigate('/app/dashboard');
        return;
      }
      if (!fullName.trim() || !name.trim() || !email.trim() || password.length < 8) throw new Error('Enter your name, organization, a valid email, and a password with at least 8 characters.');
      const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { organization_name: name.trim(), full_name: fullName.trim() }, emailRedirectTo: `${location.origin}/verify-email` } });
      if (error) throw error;
      toast('Account request created. Check your email for the verification link.', 'success');
      navigate('/verify-email');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Unable to create account', 'error');
    } finally {
      setBusy(false);
    }
  };
  return <Shell><h2 className="text-xl font-semibold mb-1 text-center">Create your organization</h2><p className="text-sm text-center mb-6" style={{ color: 'var(--text-dim)' }}>Start free, no card required</p>
    <div className="space-y-4"><div><label>Full name</label><input autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" /></div><div><label>Business name</label><input autoComplete="organization" value={name} onChange={e => setName(e.target.value)} placeholder="Your lending business" /></div><div><label>Work email</label><input autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@company.com" /></div><div><label>Password (minimum 8 characters)</label><input autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Create a strong password" /></div>
      <button disabled={busy} className="btn btn-primary w-full" style={{ padding: 11 }} onClick={submit}>{busy ? 'Creating…' : 'Create account'}</button></div>
    <p className="text-center text-sm mt-6" style={{ color: 'var(--text-dim)' }}>Already have an account? <a className="font-semibold cursor-pointer" style={{ color: 'var(--color-indigo-500)' }} onClick={() => navigate('/login')}>Log in</a></p></Shell>;
}

export function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      if (!supabase) throw new Error('Authentication is not configured.');
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/login` });
      if (error) throw error;
      toast('If the account exists, a reset link has been sent.', 'success');
      navigate('/login');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Unable to send reset email', 'error');
    } finally {
      setBusy(false);
    }
  };
  return <Shell><h2 className="text-xl font-semibold mb-1 text-center">Reset your password</h2><p className="text-sm text-center mb-6" style={{ color: 'var(--text-dim)' }}>We'll email you a reset link</p><div className="space-y-4"><div><label>Work email</label><input autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@company.com" /></div><button disabled={busy} className="btn btn-primary w-full" style={{ padding: 11 }} onClick={submit}>{busy ? 'Sending…' : 'Send reset link'}</button></div><p className="text-center text-sm mt-6"><a className="font-semibold cursor-pointer" style={{ color: 'var(--color-indigo-500)' }} onClick={() => navigate('/login')}>← Back to log in</a></p></Shell>;
}

export function VerifyEmail() {
  const navigate = useNavigate();
  const [hasSession, setHasSession] = useState(false);
  useEffect(() => {
    let active = true;
    if (!supabase) { setHasSession(false); return; }
    void supabase.auth.getSession().then(({ data }) => { if (active) setHasSession(Boolean(data.session)); });
    return () => { active = false; };
  }, []);
  return <Shell><div className="text-center"><div className="text-4xl mb-4">📩</div><h2 className="text-xl font-semibold mb-2">Verify your email</h2><p className="text-sm mb-6" style={{ color: 'var(--text-dim)' }}>{hasSession ? 'Your account has an active session. Continue to your workspace.' : 'Check your inbox and open the verification link. Then return here to log in.'}</p><button className="btn btn-primary w-full" style={{ padding: 11 }} onClick={() => navigate(hasSession ? '/app/dashboard' : '/login')}>{hasSession ? 'Enter workspace' : 'Back to log in'}</button></div></Shell>;
}
