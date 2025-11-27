"use client";

import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

import { formatGBP } from "@/lib/format";

type TaxBreakdownChartProps = {
  netPay: number;
  incomeTax: number;
  nationalInsurance: number;
  pension: number;
  height?: number;
};

const SEGMENT_COLORS = {
  netPay: "#10b981", // emerald-500
  incomeTax: "#ef4444", // red-500
  nationalInsurance: "#f97316", // orange-500
  pension: "#2563eb", // blue-600
};

export function TaxBreakdownChart({
  netPay,
  incomeTax,
  nationalInsurance,
  pension,
  height = 320,
}: TaxBreakdownChartProps) {
  const breakdown = useMemo(
    () => [
      { name: "Net Pay", key: "netPay", value: Math.max(netPay, 0), color: SEGMENT_COLORS.netPay },
      { name: "Income Tax", key: "incomeTax", value: Math.max(incomeTax, 0), color: SEGMENT_COLORS.incomeTax },
      { name: "National Insurance", key: "nationalInsurance", value: Math.max(nationalInsurance, 0), color: SEGMENT_COLORS.nationalInsurance },
      { name: "Pension", key: "pension", value: Math.max(pension, 0), color: SEGMENT_COLORS.pension },
    ],
    [netPay, incomeTax, nationalInsurance, pension]
  );

  const total = useMemo(
    () => breakdown.reduce((acc, entry) => acc + Number(entry.value || 0), 0),
    [breakdown]
  );

  const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const { active, payload } = props;
    if (!active || !payload?.length) return null;

    const entry = payload[0];
    const rawValue = Number(entry.value ?? 0);
    const percentage = total > 0 ? (rawValue / total) * 100 : 0;

    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
        <div className="font-medium" style={{ color: entry.payload?.color ?? entry.color }}>{entry.name}</div>
        <div>{formatGBP(rawValue)}</div>
        <div className="text-slate-500">{percentage.toFixed(1)}%</div>
      </div>
    );
  };

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={renderTooltip} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
          />
          <Pie
            data={breakdown}
            dataKey="value"
            nameKey="name"
            innerRadius="60%"
            outerRadius="90%"
            paddingAngle={3}
            cornerRadius={8}
            isAnimationActive
            animationBegin={200}
            animationDuration={900}
          >
            {breakdown.map((segment) => (
              <Cell key={segment.key} fill={segment.color} stroke="transparent" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TaxBreakdownChart;

