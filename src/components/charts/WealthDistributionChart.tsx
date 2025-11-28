'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';

import { estimatePercentileFromIncome, buildSalaryCurveData } from '@/utils/wealth';

const GBP_FORMATTER = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});
const SHORT_FORMATTER = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const UK_AVG_SALARY = 35000;

type WealthDistributionChartProps = {
  salary: number;
};

export default function WealthDistributionChart({ salary }: WealthDistributionChartProps) {
  const data = useMemo(() => buildSalaryCurveData(2), []);
  const percentile = useMemo(() => estimatePercentileFromIncome(salary), [salary]);
  const clampedSalary = Math.max(12000, Math.min(250000, salary || 0));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const point = payload[0]?.payload;
    if (!point) return null;
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl shadow-indigo-500/10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Salary</p>
        <p className="text-lg font-bold text-slate-100">{GBP_FORMATTER.format(point.salary)}</p>
        <p className="text-xs text-slate-400 mt-1">Density {(point.density * 100).toFixed(1)}%</p>
      </div>
    );
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="wealthBell" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#312e81" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#312e81" opacity={0.4} />
          <XAxis
            dataKey="salary"
            type="number"
            tickFormatter={(value) => SHORT_FORMATTER.format(value)}
            tick={{ fill: '#cbd5f5', fontSize: 12 }}
            stroke="#312e81"
            domain={[12000, 250000]}
          />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={UK_AVG_SALARY}
            stroke="#a78bfa"
            strokeDasharray="6 4"
            label={{
              value: 'UK Avg £35k',
              position: 'top',
              fill: '#ede9fe',
              fontSize: 11,
            }}
          />
          <ReferenceLine
            x={clampedSalary}
            stroke="#34d399"
            strokeDasharray="6 4"
            label={{
              value: `You · ${GBP_FORMATTER.format(clampedSalary)}`,
              position: 'top',
              fill: '#d1fae5',
              fontSize: 11,
            }}
          />
          <Area
            type="monotone"
            dataKey="density"
            stroke="#a78bfa"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#wealthBell)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
