import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: ReactNode;
  delta?: string;
  positive?: boolean;
}

export default function DashboardCard({ label, value, delta, positive = true }: Props) {
  return (
    <div className="card p-4">
      <div className="text-xs mb-2" style={{ color: 'var(--text-dim)' }}>{label}</div>
      <div className="text-2xl font-semibold mono">{value}</div>
      {delta && (
        <div className="text-xs mt-1" style={{ color: positive ? '#10B981' : '#EF4444' }}>{delta}</div>
      )}
    </div>
  );
}
