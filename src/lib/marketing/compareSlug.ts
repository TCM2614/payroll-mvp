/**
 * Parsing / formatting for the `/compare/[slug]` share URLs.
 *
 * Slugs are human-readable, hyphen-separated, and target long-tail
 * queries like "£500 a day umbrella vs limited". Supported shapes:
 *
 *   500-a-day        → dayRate = 500
 *   600-a-day        → dayRate = 600
 *   50-per-hour      → hourlyRate = 50 (with hoursPerDay = 7.5)
 *   6000-a-month     → monthlyRate = 6000
 *   120000-a-year    → derived dayRate = 120000 / (5 · 46)
 *
 * Anything else returns null and the caller should 404.
 */

import type { ComparisonScenarioInputs } from "./landingComparison";

export interface ParsedCompareSlug {
  /** Canonical display of the rate for headings ("£500 / day"). */
  display: string;
  /** Compact display for meta / OG copy ("£500/day"). */
  compactDisplay: string;
  /** Rate cadence for the marketing copy. */
  cadence: "day" | "hour" | "month" | "year";
  /** Numeric rate in the parsed cadence unit. */
  rateValue: number;
  /** Rendered per-year assignment income assumption. */
  annualAssignment: number;
  /** Comparison inputs suitable for `computeLandingComparison`. */
  inputs: Partial<ComparisonScenarioInputs>;
  /** Hint copy for the strip's context line ("Based on 5 days × 46 weeks"). */
  workingPatternHint: string;
}

const DAYS_PER_WEEK = 5;
const WEEKS_PER_YEAR = 46;
const HOURS_PER_DAY = 7.5;
const MONTHS_PER_YEAR = 12;

// Guardrails — reject nonsense values so bots can't rank arbitrary URLs.
const MIN_DAY_RATE = 50;
const MAX_DAY_RATE = 5_000;
const MIN_HOURLY = 5;
const MAX_HOURLY = 1_000;
const MIN_MONTHLY = 1_000;
const MAX_MONTHLY = 100_000;
const MIN_ANNUAL = 12_000;
const MAX_ANNUAL = 1_500_000;

function formatGBP(amount: number): string {
  return `£${Math.round(amount).toLocaleString("en-GB")}`;
}

/**
 * Turn a URL slug into a validated ParsedCompareSlug, or null when the
 * slug doesn't match one of the supported shapes / falls outside the
 * guardrails.
 */
export function parseCompareSlug(slug: string): ParsedCompareSlug | null {
  const normalised = slug.trim().toLowerCase();
  if (!normalised) return null;

  const dayMatch = normalised.match(/^(\d{2,5})(?:-|_)?(?:a|per)?-day$/);
  if (dayMatch) {
    const value = Number(dayMatch[1]);
    if (!Number.isFinite(value) || value < MIN_DAY_RATE || value > MAX_DAY_RATE) {
      return null;
    }
    return buildFromDayRate(value);
  }

  const hourMatch = normalised.match(/^(\d{1,4})(?:-|_)?(?:an|per|a)?-hour$/);
  if (hourMatch) {
    const value = Number(hourMatch[1]);
    if (!Number.isFinite(value) || value < MIN_HOURLY || value > MAX_HOURLY) {
      return null;
    }
    const dayEquivalent = value * HOURS_PER_DAY;
    return {
      display: `${formatGBP(value)} / hour`,
      compactDisplay: `${formatGBP(value)}/hour`,
      cadence: "hour",
      rateValue: value,
      annualAssignment: dayEquivalent * DAYS_PER_WEEK * WEEKS_PER_YEAR,
      inputs: {
        dayRate: dayEquivalent,
        daysPerWeek: DAYS_PER_WEEK,
        weeksWorkedPerYear: WEEKS_PER_YEAR,
      },
      workingPatternHint: `${HOURS_PER_DAY} hours per day × ${DAYS_PER_WEEK} days per week × ${WEEKS_PER_YEAR} weeks`,
    };
  }

  const monthMatch = normalised.match(/^(\d{4,6})(?:-|_)?(?:a|per)?-month$/);
  if (monthMatch) {
    const value = Number(monthMatch[1]);
    if (!Number.isFinite(value) || value < MIN_MONTHLY || value > MAX_MONTHLY) {
      return null;
    }
    const annual = value * MONTHS_PER_YEAR;
    // Convert to an equivalent day rate for the comparison model — the
    // engines all speak day rates internally, and this keeps the outputs
    // apples-to-apples across cadences.
    const dayEquivalent = annual / (DAYS_PER_WEEK * WEEKS_PER_YEAR);
    return {
      display: `${formatGBP(value)} / month`,
      compactDisplay: `${formatGBP(value)}/month`,
      cadence: "month",
      rateValue: value,
      annualAssignment: annual,
      inputs: {
        dayRate: dayEquivalent,
        daysPerWeek: DAYS_PER_WEEK,
        weeksWorkedPerYear: WEEKS_PER_YEAR,
      },
      workingPatternHint: `${formatGBP(value)} monthly retainer over ${MONTHS_PER_YEAR} months`,
    };
  }

  const yearMatch = normalised.match(/^(\d{5,7})(?:-|_)?(?:a|per)?-year$/);
  if (yearMatch) {
    const value = Number(yearMatch[1]);
    if (!Number.isFinite(value) || value < MIN_ANNUAL || value > MAX_ANNUAL) {
      return null;
    }
    const dayEquivalent = value / (DAYS_PER_WEEK * WEEKS_PER_YEAR);
    return {
      display: `${formatGBP(value)} / year`,
      compactDisplay: `${formatGBP(value)}/year`,
      cadence: "year",
      rateValue: value,
      annualAssignment: value,
      inputs: {
        dayRate: dayEquivalent,
        daysPerWeek: DAYS_PER_WEEK,
        weeksWorkedPerYear: WEEKS_PER_YEAR,
      },
      workingPatternHint: `${formatGBP(value)} annual assignment over ${DAYS_PER_WEEK} days × ${WEEKS_PER_YEAR} weeks`,
    };
  }

  return null;
}

function buildFromDayRate(dayRate: number): ParsedCompareSlug {
  return {
    display: `${formatGBP(dayRate)} / day`,
    compactDisplay: `${formatGBP(dayRate)}/day`,
    cadence: "day",
    rateValue: dayRate,
    annualAssignment: dayRate * DAYS_PER_WEEK * WEEKS_PER_YEAR,
    inputs: {
      dayRate,
      daysPerWeek: DAYS_PER_WEEK,
      weeksWorkedPerYear: WEEKS_PER_YEAR,
    },
    workingPatternHint: `${DAYS_PER_WEEK} days per week × ${WEEKS_PER_YEAR} billable weeks per year`,
  };
}

/**
 * Canonical set of slugs we want Google to index. Kept intentionally
 * small — this is a marketing surface, not an infinite long tail — but
 * covers the highest-volume day-rate queries.
 */
export const CANONICAL_COMPARE_SLUGS: string[] = [
  "300-a-day",
  "400-a-day",
  "500-a-day",
  "600-a-day",
  "700-a-day",
  "750-a-day",
  "1000-a-day",
  "40-per-hour",
  "50-per-hour",
  "70-per-hour",
  "75-per-hour",
  "100-per-hour",
  "5000-a-month",
  "8000-a-month",
  "10000-a-month",
];
