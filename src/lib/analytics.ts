/**
 * Anonymous analytics utility for tracking calculator usage
 * 
 * Uses Plausible Analytics in production, no-op in development.
 * All events are fire-and-forget and contain no PII.
 */

type CalculatorTab =
  | "standard"
  | "umbrella"
  | "limited"
  | "limited-outside"
  | "periodic";

type SalaryBand = "<30k" | "30-60k" | "60-100k" | ">100k";

type WarningSeverity = "info" | "warning" | "critical";

type WarningCode =
  | "potential_overtax_mid_year"
  | "potential_undertax_mid_year"
  | "non_cumulative_code_detected"
  | "emergency_tax_code_pattern"
  | "multiple_jobs_or_irregular_income_possible";

/**
 * Determine salary band from annual gross income
 */
export function getSalaryBand(annualGross: number): SalaryBand {
  if (annualGross < 30000) {
    return "<30k";
  }
  if (annualGross < 60000) {
    return "30-60k";
  }
  if (annualGross < 100000) {
    return "60-100k";
  }
  return ">100k";
}

/**
 * Check if we're in production environment
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Sanitised list of UTM parameters we care about. Kept small and
 * hand-selected — nothing PII, nothing arbitrary — because Plausible custom
 * props have a limit on distinct values per property.
 */
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;
type UtmKey = (typeof UTM_KEYS)[number];

/**
 * Read the current page's UTM parameters. Only called from the browser;
 * returns an empty object on the server or when no UTM tags are present.
 * Values are truncated to 60 characters to guard against absurd inputs.
 */
export function readUtmParams(): Partial<Record<UtmKey, string>> {
  if (typeof window === "undefined") return {};
  try {
    const search = new URLSearchParams(window.location.search);
    const out: Partial<Record<UtmKey, string>> = {};
    for (const key of UTM_KEYS) {
      const raw = search.get(key);
      if (raw) out[key] = raw.slice(0, 60);
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Fire an analytics event (no-op in development)
 *
 * @param name - Event name
 * @param props - Optional event properties
 *
 * UTM parameters from the current URL are attached automatically so we
 * can attribute conversions to acquisition sources without adding UTM
 * plumbing to every call-site.
 */
export function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV !== "production") {
    // Optional: console.log(name, props);
    return;
  }

  const utm = readUtmParams();
  const merged: Record<string, string | number | boolean> = {
    ...(props ?? {}),
    ...utm,
  };

  // Fire-and-forget call to Plausible
  window.plausible?.(name, { props: merged });
}

/**
 * Track when user submits a calculation on any tab
 */
export function trackCalculatorSubmit(params: {
  tab: CalculatorTab;
  hasPension: boolean;
  hasStudentLoan: boolean;
  salaryBand: SalaryBand;
}): void {
  trackEvent("calculator_submit", {
    tab: params.tab,
    hasPension: params.hasPension,
    hasStudentLoan: params.hasStudentLoan,
    salaryBand: params.salaryBand,
  });
}

/**
 * Track when results section successfully renders
 */
export function trackResultsView(): void {
  trackEvent("results_view");
}

/**
 * Track when a warning is shown to the user
 */
export function trackWarningShown(params: {
  code: WarningCode | string;
  severity: WarningSeverity;
  tab: CalculatorTab;
}): void {
  trackEvent("warning_shown", {
    code: params.code,
    severity: params.severity,
    tab: params.tab,
  });
}

/**
 * Track when periodic tax analysis is used (actual tax paid entered)
 */
export function trackPeriodicAnalysisUsed(): void {
  trackEvent("periodic_analysis_used");
}

/**
 * Track calculator run goal
 */
export function trackCalculatorRun(tab: CalculatorTab): void {
  trackEvent("calculator_run", { tab });
}

/**
 * Track CTA click goal
 */
export function trackCTAClick(ctaName: string, location?: string): void {
  trackEvent("cta_click", { cta: ctaName, location: location || "unknown" });
}

/**
 * Marketing: fire when the "See the difference" landing strip enters the
 * viewport for the first time in a session. Attached via IntersectionObserver
 * so we can measure how many landing-page visitors actually see it.
 */
export function trackComparisonStripView(source: string): void {
  trackEvent("comparison_strip_view", { source });
}

/**
 * Marketing: fire when a visitor clicks the "Model your own rate" CTA
 * (or an equivalent) on the comparison strip. This is the strip's
 * conversion event.
 */
export function trackComparisonStripCta(source: string): void {
  trackEvent("comparison_strip_cta_click", { source });
}

// Extend Window interface for Plausible
declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
  }
}

