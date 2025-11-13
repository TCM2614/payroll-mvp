/**
 * Anonymous analytics utility for tracking calculator usage
 * 
 * Uses Plausible Analytics in production, no-op in development.
 * All events are fire-and-forget and contain no PII.
 */

type CalculatorTab = "standard" | "umbrella" | "limited" | "periodic";

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
 * Fire an analytics event (no-op in development)
 */
function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
): void {
  if (!isProduction()) {
    // No-op in development
    return;
  }

  // Fire-and-forget call to Plausible
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(eventName, { props });
  }
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

// Extend Window interface for Plausible
declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
  }
}

