export default function EligibilityScore({ score }: { score: number }) {
  return (
    <div className="card p-4">
      <div className="text-xs mb-2" style={{ color: 'var(--text-dim)' }}>Eligibility Score</div>
      <div className="text-3xl font-semibold mono" style={{ color: 'var(--color-indigo-500)' }}>
        {score}<span className="text-base">/100</span>
      </div>
      <div className="progress-bg mt-3">
        <div className="progress-bar" style={{ width: `${score}%`, background: 'var(--color-indigo-500)' }} />
      </div>
    </div>
  );
}
