import { ImageResponse } from "next/og";
import { buildSalaryInsight } from "@/lib/marketing/salaryInsight";

export const runtime = "edge";
export const revalidate = 86_400; // 1 day; deterministic per salary

const SIZE = { width: 1200, height: 630 } as const;

/**
 * Dynamic OG image for `/salary/{n}-after-tax` pages. Rendered at the edge
 * from the same deterministic tax engine the pages themselves use, so the
 * shared image and the on-page numbers are guaranteed to match.
 *
 * Query params:
 *   salary=<integer £ per year>   Required. Guardrails reject values outside £1k–£10m.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = Number(url.searchParams.get("salary"));
  if (!Number.isFinite(raw) || raw < 1_000 || raw > 10_000_000) {
    return new Response("Invalid salary", { status: 400 });
  }
  const salary = Math.round(raw);
  const insight = buildSalaryInsight(salary);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background:
            "linear-gradient(135deg, #052e2b 0%, #064e3b 45%, #0f766e 100%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 30,
            opacity: 0.85,
          }}
        >
          <span>UK Take-Home Calculator</span>
          <span>{insight.taxYear.replace("-", "/")} tax year</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 500, opacity: 0.9 }}>
            <span>{insight.formatted.gross} salary</span>
          </div>
          <div
            style={{
              fontSize: 128,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -2,
              display: "flex",
              alignItems: "baseline",
              gap: 20,
            }}
          >
            {insight.formatted.monthly}
            <span style={{ fontSize: 52, fontWeight: 500, opacity: 0.8 }}>
              / month
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              fontWeight: 500,
              opacity: 0.9,
            }}
          >
            <span>
              You keep {insight.formatted.retainedPercent} · Income Tax{" "}
              {insight.formatted.incomeTax} · NI {insight.formatted.ni}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 28, opacity: 0.8 }}>
          <span>uktakehomecalculator.com/salary/{salary}-after-tax</span>
        </div>
      </div>
    ),
    { ...SIZE },
  );
}
