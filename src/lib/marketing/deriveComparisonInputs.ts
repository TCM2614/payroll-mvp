/**
 * Helpers for taking a calculator's own inputs (day / hour / month rate,
 * or an already-computed annual gross) and turning them into the
 * `ComparisonScenarioInputs` shape that the shared take-home comparison
 * engine expects.
 *
 * Keeps every calculator's "keep the strip in sync with my inputs" wiring
 * a one-liner without duplicating the cadence-conversion math.
 */

import type { ComparisonScenarioInputs } from "./landingComparison";

export const COMPARISON_DEFAULTS = {
  daysPerWeek: 5,
  weeksWorkedPerYear: 46,
  hoursPerDay: 7.5,
  umbrellaFeeWeekly: 25,
  outsideOverheadsAnnual: 1_200,
} as const;

interface RateInputBase {
  /** Days worked per week. Defaults to 5. */
  daysPerWeek?: number;
  /** Billable weeks worked per year. Defaults to 46. */
  weeksWorkedPerYear?: number;
  /** Umbrella-fee assumption for the umbrella card. Defaults to £25/week. */
  umbrellaFeeWeekly?: number;
  /** Overheads assumption for the outside-IR35 card. Defaults to £1,200/yr. */
  outsideOverheadsAnnual?: number;
}

interface DayRateInput extends RateInputBase {
  kind: "day-rate";
  dayRate: number;
}

interface HourlyRateInput extends RateInputBase {
  kind: "hourly-rate";
  hourlyRate: number;
  hoursPerDay?: number;
}

interface MonthlyRateInput extends RateInputBase {
  kind: "monthly-rate";
  monthlyRate: number;
}

interface AnnualIncomeInput extends RateInputBase {
  kind: "annual-income";
  annualIncome: number;
}

export type CalculatorRateInput =
  | DayRateInput
  | HourlyRateInput
  | MonthlyRateInput
  | AnnualIncomeInput;

/**
 * Convert whichever rate cadence a calculator is expressed in into a
 * `ComparisonScenarioInputs` — normalising to an equivalent day rate at
 * a shared working pattern so the four scenarios can be compared apples
 * to apples. Returns null when the input is missing / non-positive; the
 * caller should hide the strip in that case.
 */
export function deriveComparisonInputs(
  input: CalculatorRateInput,
): Partial<ComparisonScenarioInputs> | null {
  const daysPerWeek = safePositive(
    input.daysPerWeek,
    COMPARISON_DEFAULTS.daysPerWeek,
  );
  const weeksWorkedPerYear = safePositive(
    input.weeksWorkedPerYear,
    COMPARISON_DEFAULTS.weeksWorkedPerYear,
  );

  const base = {
    daysPerWeek,
    weeksWorkedPerYear,
    umbrellaFeeWeekly:
      input.umbrellaFeeWeekly ?? COMPARISON_DEFAULTS.umbrellaFeeWeekly,
    outsideOverheadsAnnual:
      input.outsideOverheadsAnnual ??
      COMPARISON_DEFAULTS.outsideOverheadsAnnual,
  };

  const annualAssignment = resolveAnnualAssignment(
    input,
    daysPerWeek,
    weeksWorkedPerYear,
  );
  if (!annualAssignment || annualAssignment <= 0) return null;

  const dayRate = annualAssignment / (daysPerWeek * weeksWorkedPerYear);
  if (!Number.isFinite(dayRate) || dayRate <= 0) return null;

  return { ...base, dayRate };
}

function resolveAnnualAssignment(
  input: CalculatorRateInput,
  daysPerWeek: number,
  weeksWorkedPerYear: number,
): number {
  switch (input.kind) {
    case "day-rate":
      return positive(input.dayRate) * daysPerWeek * weeksWorkedPerYear;
    case "hourly-rate": {
      const hoursPerDay = safePositive(
        input.hoursPerDay,
        COMPARISON_DEFAULTS.hoursPerDay,
      );
      return (
        positive(input.hourlyRate) *
        hoursPerDay *
        daysPerWeek *
        weeksWorkedPerYear
      );
    }
    case "monthly-rate":
      return positive(input.monthlyRate) * 12;
    case "annual-income":
      return positive(input.annualIncome);
  }
}

function positive(value: unknown): number {
  const n = typeof value === "number" ? value : NaN;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function safePositive(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return value;
}
