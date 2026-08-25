import { ImageResponse } from "next/og";
import { computeLandingComparison } from "@/lib/marketing/landingComparison";
import { parseCompareSlug } from "@/lib/marketing/compareSlug";

export const runtime = "edge";
// Cache the images for a day. The numbers are deterministic per slug (and
// change only when the tax-year config changes), so a long cache is safe.
export const revalidate = 86400;

const SIZE = { width: 1200, height: 630 } as const;

/**
 * Dynamic OG image for the comparison strip. Called by:
 *   - /compare/[slug]     (Twitter/OG previews)
 *   - /                   (landing hero share card — via ?slug=500-a-day)
 *
 * Query params:
 *   slug=<canonical-slug>  Optional. Defaults to 500-a-day.
 *
 * Rendered with next/og at the edge — no browser, no image toolchain,
 * just JSX-in-JSX flexbox rendered to a PNG.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawSlug = url.searchParams.get("slug");
  const slug =
    rawSlug && rawSlug.trim().length > 0 ? rawSlug.trim() : "500-a-day";

  // Reject overlong / obviously abusive slug strings before parsing.
  if (slug.length > 64) {
    return new Response("Invalid slug", { status: 400 });
  }

  const parsed = parseCompareSlug(slug);
  if (!parsed) {
    return new Response("Invalid slug", { status: 400 });
  }

  const comparison = computeLandingComparison(parsed.inputs);
  const bestKey = comparison.bestScenarioKey;
  const worstKey = comparison.worstScenarioKey;

  const cards = comparison.scenarios.map((s) => {
    const isBest = s.key === bestKey;
    const isWorst = s.key === worstKey && bestKey !== worstKey;
    return { ...s, isBest, isWorst };
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.20), rgba(0,0,0,0) 55%), radial-gradient(circle at 80% 80%, rgba(59,130,246,0.20), rgba(0,0,0,0) 55%), #050a0f",
          color: "#f8fafc",
          padding: "48px 56px",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #22c55e, #38bdf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#050a0f",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            UK
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>UK Take-Home</div>
            <div style={{ fontSize: 14, color: "rgba(248,250,252,0.65)" }}>
              PAYE · Umbrella · IR35 · 2026/27
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid rgba(34,197,94,0.4)",
              background: "rgba(34,197,94,0.10)",
              color: "#86efac",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
            }}
          >
            Tax year 2026/27
          </div>
        </div>

        <div style={{ marginTop: 34, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -0.5,
            }}
          >
            {parsed.compactDisplay} contractor. Four engagement types.
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 20,
              color: "rgba(248,250,252,0.75)",
            }}
          >
            Live take-home comparison for {parsed.workingPatternHint}.
          </div>
        </div>

        <div
          style={{
            marginTop: 32,
            display: "flex",
            gap: 12,
            width: "100%",
          }}
        >
          {cards.map((c) => (
            <div
              key={c.key}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: 18,
                borderRadius: 18,
                border: c.isBest
                  ? "2px solid rgba(34,197,94,0.75)"
                  : "1px solid rgba(255,255,255,0.10)",
                background: c.isBest
                  ? "rgba(34,197,94,0.08)"
                  : "rgba(255,255,255,0.04)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(248,250,252,0.55)",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  fontWeight: 700,
                }}
              >
                {c.regime}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "rgba(248,250,252,0.9)",
                }}
              >
                {c.label}
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 30,
                  fontWeight: 700,
                  letterSpacing: -0.5,
                }}
              >
                {formatGBPForImage(c.netAnnual)}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(248,250,252,0.6)",
                }}
              >
                per year net
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color:
                    c.deltaVsPayeAnnual > 0
                      ? "#86efac"
                      : c.deltaVsPayeAnnual < 0
                        ? "#fca5a5"
                        : "rgba(248,250,252,0.75)",
                  fontWeight: 600,
                }}
              >
                {c.deltaVsPayeAnnual === 0
                  ? "= PAYE baseline"
                  : `${c.deltaVsPayeAnnual > 0 ? "+" : "−"}${formatGBPForImage(
                      Math.abs(c.deltaVsPayeAnnual),
                    )} vs PAYE`}
              </div>
              {c.isBest && (
                <div
                  style={{
                    marginTop: 12,
                    alignSelf: "flex-start",
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: "#22c55e",
                    color: "#050a0f",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    display: "flex",
                  }}
                >
                  Highest net
                </div>
              )}
              {c.isWorst && (
                <div
                  style={{
                    marginTop: 12,
                    alignSelf: "flex-start",
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: "rgba(244,63,94,0.85)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    display: "flex",
                  }}
                >
                  Lowest net
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 15,
            color: "rgba(248,250,252,0.7)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            Gap between best and worst:{" "}
            <span style={{ color: "#f8fafc", fontWeight: 700 }}>
              {formatGBPForImage(comparison.bestVsWorstAnnual)}/year
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>uk-take-home.co</div>
        </div>
      </div>
    ),
    SIZE,
  );
}

function formatGBPForImage(n: number): string {
  return `£${Math.round(n).toLocaleString("en-GB")}`;
}
