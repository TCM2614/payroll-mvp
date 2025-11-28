'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatGBP, formatGBPShort } from '@/lib/format';

type ChartDatum = {
  name: string;
  mode: 'sole' | 'limited';
  incomeTax?: number;
  ni?: number;
  corpTax?: number;
  dividendTax?: number;
  net?: number;
};

type Props = {
  data: ChartDatum[];
};

const GBP_FORMATTER = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];
  if (!point) return null;
  const color = point.color ?? '#10b981';
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl shadow-emerald-500/10">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
        <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span>{point.name}</span>
      </div>
      <p className="mt-1 text-lg font-bold text-slate-100">{GBP_FORMATTER.format(point.value ?? 0)}</p>
      <p className="text-xs text-slate-400">{point.payload?.name}</p>
    </div>
  );
};

export default function BusinessTaxBreakdownChart({ data }: Props) {
  const mode = data[0]?.mode ?? 'sole';
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="#334155" strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fill: '#cbd5f5', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={(value) => formatGBPShort(Number(value))}
            tick={{ fill: '#cbd5f5', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} />

          {mode === 'sole' ? (
            <>
              <Bar dataKey="incomeTax" stackId="taxes" name="Income Tax" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ni" stackId="taxes" name="National Insurance" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </>
          ) : (
            <>
              <Bar dataKey="corpTax" stackId="taxes" name="Corporation Tax" fill="#ec4899" radius={[4, 4, 0, 0]} />
              <Bar dataKey="dividendTax" stackId="taxes" name="Dividend Tax" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </>
          )}
          <Bar dataKey="net" name="Net" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
