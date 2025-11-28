'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, Label } from 'recharts';

const DEFAULT_COLORS = ['#10b981', '#f97316', '#facc15', '#6366f1', '#a855f7', '#f472b6'];

type Segment = {
  name: string;
  value: number;
  color?: string;
};

type TaxBreakdownChartProps = {
  data: Segment[];
  centerLabel?: string;
  centerValue?: string;
};

export default function TaxBreakdownChart({ data, centerLabel = 'Net', centerValue }: TaxBreakdownChartProps) {
  const filtered = data.filter((segment) => Number.isFinite(segment.value) && segment.value > 0);

  if (filtered.length === 0) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-sm text-slate-300">
        Run a calculation to see the breakdown.
      </div>
    );
  }

  const renderCenterLabel = ({ cx, cy }: any) => {
    if (cx == null || cy == null) return null;

    return (
      <g>
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#cbd5f5" fontSize={12} fontWeight={500}>
          {centerLabel}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#f8fafc" fontSize={18} fontWeight={700}>
          {centerValue ?? ''}
        </text>
      </g>
    );
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={filtered} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3}>
            {filtered.map((entry, index) => (
              <Cell key={`tax-slice-${entry.name}`} fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
            ))}
            <Label position="center" content={renderCenterLabel} />
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 }).format(value),
              name,
            ]}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#1e293b',
              borderRadius: 12,
              color: '#e2e8f0',
            }}
          />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} iconType="circle" verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
