import type { RiskLevel } from '../types';

const COLOR: Record<RiskLevel, string> = { Low: 'b-green', Medium: 'b-amber', High: 'b-red' };

export default function RiskBadge({ risk, size = 'sm' }: { risk: RiskLevel; size?: 'sm' | 'lg' }) {
  return (
    <span className={`badge ${COLOR[risk]}`} style={size === 'lg' ? { fontSize: 14, padding: '6px 14px' } : undefined}>
      {risk}
    </span>
  );
}
