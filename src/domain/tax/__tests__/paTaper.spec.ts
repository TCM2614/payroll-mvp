/**
 * Regression coverage for the £100k+ personal-allowance taper.
 *
 * Historically `calculateAnnualTax` computed a tapered PA but then
 * overwrote it with the tax-code-derived PA — so anyone with a standard
 * "1257L" code above £100k silently skipped the taper. The bug surfaced
 * when comparing the Standard PAYE and Limited (Inside IR35) calculators
 * for the same £115k assignment (they should agree; they didn't).
 */

import { describe, expect, it } from "vitest";
import { calculateAnnualTax, createUK2026Config } from "../periodTax";

const config = createUK2026Config();

describe("calculateAnnualTax — personal allowance taper", () => {
  it("uses the full personal allowance below £100k on 1257L", () => {
    const res = calculateAnnualTax({
      grossAnnualIncome: 80_000,
      taxCode: "1257L",
      config,
    });
    // Taxable = 80,000 − 12,570 = 67,430; PAYE = 37,700·0.20 + 29,730·0.40
    // = 7,540 + 11,892 = 19,432.
    expect(res.annualPAYE).toBeCloseTo(19_432, 0);
  });

  it("tapers the personal allowance between £100k and £125,140 on 1257L", () => {
    // At £115k, PA reduction = (115,000 − 100,000)/2 = 7,500 → PA = 5,070.
    // Taxable = 115,000 − 5,070 = 109,930.
    // PAYE = 37,700·0.20 + (109,930 − 37,700)·0.40 = 7,540 + 28,892 = 36,432.
    const res = calculateAnnualTax({
      grossAnnualIncome: 115_000,
      taxCode: "1257L",
      config,
    });
    expect(res.annualPAYE).toBeCloseTo(36_432, 0);
  });

  it("fully removes the personal allowance at £125,140 on 1257L", () => {
    const res = calculateAnnualTax({
      grossAnnualIncome: 125_140,
      taxCode: "1257L",
      config,
    });
    // With PA = 0, taxable = 125,140; PAYE = 37,700·0.20 + (125,140 − 37,700)·0.40
    // = 7,540 + 34,976 = 42,516.
    expect(res.annualPAYE).toBeCloseTo(42_516, 0);
  });

  it("keeps the additional-rate band intact above £125,140", () => {
    const res = calculateAnnualTax({
      grossAnnualIncome: 150_000,
      taxCode: "1257L",
      config,
    });
    // PA fully tapered. Taxable = 150,000.
    // PAYE = 37,700·0.20 + (125,140 − 37,700)·0.40 + (150,000 − 125,140)·0.45
    // = 7,540 + 34,976 + 11,187 = 53,703.
    expect(res.annualPAYE).toBeCloseTo(53_703, 0);
  });

  it("agrees with calcPAYECombined for the same 1257L salary in the taper band", async () => {
    // Domain and library engines should agree — that's the invariant the
    // taper bug used to break. Import lazily so this file stays framework-
    // agnostic to bundling order.
    const { calcPAYECombined } = await import("@/lib/calculators/paye");
    const combined = calcPAYECombined({
      streams: [
        {
          id: "primary",
          label: "Primary",
          frequency: "monthly",
          amount: 115_000 / 12,
          taxCode: "1257L",
        },
      ],
      taxYear: "2026-27",
    });
    const annual = calculateAnnualTax({
      grossAnnualIncome: 115_000,
      taxCode: "1257L",
      config,
    });
    expect(annual.annualPAYE).toBeCloseTo(combined.totalIncomeTax, 0);
    expect(annual.annualNI).toBeCloseTo(combined.totalEmployeeNI, 0);
  });
});
