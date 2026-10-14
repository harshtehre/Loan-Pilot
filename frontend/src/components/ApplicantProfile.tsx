import type { Application } from '../types';

export default function ApplicantProfile({ app }: { app: Application }) {
  const rows: [string, string | number][] = [
    ['Full name', app.name],
    ['Employment', app.employment],
    ['Employment length', `${app.years} years`],
    ['Dependents', app.dependents],
  ];
  return (
    <div className="card p-4">
      <h4 className="font-semibold text-sm mb-3">
        Personal Information
      </h4>
      <div className="text-sm space-y-2">
        {rows.map(([k, v]) => (
          <div className="flex justify-between" key={k}>
            <span style={{ color: 'var(--text-dim)' }}>{k}</span><span>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
