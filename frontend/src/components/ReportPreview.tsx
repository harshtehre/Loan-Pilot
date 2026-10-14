import type { Application } from '../types';
import { calcEmi, inr,statusClass,statusLabel } from '../lib/format';
import RiskBadge from './RiskBadge';

export default function ReportPreview({ app, organizationName = 'Your organization' }: { app: Application; organizationName?: string }) {
  const emi = calcEmi(app.amount, 11.5, app.tenure);
  return (
    <div className="card p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-6 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 className="display text-lg font-semibold">Loan Application Report</h2>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{organizationName} · Application #{app.id}</p>
        </div>
        <span className={`badge ${statusClass(app.status)}`}>{statusLabel(app.status)}</span>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
        <div>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-dim)' }}>APPLICANT SUMMARY</div>
          <div>{app.name}</div>
          <div style={{ color: 'var(--text-dim)' }}>{app.employment} · {app.years} yrs experience</div>
        </div>
        <div>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-dim)' }}>REQUESTED LOAN</div>
          <div className="mono">{inr(app.amount)} · {app.tenure} months</div>
        </div>
        <div>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-dim)' }}>FINANCIAL PROFILE</div>
          <div style={{ color: 'var(--text-dim)' }}>Income {inr(app.income)}/mo · Expenses {inr(app.expenses)}/mo</div>
        </div>
        <div>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-dim)' }}>CREDIT INFORMATION</div>
          <div className="mono">{app.credit}</div>
        </div>
        <div>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-dim)' }}>ELIGIBILITY ANALYSIS</div>
          <div>{app.eligibility}/100 score</div>
        </div>
        <div>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-dim)' }}>RISK ANALYSIS</div>
          <RiskBadge risk={app.risk} />
        </div>
      </div>
      <div className="mb-6">
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-dim)' }}>EMI CALCULATION</div>
        <div className="grid grid-cols-3 text-sm gap-3">
          <div>EMI: <span className="mono font-medium">{inr(emi.emi)}</span></div>
          <div>Interest: <span className="mono font-medium">{inr(emi.totalInterest)}</span></div>
          <div>Total: <span className="mono font-medium">{inr(emi.totalPayment)}</span></div>
        </div>
      </div>
      <div className="text-xs" style={{ color: 'var(--text-dim)', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
        This report reflects AI-assisted, decision-support analysis and does not
        constitute a final lending decision.
      </div>
    </div>
  );
}
