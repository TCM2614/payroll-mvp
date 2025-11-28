'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, Label } from 'recharts';
import { formatGBP } from '@/lib/format';

type WealthDistributionChartProps = {
  netIncome: number;
  taxPaid: number;
  niPaid: number;
  pensionContrib?: number;
};

const SEGMENT_COLORS = ['#10b981', '#f97316', '#facc15', '#6366f1'];

export default function WealthDistributionChart({
  netIncome,
  taxPaid,
  niPaid,
  pensionContrib = 0,
}: WealthDistributionChartProps) {
  const data = [
    { name: 'Take-home pay', value: Math.max(netIncome, 0) },
    { name: 'Income tax', value: Math.max(taxPaid, 0) },
    { name: 'National Insurance', value: Math.max(niPaid, 0) },
    { name: 'Pension', value: Math.max(pensionContrib, 0) },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-slate-800 bg-slate-800 text-sm text-slate-300">
        Add salary details to see the wealth distribution chart.
      </div>
    );
  }

  const centerLabelValue = formatGBP(Math.max(netIncome, 0));
  const renderCenterLabel = ({ cx, cy }: any) => {
    if (cx == null || cy == null) return null;

    return (
      <g>
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#cbd5f5" fontSize={12}>
          Net
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#f8fafc" fontSize={18} fontWeight={600}>
          {centerLabelValue}
        </text>
      </g>
    );
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={105}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={`slice-${entry.name}`} fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]} />
            ))}
            <Label position="center" content={renderCenterLabel} />
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [formatGBP(value), name]}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#1e293b',
              borderRadius: 12,
              color: '#e2e8f0',
            }}
          />
          <Legend
            wrapperStyle={{ color: '#e2e8f0' }}
            iconType="circle"
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
