import { SITE_URL } from "@/lib/seo/site";
import type { SharePlatform } from "@/lib/analytics/events";

/**
 * URL‑encoded, human‑readable calculator state. Only *public* fields are
 * encoded — we never share personally identifying information.
 */
export interface ShareableCalculatorState {
  gross: number;
  region?: "england-wales-ni" | "scotland";
  pension?: number;
  studentLoan?: ("plan1" | "plan2" | "plan4" | "plan5" | "postgrad")[];
}

export function encodeShareState(s: ShareableCalculatorState): string {
  const p = new URLSearchParams();
  p.set("gross", String(s.gross));
  if (s.region && s.region !== "england-wales-ni") p.set("region", s.region);
  if (s.pension) p.set("pension", String(s.pension));
  if (s.studentLoan?.length) p.set("sl", s.studentLoan.join(","));
  return p.toString();
}

export function decodeShareState(sp: URLSearchParams): ShareableCalculatorState {
  const gross = Number(sp.get("gross") ?? 0);
  const region = (sp.get("region") as ShareableCalculatorState["region"]) ?? "england-wales-ni";
  const pension = sp.get("pension") ? Number(sp.get("pension")) : undefined;
  const slRaw = sp.get("sl");
  const studentLoan = slRaw
    ? (slRaw.split(",").filter(Boolean) as ShareableCalculatorState["studentLoan"])
    : undefined;
  return { gross, region, pension, studentLoan };
}

export function shareLink(platform: SharePlatform, url: string, text: string): string {
  const enc = encodeURIComponent;
  switch (platform) {
    case "whatsapp":
      return `https://wa.me/?text=${enc(`${text} ${url}`)}`;
    case "x":
      return `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
    case "email":
      return `mailto:?subject=${enc(text)}&body=${enc(`${text}\n\n${url}`)}`;
    case "copy":
    case "native":
      return url;
  }
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
