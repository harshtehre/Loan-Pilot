import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import AnalyticsChart from '../components/AnalyticsChart';

const FAQS: [string, string][] = [
  ['Is the AI making the final loan decision?', 'No. Every AI output is decision-support — eligibility scores and risk explanations assist your officers, who make the final call.'],
  ["Can each business see other businesses' data?", 'No. Data is isolated per organization using row-level security at the database layer.'],
  ['Can we bring our own loan products and rules?', 'Yes. Configure your own products, thresholds and eligibility rules — the matching engine compares applicants against your rules only.'],
  ['Is payment processing connected in this demo?', 'Not yet. Billing is structured so a provider like Stripe can be connected without UI changes.'],
];
const heroTrend = [{ x: '1', v: 40 }, { x: '2', v: 55 }, { x: '3', v: 48 }, { x: '4', v: 66 }, { x: '5', v: 72 }, { x: '6', v: 78 }];

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="fade-in">
      <header className="sticky top-0 z-40" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="7" fill="#4F46E5" /><path d="M7 15.5L10.2 11L13 13.5L17 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="display font-semibold text-[17px]">LoanPilot <span style={{ color: 'var(--color-indigo-500)' }}>AI</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm" style={{ color: 'var(--text-dim)' }}>
            <a href="#features">Features</a><a href="#workflow">How it works</a><a href="#security">Security</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="btn btn-ghost btn-sm">{theme === 'dark' ? '☀️' : '🌙'}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Log in</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>Start Free</button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="badge b-indigo mb-5">Decision-support AI, not automated underwriting</span>
          <h1 className="display text-[44px] md:text-[54px] leading-[1.08] font-semibold mb-6">AI-powered loan operations for modern businesses</h1>
          <p className="text-lg mb-8" style={{ color: 'var(--text-dim)', maxWidth: 520 }}>
            Automate applicant analysis, risk explanation and reporting — so your team spends time on judgment calls, not paperwork.
          </p>
          <div className="flex flex-wrap gap-3 mb-10">
            <button className="btn btn-primary" style={{ padding: '13px 24px', fontSize: 15 }} onClick={() => navigate('/signup')}>Start Free →</button>
            <button className="btn btn-ghost" style={{ padding: '13px 24px', fontSize: 15 }} onClick={() => navigate('/app/dashboard')}>Book a Demo</button>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--text-dim)' }}>
            <span>✓ No card required</span><span>✓ Setup in minutes</span><span>✓ SOC2-ready architecture</span>
          </div>
        </div>
        <div className="card p-5 shadow-2xl" style={{ transform: 'rotate(-1deg)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">Application #LP-2291</span>
            <span className="badge b-amber">Medium Risk</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="card p-3" style={{ borderColor: 'transparent', background: 'var(--surface-2)' }}>
              <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>Eligibility Score</div>
              <div className="text-2xl font-semibold mono" style={{ color: 'var(--color-indigo-500)' }}>78<span className="text-sm">/100</span></div>
            </div>
            <div className="card p-3" style={{ borderColor: 'transparent', background: 'var(--surface-2)' }}>
              <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>Requested</div>
              <div className="text-2xl font-semibold mono">₹4.2L</div>
            </div>
          </div>
          <div className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text-dim)' }}>AI EXPLANATION (SAMPLE)</div>
          <p className="text-[13px] leading-relaxed mb-1" style={{ color: 'var(--text-dim)' }}>
            Stable income-to-EMI ratio and 3-year employment tenure support approval. Credit score sits near the product's minimum threshold.
          </p>
          <div className="h-24 mt-4"><AnalyticsChart kind="line" data={heroTrend} dataKeys={[{ key: 'v', color: '#4F46E5' }]} height={96} /></div>
        </div>
      </section>

      <section className="border-y py-8" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold mb-6" style={{ color: 'var(--text-dim)' }}>BUILT FOR NBFCS, FINTECH LENDERS &amp; INDEPENDENT LOAN ADVISORS</p>
          <div className="flex flex-wrap justify-center gap-x-14 gap-y-4 text-sm font-semibold" style={{ color: 'var(--text-dim)' }}>
            <span>Small NBFCs</span><span>Digital Lending Startups</span><span>Loan Aggregators</span><span>Financial Consultants</span><span>Microfinance Institutions</span>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="display text-3xl font-semibold mb-3">Everything a lending desk needs, in one place</h2>
        <p className="mb-12" style={{ color: 'var(--text-dim)', maxWidth: 560 }}>From intake to decision to reporting — one workspace replaces spreadsheets, email threads and manual scoring.</p>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            ['📋', 'Application workflow', 'Structured intake with document capture, status tracking and officer assignment.'],
            ['🧠', 'AI risk explanation', 'Plain-language reasoning behind every eligibility score and risk flag.'],
            ['🗂️', 'Document processing', 'Extract and validate income proof, bank statements and ID with confidence scoring.'],
            ['🎯', 'Product matching', 'Compare applicants against your own configured loan products automatically.'],
            ['📊', 'Portfolio analytics', 'Approval trends, officer performance and risk distribution at a glance.'],
            ['🔒', 'Multi-tenant & secure', 'Isolated organization data with role-based access and full audit trails.'],
          ].map(([icon, title, desc]) => (
            <div className="card p-6" key={title}><div className="text-2xl mb-3">{icon}</div><h3 className="font-semibold mb-2">{title}</h3><p className="text-sm" style={{ color: 'var(--text-dim)' }}>{desc}</p></div>
          ))}
        </div>
      </section>

      <section id="workflow" className="py-24" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="display text-3xl font-semibold mb-12">How an application moves through LoanPilot</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[['1', 'Submit', 'Applicant & document intake'], ['2', 'Extract', 'AI reads uploaded documents'], ['3', 'Analyze', 'Eligibility & risk scoring'], ['4', 'Match', 'Compare against loan products'], ['5', 'Decide', 'Officer reviews & reports']].map(([n, t, d]) => (
              <div className="text-center" key={n}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3 font-semibold" style={{ background: 'var(--color-indigo-500)', color: '#fff' }}>{n}</div>
                <h4 className="font-semibold text-sm mb-1">{t}</h4><p className="text-xs" style={{ color: 'var(--text-dim)' }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="display text-3xl font-semibold mb-4">Built for regulated data from day one</h2>
          <p className="mb-6" style={{ color: 'var(--text-dim)' }}>Every organization's data is isolated at the database layer. Every sensitive action is logged. AI recommendations are always decision-support — never an automated approval.</p>
          <ul className="space-y-3 text-sm">
            {['Row-level security per organization', 'Role-based permissions (Owner → Viewer)', 'Full audit log of every sensitive action', 'Encrypted document storage'].map(t => (
              <li className="flex gap-3" key={t}><span style={{ color: 'var(--color-indigo-500)' }}>✓</span> {t}</li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <AnalyticsChart kind="bar" showLegend height={220}
            data={[{ x: 'Jan', low: 20, medium: 10, high: 4 }, { x: 'Feb', low: 24, medium: 12, high: 5 }, { x: 'Mar', low: 22, medium: 11, high: 3 }, { x: 'Apr', low: 28, medium: 9, high: 6 }, { x: 'May', low: 30, medium: 13, high: 4 }, { x: 'Jun', low: 32, medium: 12, high: 5 }]}
            dataKeys={[{ key: 'low', color: '#10B981', name: 'Low' }, { key: 'medium', color: '#F59E0B', name: 'Medium' }, { key: 'high', color: '#EF4444', name: 'High' }]} />
        </div>
      </section>

      <section id="pricing" className="py-24" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="display text-3xl font-semibold mb-12 text-center">Plans that scale with your loan book</h2>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              ['Starter', '₹2,999', ['Up to 100 applications/mo', '2 team seats', 'Core AI analysis'], false],
              ['Business', '₹7,999', ['Up to 750 applications/mo', '10 team seats', 'Document AI + matching engine'], true],
              ['Professional', '₹14,999', ['Unlimited applications', '25 team seats', 'Full analytics & API access'], false],
              ['Enterprise', 'Custom', ['Dedicated infrastructure', 'Custom SLAs', 'White-glove onboarding'], false],
            ].map(([name, price, feats, popular]) => (
              <div key={name as string} className="card p-6 relative" style={popular ? { borderColor: 'var(--color-indigo-500)', borderWidth: 2 } : undefined}>
                {popular && <span className="badge b-indigo absolute -top-3 left-6">Most popular</span>}
                <h3 className="font-semibold mb-1">{name}</h3>
                <div className="text-3xl font-semibold mb-4 mono">{price}{price !== 'Custom' && <span className="text-sm font-normal" style={{ color: 'var(--text-dim)' }}>/mo</span>}</div>
                <ul className="text-sm space-y-2 mb-6" style={{ color: 'var(--text-dim)' }}>{(feats as string[]).map(f => <li key={f}>{f}</li>)}</ul>
                <button className={`btn ${popular ? 'btn-primary' : 'btn-ghost'} w-full`} onClick={() => navigate('/signup')}>{name === 'Enterprise' ? 'Contact Sales' : 'Start Free'}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="display text-3xl font-semibold mb-10 text-center">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQS.map(([q, a], i) => (
            <div className="card p-4 cursor-pointer" key={q} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="flex justify-between items-center font-medium text-sm">{q}<span>+</span></div>
              {openFaq === i && <p className="text-sm mt-2" style={{ color: 'var(--text-dim)' }}>{a}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 text-center">
        <div className="card p-14" style={{ background: 'linear-gradient(135deg,var(--color-indigo-600),var(--color-indigo-400))', border: 'none', color: '#fff' }}>
          <h2 className="display text-3xl font-semibold mb-3">Ready to modernize your lending desk?</h2>
          <p className="mb-7 opacity-90">Set up your organization in minutes. No card required for the free tier.</p>
          <button className="btn" style={{ background: '#fff', color: 'var(--color-indigo-600)', padding: '13px 26px', fontSize: 15 }} onClick={() => navigate('/signup')}>Start Free →</button>
        </div>
      </section>

      <footer className="border-t py-10" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between gap-6 text-sm" style={{ color: 'var(--text-dim)' }}>
          <span>© 2026 LoanPilot AI. Decision-support tooling — not a lender.</span>
          <div className="flex gap-6"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Security</a><a href="#">Contact</a></div>
        </div>
      </footer>
    </div>
  );
}
