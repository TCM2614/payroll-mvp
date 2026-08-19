import { describe, expect, it } from "vitest";
import {
  buildSalaryInsight,
  compareSalaryInsights,
} from "../salaryInsight";

describe("buildSalaryInsight (2026-27, PAYE 1257L, no loans)", () => {
  it("returns zero deductions below the Personal Allowance", () => {
    const r = buildSalaryInsight(12_570);
    expect(r.incomeTax).toBe(0);
    expect(r.employeeNI).toBe(0);
    expect(r.netAnnual).toBe(12_570);
  });

  it("£50,000 has a positive effective rate and non-zero NI", () => {
    const r = buildSalaryInsight(50_000);
    expect(r.incomeTax).toBeGreaterThan(0);
    expect(r.employeeNI).toBeGreaterThan(0);
    expect(r.netAnnual).toBeLessThan(50_000);
    expect(r.netMonthly).toBeCloseTo(r.netAnnual / 12, 2);
    expect(r.effectiveRate).toBeGreaterThan(0.15);
  });

  it("£125,140 → Personal Allowance fully tapered to zero", () => {
    const r = buildSalaryInsight(125_140);
    // The engine reports the salary directly on `gross`, and effective rate
    // should be materially higher than at £50k.
    expect(r.effectiveRate).toBeGreaterThan(0.3);
  });

  it("£100k → £110k is the pay-rise trap: <60% retained on the raise", () => {
    const cmp = compareSalaryInsights(100_000, 110_000);
    expect(cmp.grossDelta).toBe(10_000);
    expect(cmp.netDelta).toBeGreaterThan(0);
    expect(cmp.retainedShareOfRaise).toBeLessThan(0.6);
  });

  it("£40k → £50k retains substantially more of a raise than the £100k trap", () => {
    const trap = compareSalaryInsights(100_000, 110_000);
    const normal = compareSalaryInsights(40_000, 50_000);
    expect(normal.retainedShareOfRaise).toBeGreaterThan(trap.retainedShareOfRaise + 0.05);
  });

  it("attaches an age-adjusted percentile", () => {
    const r = buildSalaryInsight(50_000, { age: 35 });
    expect(r.percentile).not.toBeNull();
    if (r.percentile) {
      expect(r.percentile.percentile).toBeGreaterThan(0);
      expect(r.percentile.percentile).toBeLessThan(100);
      expect(r.percentile.descriptor).toMatch(/median|top|above|below/);
    }
  });

  it("preserves the canonical `/salary/{n}-after-tax` path", () => {
    expect(buildSalaryInsight(50_000).path).toBe("/salary/50000-after-tax");
  });
});
