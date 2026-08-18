import { describe, expect, it } from "vitest";
import {
  applyBands,
  calculatePaye,
  convertToAnnual,
  getTaxYear,
  nationalInsurance,
  studentLoanRepayment,
  taperedPersonalAllowance,
} from "../";

const cfg = getTaxYear("2025-26");

/**
 * Regression tests for the deterministic UK tax engine.
 *
 * These values are the mathematical output of the 2025/26 configuration in
 * `constants.ts`. If HMRC rates change, both the constants and these values
 * must be updated together.
 */
describe("2025/26 Personal Allowance", () => {
  it("is £12,570 below the taper", () => {
    expect(taperedPersonalAllowance(50_000, cfg.incomeTax.ukRestOf)).toBe(12_570);
  });
  it("tapers by £1 per £2 above £100k", () => {
    expect(taperedPersonalAllowance(110_000, cfg.incomeTax.ukRestOf)).toBe(7_570);
  });
  it("is fully removed at £125,140", () => {
    expect(taperedPersonalAllowance(125_140, cfg.incomeTax.ukRestOf)).toBe(0);
  });
  it("stays at zero above £125,140", () => {
    expect(taperedPersonalAllowance(200_000, cfg.incomeTax.ukRestOf)).toBe(0);
  });
});

describe("Income Tax bands (rUK)", () => {
  it("no tax on £12,570", () => {
    const r = calculatePaye({ grossAnnual: 12_570 });
    expect(r.incomeTax).toBe(0);
  });
  it("£30,000 → basic rate only", () => {
    const r = calculatePaye({ grossAnnual: 30_000 });
    // Taxable = 30,000 - 12,570 = 17,430 × 20% = 3,486
    expect(r.incomeTax).toBeCloseTo(3_486, 2);
  });
  it("£50,000 → basic rate cliff", () => {
    const r = calculatePaye({ grossAnnual: 50_000 });
    // Taxable = 37,430 × 20% = 7,486
    expect(r.incomeTax).toBeCloseTo(7_486, 2);
  });
  it("£60,000 → straddles higher rate", () => {
    const r = calculatePaye({ grossAnnual: 60_000 });
    // 37,700 × 20% = 7,540; (60,000-12,570-37,700)=9,730 × 40% = 3,892
    expect(r.incomeTax).toBeCloseTo(7_540 + 3_892, 2);
  });
  it("£100,000 → no taper yet", () => {
    const r = calculatePaye({ grossAnnual: 100_000 });
    // 7,540 + (100,000-12,570-37,700)=49,730 × 40% = 19,892 → 27,432
    expect(r.personalAllowance).toBe(12_570);
    expect(r.incomeTax).toBeCloseTo(27_432, 2);
  });
  it("£125,140 → PA fully removed", () => {
    const r = calculatePaye({ grossAnnual: 125_140 });
    expect(r.personalAllowance).toBe(0);
    // Taxable = 125,140. First 37,700 @20%, next 87,440 @ 40% = 7,540 + 34,976 = 42,516
    expect(r.incomeTax).toBeCloseTo(42_516, 2);
  });
});

describe("National Insurance (Class 1 employee, 2025/26)", () => {
  it("no NI below primary threshold", () => {
    expect(nationalInsurance(12_570, cfg)).toBe(0);
  });
  it("main rate 8% between PT and UEL", () => {
    // (50,270 - 12,570) × 8% = 3,016
    expect(nationalInsurance(50_270, cfg)).toBeCloseTo(3_016, 2);
  });
  it("additional 2% above UEL", () => {
    // 3,016 + (100,000-50,270)×2% = 3,016 + 994.60 = 4,010.60
    expect(nationalInsurance(100_000, cfg)).toBeCloseTo(4_010.6, 2);
  });
});

describe("Student loans", () => {
  it("Plan 2 kicks in above £28,470 at 9%", () => {
    // (40,000 - 28,470) × 9% = 1,037.70
    expect(studentLoanRepayment(40_000, ["plan2"], cfg)).toBeCloseTo(1_037.7, 2);
  });
  it("Postgrad stacks on top of Plan 2", () => {
    // Plan2 as above + (40,000-21,000)×6% = 1,037.7 + 1,140 = 2,177.70
    expect(studentLoanRepayment(40_000, ["plan2", "postgrad"], cfg)).toBeCloseTo(2_177.7, 2);
  });
  it("Below all thresholds → 0", () => {
    expect(studentLoanRepayment(20_000, ["plan2"], cfg)).toBe(0);
  });
});

describe("End‑to‑end take‑home", () => {
  it("£50,000 rUK → known net", () => {
    const r = calculatePaye({ grossAnnual: 50_000 });
    // Tax 7,486 + NI (50,000-12,570)*.08 = 2,994.4  → net 39,519.60
    expect(r.nationalInsurance).toBeCloseTo(2_994.4, 2);
    expect(r.netAnnual).toBeCloseTo(50_000 - 7_486 - 2_994.4, 2);
  });
  it("Scotland vs rUK diverges at higher rates", () => {
    const scot = calculatePaye({ grossAnnual: 60_000, region: "scotland" });
    const uk = calculatePaye({ grossAnnual: 60_000 });
    expect(scot.incomeTax).toBeGreaterThan(uk.incomeTax);
  });
  it("Salary sacrifice reduces both tax and NI", () => {
    const base = calculatePaye({ grossAnnual: 50_000 });
    const sac = calculatePaye({ grossAnnual: 50_000, pensionSalarySacrifice: 0.05 });
    expect(sac.incomeTax).toBeLessThan(base.incomeTax);
    expect(sac.nationalInsurance).toBeLessThan(base.nationalInsurance);
    expect(sac.pension.salarySacrifice).toBe(2_500);
  });
  it("Effective marginal rate spikes between £100k and £125,140", () => {
    const at90 = calculatePaye({ grossAnnual: 90_000 });
    const at100 = calculatePaye({ grossAnnual: 100_000 });
    const at110 = calculatePaye({ grossAnnual: 110_000 });
    const at120 = calculatePaye({ grossAnnual: 120_000 });
    const trapDelta = (at110.netAnnual - at100.netAnnual) / (110_000 - 100_000);
    const preTrapDelta = (at100.netAnnual - at90.netAnnual) / (100_000 - 90_000);
    // £1 earned inside the trap should keep noticeably less than a £1 earned just below.
    expect(trapDelta).toBeLessThan(preTrapDelta - 0.15);
    // And still less than the next £10k above the trap.
    expect(at120.effectiveRate).toBeGreaterThan(at90.effectiveRate);
  });
});

describe("Period conversion", () => {
  it("hourly → annual assumes 37.5h × 52w", () => {
    expect(convertToAnnual(20, "hourly")).toBe(20 * 52 * 37.5);
  });
  it("daily → annual assumes 260 working days", () => {
    expect(convertToAnnual(500, "daily")).toBe(130_000);
  });
  it("monthly → annual is ×12", () => {
    expect(convertToAnnual(3_000, "monthly")).toBe(36_000);
  });
});

describe("applyBands sanity", () => {
  it("basic band only", () => {
    const r = applyBands(10_000, cfg.incomeTax.ukRestOf);
    expect(r.total).toBeCloseTo(2_000, 2);
    expect(r.marginalRate).toBe(0.2);
  });
});
