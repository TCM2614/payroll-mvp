/**
 * UK tax constants for the 2025/26 tax year.
 *
 * Values here should originate from official HMRC / gov.uk documentation and
 * are treated as the single source of truth for the calculation engine.
 *
 * IMPORTANT: Never let the AI or content layer *compute* new tax facts.
 * Regulated financial values must be updated deliberately, in this file,
 * with a matching entry in the changelog below.
 *
 * Sources:
 *  - Income Tax rates & Personal Allowance:
 *    https://www.gov.uk/income-tax-rates
 *  - National Insurance (Class 1 employee, 2025/26):
 *    https://www.gov.uk/national-insurance-rates-letters
 *  - Scottish Income Tax bands 2025/26:
 *    https://www.gov.scot/publications/scottish-income-tax-2025-2026-factsheet/
 *  - Student loan thresholds & rates 2025/26:
 *    https://www.gov.uk/repaying-your-student-loan/what-you-pay
 *  - Dividend allowance & rates:
 *    https://www.gov.uk/tax-on-dividends
 *
 * Changelog:
 *  - 2025-04-06: 2025/26 values seeded (Personal Allowance frozen at £12,570,
 *    additional rate threshold £125,140, PA taper starts at £100,000, main NI
 *    rate 8% up to UEL, additional 2% above UEL).
 */

export type TaxYearId = "2025-26";

export const DEFAULT_TAX_YEAR: TaxYearId = "2025-26";

export interface IncomeTaxBand {
  /**
   * Inclusive lower bound expressed as a *gross* £ threshold, assuming full
   * Personal Allowance. The engine dynamically adjusts these thresholds when
   * PA is tapered above £100k so the additional‑rate threshold stays fixed at
   * `additionalRateThreshold` (£125,140 for 2025/26).
   */
  from: number;
  /** Exclusive upper bound in £ (gross). `Infinity` for the top band. */
  to: number;
  /** Marginal rate as a decimal (e.g. 0.2 = 20%). */
  rate: number;
  /** Human‑readable label used in UI/content. */
  label: string;
}

export interface IncomeTaxRegimeYear {
  personalAllowance: number;
  /** Income at which Personal Allowance starts to taper (£1 lost per £2 above). */
  paTaperStart: number;
  /** Additional‑rate threshold (income). */
  additionalRateThreshold: number;
  /**
   * Marginal bands expressed in *gross* income terms, assuming a full Personal
   * Allowance. The engine will taper PA and shift internal band boundaries
   * accordingly so the additional‑rate threshold remains fixed at
   * `additionalRateThreshold`.
   */
  bands: IncomeTaxBand[];
}

export interface NationalInsuranceYear {
  /** Primary Threshold — pay above this incurs main NI rate. */
  primaryThreshold: number;
  /** Upper Earnings Limit — pay above this uses the additional NI rate. */
  upperEarningsLimit: number;
  /** Employee Class 1 main rate (below UEL, above PT). */
  mainRate: number;
  /** Employee Class 1 additional rate (above UEL). */
  additionalRate: number;
}

export interface StudentLoanPlan {
  id: "plan1" | "plan2" | "plan4" | "plan5" | "postgrad";
  label: string;
  /** Annual repayment threshold in £. */
  threshold: number;
  /** Repayment rate as a decimal. */
  rate: number;
}

export interface DividendYear {
  allowance: number;
  basicRate: number;
  higherRate: number;
  additionalRate: number;
}

export interface CorporationTaxYear {
  smallProfitsRate: number;
  smallProfitsUpper: number;
  mainRate: number;
  mainRateLower: number;
  /** Marginal relief fraction (3/200 for 2025/26). */
  marginalReliefFraction: number;
}

export interface TaxYearConfig {
  id: TaxYearId;
  label: string;
  incomeTax: {
    ukRestOf: IncomeTaxRegimeYear;
    scotland: IncomeTaxRegimeYear;
  };
  nationalInsurance: NationalInsuranceYear;
  studentLoans: Record<StudentLoanPlan["id"], StudentLoanPlan>;
  dividends: DividendYear;
  corporationTax: CorporationTaxYear;
}

