import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";

export const runtime = "edge";
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #064e3b 0%, #0f766e 60%, #10b981 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 500, opacity: 0.85 }}>
          UK Take Home Calculator
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.05 }}>
          {SITE_TAGLINE}
        </div>
        <div style={{ fontSize: 30, opacity: 0.85 }}>uktakehomecalculator.com</div>
      </div>
    ),
    { ...size },
  );
}
