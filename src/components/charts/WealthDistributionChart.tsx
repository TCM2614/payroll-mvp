'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

import { estimatePercentileFromIncome, buildWealthCurveData } from '@/utils/wealth';

const tooltipFormatter = (value: number) => `${(value * 100).toFixed(1)}% density`;

type WealthDistributionChartProps = {
  salary: number;
};

export default function WealthDistributionChart({ salary }: WealthDistributionChartProps) {
  const data = useMemo(() => buildWealthCurveData(2), []);
  const percentile = useMemo(() => estimatePercentileFromIncome(salary), [salary]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="wealthCurve" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.4} />
          <XAxis
            dataKey="percentile"
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            stroke="#1f2937"
          />
          <YAxis
            hide
            domain={[0, 1]}
          />
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={(label) => `Percentile ${label}%`}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#1e293b',
              borderRadius: 12,
              color: '#e2e8f0',
            }}
          />
          <ReferenceLine
            x={percentile}
            stroke="#fbbf24"
            strokeDasharray="3 3"
            label={{
              position: 'top',
              value: `You · ${percentile.toFixed(1)}%`,
              fill: '#f8fafc',
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="density"
            stroke="#34d399"
            fillOpacity={1}
            fill="url(#wealthCurve)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
