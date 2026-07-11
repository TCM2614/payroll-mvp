import { describe, expect, it } from "vitest";
import { deriveComparisonInputs } from "../deriveComparisonInputs";

describe("deriveComparisonInputs", () => {
  it("passes day-rate scenarios straight through", () => {
    const r = deriveComparisonInputs({
      kind: "day-rate",
      dayRate: 500,
    });
    expect(r).not.toBeNull();
    expect(r!.dayRate).toBe(500);
    expect(r!.daysPerWeek).toBe(5);
    expect(r!.weeksWorkedPerYear).toBe(46);
  });

  it("converts hourly rate → equivalent day rate", () => {
    const r = deriveComparisonInputs({
      kind: "hourly-rate",
      hourlyRate: 50,
      hoursPerDay: 7.5,
    });
    expect(r).not.toBeNull();
    // 50 * 7.5 hours = £375/day, then normalised back to a day-rate that
    // produces the same annualised income at the shared working pattern.
    expect(r!.dayRate).toBeCloseTo(375, 4);
  });

  it("converts monthly rate → equivalent day rate at the default working pattern", () => {
    const r = deriveComparisonInputs({
      kind: "monthly-rate",
      monthlyRate: 6_000,
    });
    expect(r).not.toBeNull();
    // 6000 * 12 = £72,000 annual → 72_000 / (5 * 46) = £313.04/day
    expect(r!.dayRate).toBeCloseTo(72_000 / (5 * 46), 4);
  });

  it("converts annual income → equivalent day rate at the default working pattern", () => {
    const r = deriveComparisonInputs({
      kind: "annual-income",
      annualIncome: 72_000,
    });
    expect(r).not.toBeNull();
    expect(r!.dayRate).toBeCloseTo(72_000 / (5 * 46), 4);
  });

  it("honours custom daysPerWeek + weeksWorkedPerYear", () => {
    const r = deriveComparisonInputs({
      kind: "day-rate",
      dayRate: 500,
      daysPerWeek: 4,
      weeksWorkedPerYear: 42,
    });
    expect(r!.daysPerWeek).toBe(4);
    expect(r!.weeksWorkedPerYear).toBe(42);
  });

  it("returns null for zero or negative inputs", () => {
    expect(deriveComparisonInputs({ kind: "day-rate", dayRate: 0 })).toBeNull();
    expect(deriveComparisonInputs({ kind: "day-rate", dayRate: -10 })).toBeNull();
    expect(
      deriveComparisonInputs({ kind: "annual-income", annualIncome: 0 }),
    ).toBeNull();
    expect(
      deriveComparisonInputs({ kind: "hourly-rate", hourlyRate: 0 }),
    ).toBeNull();
  });

  it("threads through umbrella-fee and overheads overrides", () => {
    const r = deriveComparisonInputs({
      kind: "day-rate",
      dayRate: 500,
      umbrellaFeeWeekly: 15,
      outsideOverheadsAnnual: 2_500,
    });
    expect(r!.umbrellaFeeWeekly).toBe(15);
    expect(r!.outsideOverheadsAnnual).toBe(2_500);
  });
});
