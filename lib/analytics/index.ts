/**
 * Privacy‑conscious analytics abstraction.
 *
 * The application never transmits raw salary, tax code, employer information
 * or other personally‑identifiable financial data. Instead, salary values are
 * bucketed into bands and only anonymous, aggregate signals are recorded.
 *
 * Providers are pluggable via a runtime adapter registered on `window`. If no
 * adapter is registered (e.g. the visitor has not consented, or an ad blocker
 * is active) events are silently no‑opped. This keeps growth measurement
 * cheap and safe by default.
 *
 * See `docs/growth/analytics-spec.md` for the full event catalogue.
 */

import type { GrowthEventName, GrowthEventProperties } from "./events";

type Provider = {
  name: string;
  track: (event: GrowthEventName, properties?: GrowthEventProperties) => void;
  identify?: (id: string, traits?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    __ukthc_analytics__?: Provider;
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
    gtag?: (
      command: "event",
      event: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

/** Coarse salary bands used everywhere salary is worth bucketing. */
export const SALARY_BANDS = [
  { max: 20_000, label: "<£20k" },
  { max: 30_000, label: "£20–30k" },
  { max: 40_000, label: "£30–40k" },
  { max: 50_000, label: "£40–50k" },
  { max: 60_000, label: "£50–60k" },
  { max: 75_000, label: "£60–75k" },
  { max: 100_000, label: "£75–100k" },
  { max: 125_000, label: "£100–125k" },
  { max: 150_000, label: "£125–150k" },
  { max: Infinity, label: "£150k+" },
] as const;

export function salaryBand(salary: number): string {
  return SALARY_BANDS.find((b) => salary < b.max)?.label ?? "£150k+";
}

/**
 * Redact anything that looks salary/financial‑identifying. This is defensive:
 * an event that ships gross/net through by mistake gets bucketed here.
 */
function scrubProperties(properties?: GrowthEventProperties): GrowthEventProperties | undefined {
  if (!properties) return undefined;
  const scrubbed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === "number" && /salary|gross|net|monthly|weekly|annual/i.test(key)) {
      scrubbed[`${key}_band`] = salaryBand(value);
    } else {
      scrubbed[key] = value;
    }
  }
  return scrubbed as GrowthEventProperties;
}

export function trackEvent(
  event: GrowthEventName,
  properties?: GrowthEventProperties,
): void {
  if (typeof window === "undefined") return;
  const cleaned = scrubProperties(properties);
  try {
    if (window.__ukthc_analytics__?.track) {
      window.__ukthc_analytics__.track(event, cleaned);
      return;
    }
    if (window.plausible) {
      window.plausible(event, { props: cleaned as Record<string, unknown> });
      return;
    }
    if (window.gtag) {
      window.gtag("event", event, cleaned as Record<string, unknown>);
      return;
    }
  } catch {
    /* analytics never throws into product code */
  }
}

/** Register a custom analytics provider (called from a top‑level script). */
export function registerAnalyticsProvider(provider: Provider): void {
  if (typeof window !== "undefined") {
    window.__ukthc_analytics__ = provider;
  }
}