// Bands are expressed as *gross* thresholds relative to the bottom of the taxed
// portion (i.e. the top of a full Personal Allowance). See `applyBands` for how
// the engine folds a tapered PA back in.
const UK_REST_2025_26: IncomeTaxRegimeYear = {
  personalAllowance: 12_570,
  paTaperStart: 100_000,
  additionalRateThreshold: 125_140,
  bands: [
    // 12,570 → 50,270 (width 37,700) — Basic
    { from: 0, to: 37_700, rate: 0.2, label: "Basic rate" },
    // 50,270 → 125,140 (width 74,870) — Higher
    { from: 37_700, to: 112_570, rate: 0.4, label: "Higher rate" },
    // >125,140 — Additional
    { from: 112_570, to: Infinity, rate: 0.45, label: "Additional rate" },
  ],
};

// Scottish rates for 2025/26. Widths above PA:
//   starter  £12,570 → £15,397   (width 2,827) @ 19%
//   basic    £15,397 → £27,491   (width 12,094) @ 20%
//   intermed £27,491 → £43,662   (width 16,171) @ 21%
//   higher   £43,662 → £75,000   (width 31,338) @ 42%
//   advanced £75,000 → £125,140  (width 50,140) @ 45%
//   top      >£125,140                     @ 48%
const SCOTLAND_2025_26: IncomeTaxRegimeYear = {
  personalAllowance: 12_570,
  paTaperStart: 100_000,
  additionalRateThreshold: 125_140,
  bands: [
    { from: 0, to: 2_827, rate: 0.19, label: "Starter rate" },
    { from: 2_827, to: 14_921, rate: 0.2, label: "Basic rate" },
    { from: 14_921, to: 31_092, rate: 0.21, label: "Intermediate rate" },
    { from: 31_092, to: 62_430, rate: 0.42, label: "Higher rate" },
    { from: 62_430, to: 112_570, rate: 0.45, label: "Advanced rate" },
    { from: 112_570, to: Infinity, rate: 0.48, label: "Top rate" },
  ],
};

const NI_2025_26: NationalInsuranceYear = {
  primaryThreshold: 12_570,
  upperEarningsLimit: 50_270,
  mainRate: 0.08,
  additionalRate: 0.02,
};

const STUDENT_LOAN_2025_26: TaxYearConfig["studentLoans"] = {
  plan1: { id: "plan1", label: "Plan 1", threshold: 26_065, rate: 0.09 },
  plan2: { id: "plan2", label: "Plan 2", threshold: 28_470, rate: 0.09 },
  plan4: { id: "plan4", label: "Plan 4 (Scotland)", threshold: 32_745, rate: 0.09 },
  plan5: { id: "plan5", label: "Plan 5", threshold: 25_000, rate: 0.09 },
  postgrad: { id: "postgrad", label: "Postgraduate", threshold: 21_000, rate: 0.06 },
};

const DIVIDENDS_2025_26: DividendYear = {
  allowance: 500,
  basicRate: 0.0875,
  higherRate: 0.3375,
  additionalRate: 0.3935,
};

const CORP_TAX_2025_26: CorporationTaxYear = {
  smallProfitsRate: 0.19,
  smallProfitsUpper: 50_000,
  mainRate: 0.25,
  mainRateLower: 250_000,
  marginalReliefFraction: 3 / 200,
};

export const TAX_YEARS: Record<TaxYearId, TaxYearConfig> = {
  "2025-26": {
    id: "2025-26",
    label: "2025/26",
    incomeTax: {
      ukRestOf: UK_REST_2025_26,
      scotland: SCOTLAND_2025_26,
    },
    nationalInsurance: NI_2025_26,
    studentLoans: STUDENT_LOAN_2025_26,
    dividends: DIVIDENDS_2025_26,
    corporationTax: CORP_TAX_2025_26,
  },
};

export function getTaxYear(id: TaxYearId = DEFAULT_TAX_YEAR): TaxYearConfig {
  const y = TAX_YEARS[id];
  if (!y) throw new Error(`Unknown tax year: ${id}`);
  return y;
}
