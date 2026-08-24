import { describe, expect, it } from "vitest";
import {
  buildMultiJobInsight,
  multiJobPath,
  multiJobSlug,
  parseMultiJobSlug,
  MULTI_JOB_CATALOG,
} from "../multiJobInsight";

describe("buildMultiJobInsight (2026-27)", () => {
  it("computes combined net = sum of gross − tax − NI", () => {
    const r = buildMultiJobInsight({
      primaryAnnual: 30_000,
      secondaryAnnual: 10_000,
    });
    expect(r.combined.grossAnnual).toBe(40_000);
    const expectedNet =
      r.combined.grossAnnual -
      r.combined.incomeTax -
      r.combined.employeeNI -
      r.combined.studentLoan;
    // Allow a tiny rounding tolerance because the engine may round per-stream.
    expect(r.combined.netAnnual).toBeCloseTo(expectedNet, 0);
  });

  it("attaches a single-job equivalent for comparison", () => {
    const r = buildMultiJobInsight({
      primaryAnnual: 40_000,
      secondaryAnnual: 20_000,
    });
    expect(r.singleJobEquivalent.gross).toBe(60_000);
    expect(r.singleJobEquivalent.netAnnual).toBeGreaterThan(0);
    // NI is calculated per-employment, so the multi-job outcome typically
    // pays less NI than a single-employment 60k.
    expect(r.combined.employeeNI).toBeLessThan(
      r.singleJobEquivalent.employeeNI,
    );
    expect(r.vsSingleJob.niDelta).toBeLessThan(0);
  });

  it("second job on BR gets 20% flat tax", () => {
    const r = buildMultiJobInsight({
      primaryAnnual: 40_000,
      secondaryAnnual: 10_000,
      secondaryTaxCode: "BR",
    });
    // Second job of £10,000 taxed at BR should add approximately
    // £2,000 to total Income Tax vs a scenario where the second job is
    // absent — plus/minus the primary's PA allocation.
    const primaryOnly = buildMultiJobInsight({
      primaryAnnual: 40_000,
      secondaryAnnual: 0,
    });
    const delta = r.combined.incomeTax - primaryOnly.combined.incomeTax;
    // The BR band on the second job means the £10k → £2k tax bump.
    expect(delta).toBeCloseTo(2_000, -1);
  });

  it("slug helpers roundtrip", () => {
    expect(multiJobSlug(40_000, 20_000)).toBe("40k-plus-20k");
    expect(multiJobPath(40_000, 20_000)).toBe(
      "/multiple-jobs/40k-plus-20k",
    );
    expect(parseMultiJobSlug("40k-plus-20k")).toEqual({
      primary: 40_000,
      secondary: 20_000,
    });
    expect(parseMultiJobSlug("hello")).toBeNull();
    // Secondary must not exceed primary by convention.
    expect(parseMultiJobSlug("10k-plus-40k")).toBeNull();
  });

  it("every catalog entry has valid inputs", () => {
    for (const entry of MULTI_JOB_CATALOG) {
      expect(entry.primary).toBeGreaterThanOrEqual(entry.secondary);
      const r = buildMultiJobInsight({
        primaryAnnual: entry.primary,
        secondaryAnnual: entry.secondary,
        secondaryTaxCode: entry.secondaryTaxCode,
      });
      expect(r.combined.netAnnual).toBeGreaterThan(0);
    }
  });
});
