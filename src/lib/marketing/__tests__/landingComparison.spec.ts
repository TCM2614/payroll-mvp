import { describe, expect, it } from "vitest";
import { computeLandingComparison } from "../landingComparison";

describe("computeLandingComparison — landing-page marketing strip", () => {
  it("returns exactly four scenarios covering all engagement types", () => {
    const c = computeLandingComparison();
    expect(c.scenarios).toHaveLength(4);
    expect(c.scenarios.map((s) => s.key)).toEqual([
      "paye",
      "umbrella",
      "limited-inside",
      "limited-outside",
    ]);
  });

  it("computes strictly positive net take-home for every scenario at the default day rate", () => {
    const c = computeLandingComparison();
    for (const s of c.scenarios) {
      expect(s.netAnnual).toBeGreaterThan(0);
      expect(s.netMonthly).toBeGreaterThan(0);
      expect(s.effectiveTaxRate).toBeGreaterThan(0);
      expect(s.effectiveTaxRate).toBeLessThan(1);
    }
  });

  it("uses PAYE as the delta baseline (delta = 0 for the PAYE row)", () => {
    const c = computeLandingComparison();
    const paye = c.scenarios.find((s) => s.key === "paye");
    expect(paye).toBeDefined();
    expect(paye!.deltaVsPayeAnnual).toBe(0);
  });

  it("identifies a best and worst scenario with a non-negative gap", () => {
    const c = computeLandingComparison();
    expect(c.bestVsWorstAnnual).toBeGreaterThanOrEqual(0);
    const best = c.scenarios.find((s) => s.key === c.bestScenarioKey);
    const worst = c.scenarios.find((s) => s.key === c.worstScenarioKey);
    expect(best).toBeDefined();
    expect(worst).toBeDefined();
    expect(best!.netAnnual).toBeGreaterThanOrEqual(worst!.netAnnual);
  });

  it("adapts when the day-rate assumption changes", () => {
    const low = computeLandingComparison({ dayRate: 250 });
    const high = computeLandingComparison({ dayRate: 800 });
    expect(low.headlineDayRate).toBe(250);
    expect(high.headlineDayRate).toBe(800);
    // Higher rate should produce higher net take-home in every scenario.
    for (const key of ["paye", "umbrella", "limited-inside", "limited-outside"] as const) {
      const l = low.scenarios.find((s) => s.key === key)!;
      const h = high.scenarios.find((s) => s.key === key)!;
      expect(h.netAnnual).toBeGreaterThan(l.netAnnual);
    }
  });

  it("labels every scenario with its IR35 regime", () => {
    const c = computeLandingComparison();
    const regimes = c.scenarios.map((s) => `${s.key}:${s.regime}`);
    expect(regimes).toEqual([
      "paye:PAYE",
      "umbrella:Inside IR35",
      "limited-inside:Inside IR35",
      "limited-outside:Outside IR35",
    ]);
  });
});
