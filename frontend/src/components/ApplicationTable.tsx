import { useNavigate } from 'react-router-dom';
import type { Application } from '../types';
import { statusClass,statusLabel,inr } from '../lib/format';
import RiskBadge from './RiskBadge';

export default function ApplicationTable({ applications }: { applications: Application[] }) {
  const navigate = useNavigate();
  return (
    <table>
      <thead>
        <tr>
          <th>Applicant</th><th>Loan Amount</th><th>Credit</th><th>Risk</th>
          <th>Eligibility</th><th>Status</th><th>Officer</th><th>Date</th><th></th>
        </tr>
      </thead>
      <tbody>
        {applications.length === 0 && (
          <tr><td colSpan={9} className="text-center py-10" style={{ color: 'var(--text-dim)' }}>
            No applications match these filters — try clearing a filter above.
          </td></tr>
        )}
        {applications.map(a => (
          <tr key={a.id} className="row-hover" onClick={() => navigate(`/app/applications/${a.id}`)}>
            <td>
              <div className="font-medium">{a.name}</div>
              <div className="text-xs" style={{ color: 'var(--text-dim)' }}>#{a.id}</div>
            </td>
            <td className="mono">{inr(a.amount)}</td>
            <td className="mono">{a.credit}</td>
            <td><RiskBadge risk={a.risk} /></td>
            <td className="mono">{a.eligibility}%</td>
            <td><span className={`badge ${statusClass(a.status)}`}>{statusLabel(a.status)}</span></td>
            <td>{a.officer}</td>
            <td style={{ color: 'var(--text-dim)' }}>{a.date}</td>
            <td onClick={e => e.stopPropagation()}>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/app/applications/${a.id}`)}>Open</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
