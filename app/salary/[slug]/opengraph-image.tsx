import { ImageResponse } from "next/og";
import { parseSalarySlug } from "@/lib/content/salary-catalog";
import { buildSalaryInsight } from "@/lib/content/insights";

export const runtime = "edge";
export const alt = "UK salary after tax";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({ params }: { params: { slug: string } }) {
  const salary = parseSalarySlug(params.slug);
  if (salary === null) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#0f172a",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 60,
          }}
        >
          UK Take Home Calculator
        </div>
      ),
      { ...size },
    );
  }
  const insight = buildSalaryInsight(salary);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #064e3b 0%, #0f766e 55%, #10b981 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 500, opacity: 0.85 }}>
            UK Take Home Calculator
          </div>
          <div style={{ fontSize: 28, opacity: 0.85 }}>2025/26 tax year</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 60, fontWeight: 500, opacity: 0.9 }}>
            {insight.formatted.gross} salary
          </div>
          <div style={{ fontSize: 128, fontWeight: 800, lineHeight: 1, letterSpacing: -2 }}>
            {insight.formatted.monthly}
            <span style={{ fontSize: 60, fontWeight: 500, opacity: 0.8 }}> / month</span>
          </div>
          <div style={{ fontSize: 40, fontWeight: 500, opacity: 0.9 }}>
            You keep {insight.formatted.retainedPercent}
          </div>
        </div>
        <div style={{ fontSize: 30, opacity: 0.85 }}>uktakehomecalculator.com</div>
      </div>
    ),
    { ...size },
  );
}
