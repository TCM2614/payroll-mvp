'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatGBP, formatGBPShort } from '@/lib/format';

type ChartDatum = {
  name: string;
  incomeTax?: number;
  ni?: number;
  corpTax?: number;
  dividendTax?: number;
  net?: number;
};

type Props = {
  data: ChartDatum[];
};

export default function BusinessTaxBreakdownChart({ data }: Props) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="name" tick={{ fill: '#cbd5f5' }} tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={(value) => formatGBPShort(Number(value))}
            tick={{ fill: '#cbd5f5' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip formatter={(value) => formatGBP(Number(value))} contentStyle={{ backgroundColor: '#0f172a', borderRadius: 12 }} />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} />

          <Bar dataKey="incomeTax" stackId="taxes" name="Income Tax" fill="#f97316" />
          <Bar dataKey="ni" stackId="taxes" name="National Insurance" fill="#facc15" />
          <Bar dataKey="corpTax" stackId="taxes" name="Corporation Tax" fill="#818cf8" />
          <Bar dataKey="dividendTax" stackId="taxes" name="Dividend Tax" fill="#ec4899" />
          <Bar dataKey="net" name="Net" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
