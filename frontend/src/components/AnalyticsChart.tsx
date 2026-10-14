import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

type Kind = 'line' | 'bar' | 'pie' | 'stackedBar';

interface Props {
  kind: Kind;
  data: Record<string, string | number>[];
  dataKeys: { key: string; color: string; name?: string }[];
  xKey?: string;
  height?: number;
  showLegend?: boolean;
}

const gridColor = 'var(--border)';
const textColor = 'var(--text-dim)';

export default function AnalyticsChart({ kind, data, dataKeys, xKey = 'x', height = 220, showLegend = false }: Props) {
  if (kind === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey={dataKeys[0].key} nameKey={xKey} innerRadius={50} outerRadius={80}>
            {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Legend wrapperStyle={{ fontSize: 12, color: textColor }} />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }
  if (kind === 'bar' || kind === 'stackedBar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout={dataKeys.length === 1 && data.length <= 4 ? 'vertical' : 'horizontal'}>
          <CartesianGrid stroke={gridColor} vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: textColor }} type={dataKeys.length === 1 && data.length <= 4 ? 'number' : 'category'} />
          <YAxis tick={{ fontSize: 11, fill: textColor }} type={dataKeys.length === 1 && data.length <= 4 ? 'category' : 'number'} dataKey={dataKeys.length === 1 && data.length <= 4 ? xKey : undefined} width={dataKeys.length === 1 && data.length <= 4 ? 110 : 30} />
          <Tooltip />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12, color: textColor }} />}
          {dataKeys.map(dk => (
            <Bar key={dk.key} dataKey={dk.key} name={dk.name} fill={dk.color} radius={[5, 5, 5, 5]}
                 stackId={kind === 'stackedBar' ? 'a' : undefined} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: textColor }} />
        <YAxis tick={{ fontSize: 11, fill: textColor }} width={30} />
        <Tooltip />
        {showLegend && <Legend wrapperStyle={{ fontSize: 12, color: textColor }} />}
        {dataKeys.map(dk => (
          <Line key={dk.key} type="monotone" dataKey={dk.key} name={dk.name} stroke={dk.color}
                strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

const PALETTE = ['#10B981', '#F59E0B', '#EF4444', '#4F46E5', '#38BDF8'];
