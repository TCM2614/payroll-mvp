'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { formatGBP } from '@/lib/format';

type WealthDistributionChartProps = {
  netIncome: number;
  taxPaid: number;
  niPaid: number;
  pensionContrib?: number;
};

const SEGMENT_COLORS = ['#10b981', '#f97316', '#facc15', '#6366f1'];

const renderLabel = ({ name, value }: any) => `${name}: ${formatGBP(value)}`;

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
      <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/70 text-sm text-slate-300">
        Add salary details to see the wealth distribution chart.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            labelLine={false}
            label={renderLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`slice-${entry.name}`} fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]} />
            ))}
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
