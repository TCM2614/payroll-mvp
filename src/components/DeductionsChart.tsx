"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList
} from "recharts";
import { formatGBP, formatGBPShort } from "@/lib/format";



/**
 * data shape example:
 * [{ name: "This month", tax: 1200, ni: 380, pension: 300, loan: 0, takehome: 4200 }]
 */
export function DeductionsChart({
  data,
  height = 280,
}: {
  data: Array<{ name: string; tax: number; ni: number; pension: number; loan: number; takehome: number }>;
  height?: number;
}) {
  // Primary colours (accessible, high-contrast)
  const COLORS = {
    takehome: "#2563eb", // blue-600
    tax: "#ef4444",      // red-500
    ni: "#f59e0b",       // amber-500
    pension: "#10b981",  // emerald-500
    loan: "#7c3aed",     // violet-600
  };



  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            tickFormatter={(v) => formatGBPShort(Number(v))}
            domain={[0, (max: number) => Math.ceil(max * 1.2)]} // breathing room so labels don't clip
            allowDecimals={false}
            width={80}
          />
          <Tooltip formatter={(v) => formatGBP(Number(v))} />
          <Legend />



          {/* Stack all deductions together */}
          <Bar dataKey="tax" stackId="deductions" name="Tax" fill={COLORS.tax} />
          <Bar dataKey="ni" stackId="deductions" name="NI" fill={COLORS.ni} />
          <Bar dataKey="pension" stackId="deductions" name="Pension" fill={COLORS.pension} />
          <Bar dataKey="loan" stackId="deductions" name="Loan" fill={COLORS.loan} />



          {/* Take-home as its own bar */}
          <Bar dataKey="takehome" name="Take-home" fill={COLORS.takehome}>
            <LabelList
              dataKey="takehome"
              position="top"
              content={(props) => {
                const { x, y, value, index } = props as any;
                if (x == null || y == null) return null;
                return (
                  <text
                    x={x}
                    y={y - 6}
                    textAnchor="middle"
                    fontSize={12}
                  >
                    {formatGBPShort(Number(value))}
                  </text>
                );
              }}
            />
          </Bar>

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}



export default DeductionsChart;

