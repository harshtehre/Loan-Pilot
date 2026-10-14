import { useMemo, useState } from 'react';
import { calcEmi, inr } from '../lib/format';

export default function EmiCalculator() {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(11.5);
  const [tenure, setTenure] = useState(36);

  const result = useMemo(() => calcEmi(amount, rate, tenure), [amount, rate, tenure]);

  const schedule = useMemo(() => {
    let bal = amount;
    const rows: { month: number; principal: number; interest: number; balance: number }[] = [];
    for (let m = 1; m <= tenure; m++) {
      const interest = bal * result.r;
      const principal = result.emi - interest;
      bal -= principal;
      rows.push({ month: m, principal, interest, balance: Math.max(0, bal) });
    }
    return rows;
  }, [amount, tenure, result]);

  return (
    <div>
      <h1 className="display text-2xl font-semibold mb-1">EMI Calculator</h1>
      <p className="text-sm mb-5" style={{ color: 'var(--text-dim)' }}>Standalone calculator — also embedded in every application</p>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-5">
          <label>Loan amount (₹)</label>
          <input type="number" value={amount} onChange={e => setAmount(+e.target.value || 0)} className="mb-4" />
          <label>Interest rate (% p.a.)</label>
          <input type="number" step="0.1" value={rate} onChange={e => setRate(+e.target.value || 0)} className="mb-4" />
          <label>Tenure (months)</label>
          <input type="number" value={tenure} onChange={e => setTenure(+e.target.value || 1)} />
        </div>
        <div className="card p-5 lg:col-span-2">
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div><div className="text-xs" style={{ color: 'var(--text-dim)' }}>Monthly EMI</div><div className="text-xl font-semibold mono">{inr(result.emi)}</div></div>
            <div><div className="text-xs" style={{ color: 'var(--text-dim)' }}>Total Interest</div><div className="text-xl font-semibold mono">{inr(result.totalInterest)}</div></div>
            <div><div className="text-xs" style={{ color: 'var(--text-dim)' }}>Total Payment</div><div className="text-xl font-semibold mono">{inr(result.totalPayment)}</div></div>
          </div>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-dim)' }}>AMORTIZATION SCHEDULE</div>
          <div className="overflow-y-auto max-h-64">
            <table>
              <thead><tr><th>Month</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
              <tbody>
                {schedule.map(r => (
                  <tr key={r.month}>
                    <td>{r.month}</td>
                    <td className="mono">{inr(r.principal)}</td>
                    <td className="mono">{inr(r.interest)}</td>
                    <td className="mono">{inr(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
