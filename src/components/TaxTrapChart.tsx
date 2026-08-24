"use client";

import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { formatGBP, formatGBPShort } from "@/lib/format";
import { buildSalaryInsight } from "@/lib/marketing/salaryInsight";
import { trackTaxTrapView } from "@/lib/analytics";

/**
 * Interactive visualisation of the £100k UK tax trap.
 *
 * Every point on the chart is produced by `buildSalaryInsight`, which
 * wraps the existing deterministic PAYE engine. This chart introduces
 * NO new tax logic — it just plots the engine's output across a
 * salary range so the marginal-rate cliff between £100k and £125,140
 * becomes visually obvious.
 *
 * Charts must not be the sole source of financial information: we
 * emit a table with the same figures under the chart in the parent
 * page. This component is purely the visualisation layer.
 */
export function TaxTrapChart({ height = 340 }: { height?: number }) {
  // Sample salaries: dense between £80k and £150k, wider elsewhere.
  const data = useMemo(() => {
    const points: number[] = [];
    for (let s = 60_000; s < 90_000; s += 5_000) points.push(s);
    for (let s = 90_000; s <= 150_000; s += 2_500) points.push(s);
    // Ensure the £125,140 anchor is on the chart.
    if (!points.includes(125_140)) {
      points.push(125_140);
      points.sort((a, b) => a - b);
    }

    let prevNet = 0;
    let prevGross = 0;
    return points.map((gross) => {
      const i = buildSalaryInsight(gross);
      const marginalRate =
        prevGross > 0 ? 1 - (i.netAnnual - prevNet) / (gross - prevGross) : 0;
      prevGross = gross;
      prevNet = i.netAnnual;
      return {
        gross,
        net: i.netAnnual,
        marginalRate: prevGross === points[0] ? null : marginalRate,
      };
    });
  }, []);

  return (
    <div
      style={{ width: "100%", height }}
      // Fire once on interaction — the trap's whole purpose is being seen.
      onMouseEnter={() => trackTaxTrapView("chart")}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 12, right: 24, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="gross"
            type="number"
            domain={[60_000, 150_000]}
            tickFormatter={(v) => formatGBPShort(Number(v))}
            allowDecimals={false}
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
          />
          <YAxis
            yAxisId="net"
            tickFormatter={(v) => formatGBPShort(Number(v))}
            width={80}
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
          />
          <YAxis
            yAxisId="marginal"
            orientation="right"
            domain={[0, 0.7]}
            tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
            width={50}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
          />
          <ReferenceArea
            yAxisId="net"
            x1={100_000}
            x2={125_140}
            fill="#f87171"
            fillOpacity={0.08}
            stroke="#f87171"
            strokeOpacity={0.25}
            label={{
              value: "PA taper zone (£100k–£125,140)",
              fill: "#fca5a5",
              fontSize: 11,
              position: "insideTop",
            }}
          />
          <ReferenceLine
            yAxisId="net"
            x={100_000}
            stroke="#f87171"
            strokeDasharray="4 4"
          />
          <ReferenceLine
            yAxisId="net"
            x={125_140}
            stroke="#f87171"
            strokeDasharray="4 4"
          />
          <Area
            yAxisId="net"
            type="monotone"
            dataKey="net"
            name="Annual take-home"
            stroke="#34d399"
            fill="#34d399"
            fillOpacity={0.18}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Line
            yAxisId="marginal"
            type="monotone"
            dataKey="marginalRate"
            name="Marginal rate on each extra £"
            stroke="#f472b6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip
            content={(p) => (
              <TrapTooltip
                {...(p as TooltipContentProps<number, string>)}
              />
            )}
          />
          <Legend
            wrapperStyle={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrapTooltip({
  active,
  payload,
  label,
}: TooltipContentProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const grossLabel = typeof label === "number" ? formatGBP(label) : String(label);
  const net = payload.find((p) => p.dataKey === "net")?.value;
  const marginal = payload.find((p) => p.dataKey === "marginalRate")?.value;
  return (
    <div className="rounded-lg border border-brand-border/60 bg-black/85 px-3 py-2 text-xs text-brand-text shadow-xl">
      <div className="mb-1 font-semibold">Gross salary: {grossLabel}</div>
      {typeof net === "number" && (
        <div>
          Take-home: <strong className="text-emerald-300">{formatGBP(net)}</strong>
        </div>
      )}
      {typeof marginal === "number" && (
        <div>
          Marginal rate on last £:{" "}
          <strong className="text-rose-300">
            {(marginal * 100).toFixed(0)}%
          </strong>
        </div>
      )}
    </div>
  );
}
