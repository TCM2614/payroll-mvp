'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, Label } from 'recharts';

const DEFAULT_COLORS = ['#10b981', '#f97316', '#facc15', '#6366f1', '#a855f7', '#f472b6'];
const GBP_FORMATTER = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

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
  const total = filtered.reduce((sum, segment) => sum + segment.value, 0);

  if (filtered.length === 0) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-sm text-slate-300">
        Run a calculation to see the breakdown.
      </div>
    );
  }

  const renderCenterLabel = ({ cx, cy }: any) => {
    if (cx == null || cy == null) return null;
    const primaryLine = centerValue ?? GBP_FORMATTER.format(filtered[0]?.value ?? 0);
    const secondaryLine =
      total > 0
        ? `${((filtered.find((seg) => seg.name.toLowerCase().includes('net'))?.value ?? filtered[0]?.value ?? 0) / total * 100).toFixed(0)}%`
        : '';

    return (
      <g>
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#94a3b8" fontSize={12} fontWeight={500}>
          {centerLabel}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#34d399" fontSize={18} fontWeight={700}>
          {primaryLine}
        </text>
        {secondaryLine && (
          <text x={cx} y={cy + 32} textAnchor="middle" fill="#cbd5f5" fontSize={12} fontWeight={500}>
            {secondaryLine}
          </text>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const { name, value, payload: cellPayload, color } = payload[0] ?? {};
    const swatchColor = color ?? cellPayload?.color ?? '#34d399';
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl shadow-emerald-500/10">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: swatchColor }} />
          <span>{name}</span>
        </div>
        <div className="mt-1 text-lg font-bold text-slate-100">{GBP_FORMATTER.format(value ?? 0)}</div>
      </div>
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
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-slate-300 text-xs sm:text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
