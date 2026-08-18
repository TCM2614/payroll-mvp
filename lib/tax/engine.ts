import {
  DEFAULT_TAX_YEAR,
  type IncomeTaxRegimeYear,
  type StudentLoanPlan,
  type TaxYearConfig,
  type TaxYearId,
  getTaxYear,
} from "./constants";

/**
 * Deterministic UK take‑home / tax engine.
 *
 * All monetary values are in whole pounds (`number`), rounded to two decimal
 * places on return. No calls to network, no external state, no
 * randomness — the engine is a pure function of its inputs so its output can
 * be safely cached, statically rendered, and reused by content generators.
 *
 * The engine intentionally supports a subset that covers the acquisition
 * surfaces we ship right now (PAYE + salary sacrifice + student loans +
 * pensions + dividends, plus an Umbrella / Inside‑IR35 and Outside‑IR35
 * Limited Company approximation). It is designed to be extended, not to be
 * exhaustive.
 */

export type Region = "england-wales-ni" | "scotland";

export type PayFrequency =
  | "annual"
  | "monthly"
  | "weekly"
  | "fortnightly"
  | "four-weekly"
  | "daily"
  | "hourly";

export interface CalculatorInput {
  /** Annual gross salary in £. Always expressed as an annual figure. */
  grossAnnual: number;
  taxYear?: TaxYearId;
  region?: Region;
  /** Employee pension contribution (salary sacrifice) as a decimal, e.g. 0.05. */
  pensionSalarySacrifice?: number;
  /** Employee pension contribution taken from *net* pay (relief at source). */
  pensionNetContribution?: number;
  /** SIPP top‑up contribution (post‑tax gross‑up handled here). */
  sipp?: number;
  studentLoanPlans?: StudentLoanPlan["id"][];
  /**
   * When true, treat `grossAnnual` as an Inside IR35 / Umbrella day‑rate‑derived
   * turnover — apply an "employer NI + apprenticeship levy + margin" haircut
   * before running PAYE.
   */
  umbrella?: boolean;
  umbrellaMargin?: number; // £/week
  /** Blend for Limited Company Outside IR35: salary component of director pay. */
  ltdOutsideIr35?: {
    directorSalary: number;
    dividends: number;
  };
  /** Optional tax code override (currently supports the code letter K/BR/D0/NT). */
  taxCode?: string;
}

export interface IncomeTaxBreakdownRow {
  label: string;
  rate: number;
  taxable: number;
  tax: number;
}

export interface CalculatorResult {
  taxYear: TaxYearId;
  region: Region;
  grossAnnual: number;
  taxableIncome: number;
  personalAllowance: number;
  incomeTax: number;
  incomeTaxBreakdown: IncomeTaxBreakdownRow[];
  nationalInsurance: number;
  studentLoan: number;
  pension: {
    salarySacrifice: number;
    netContribution: number;
    sipp: number;
    sippTaxRelief: number;
  };
  netAnnual: number;
  netMonthly: number;
  netWeekly: number;
  netDaily: number;
  netHourly: number;
  effectiveRate: number;
  marginalRate: number;
  /** Additional context surfaces (Umbrella / LtdCo blends). */
  umbrella?: UmbrellaBreakdown;
  ltdOutsideIr35?: LtdOutsideIr35Breakdown;
}

export interface UmbrellaBreakdown {
  turnover: number;
  umbrellaMargin: number;
  employerNi: number;
  apprenticeshipLevy: number;
  netPassThroughGross: number;
}

export interface LtdOutsideIr35Breakdown {
  companyRevenue: number;
  directorSalary: number;
  employerNi: number;
  taxableProfit: number;
  corporationTax: number;
  dividendsPaid: number;
  personalIncomeTaxOnDividends: number;
  personalIncomeTaxOnSalary: number;
  totalTakeHome: number;
  effectiveRate: number;
}

// ---------------------------------------------------------------------------
// Utility

const roundP = (n: number): number => Math.round(n * 100) / 100;

const clamp0 = (n: number): number => (n < 0 ? 0 : n);

// ---------------------------------------------------------------------------
// Income tax

/**
 * Applies income‑tax bands to an amount already net of Personal Allowance.
 *
 * Bands are defined in `constants.ts` assuming a *full* Personal Allowance. If
 * the person's PA has been tapered above £100k, the additional‑rate threshold
 * (which is fixed in *gross* terms at £125,140) shifts up in taxable terms by
 * the amount of PA lost. This function performs that shift by widening the
 * highest non‑additional band by `paLost`.
 */
export function applyBands(
  taxable: number,
  regime: IncomeTaxRegimeYear,
  paActual: number = regime.personalAllowance,
): { total: number; rows: IncomeTaxBreakdownRow[]; marginalRate: number } {
  const paLost = clamp0(regime.personalAllowance - paActual);
  const bands = regime.bands.map((b, i, arr) => {
    const isTop = i === arr.length - 1;
    const isSecondFromTop = i === arr.length - 2;
    if (paLost === 0) return b;
    if (isSecondFromTop) return { ...b, to: b.to + paLost };
    if (isTop) return { ...b, from: b.from + paLost };
    return b;
  });

  let remaining = taxable;
  let total = 0;
  let marginalRate = 0;
  const rows: IncomeTaxBreakdownRow[] = [];
  for (const band of bands) {
    if (remaining <= 0) break;
    const width = band.to - band.from;
    const inBand = Math.min(remaining, width);
    if (inBand > 0) {
      const tax = inBand * band.rate;
      total += tax;
      marginalRate = band.rate;
      rows.push({ label: band.label, rate: band.rate, taxable: roundP(inBand), tax: roundP(tax) });
      remaining -= inBand;
    }
  }
  return { total, rows, marginalRate };
}

/**
 * Personal Allowance after taper (£1 lost per £2 over £100k, disappears at
 * £125,140).
 */
export function taperedPersonalAllowance(
  grossForPa: number,
  regime: IncomeTaxRegimeYear,
): number {
  if (grossForPa <= regime.paTaperStart) return regime.personalAllowance;
  const excess = grossForPa - regime.paTaperStart;
  const reduction = Math.min(regime.personalAllowance, excess / 2);
  return clamp0(regime.personalAllowance - reduction);
}

// ---------------------------------------------------------------------------
// National Insurance

export function nationalInsurance(gross: number, cfg: TaxYearConfig): number {
  const { primaryThreshold: pt, upperEarningsLimit: uel, mainRate, additionalRate } =
    cfg.nationalInsurance;
  if (gross <= pt) return 0;
  const mainBand = Math.min(gross, uel) - pt;
  const upperBand = Math.max(0, gross - uel);
  return roundP(mainBand * mainRate + upperBand * additionalRate);
}

// ---------------------------------------------------------------------------
// Student loans

export function studentLoanRepayment(
  gross: number,
  plans: StudentLoanPlan["id"][] | undefined,
  cfg: TaxYearConfig,
): number {
  if (!plans?.length) return 0;
  // Only the *lowest‑threshold* undergraduate plan applies among plans 1/2/4/5,
  // plus the Postgraduate loan (which is separate and additive).
  const undergrad = plans
    .filter((p) => p !== "postgrad")
    .map((id) => cfg.studentLoans[id])
    .sort((a, b) => a.threshold - b.threshold)[0];
  const postgrad = plans.includes("postgrad") ? cfg.studentLoans.postgrad : null;

  let total = 0;
  if (undergrad && gross > undergrad.threshold) {
    total += (gross - undergrad.threshold) * undergrad.rate;
  }
  if (postgrad && gross > postgrad.threshold) {
    total += (gross - postgrad.threshold) * postgrad.rate;
  }
  return roundP(total);
}

// ---------------------------------------------------------------------------
// Pensions

function applySalarySacrifice(
  gross: number,
  pct: number | undefined,
): { adjustedGross: number; sacrificed: number } {
  if (!pct || pct <= 0) return { adjustedGross: gross, sacrificed: 0 };
  const sacrificed = roundP(gross * pct);
  return { adjustedGross: roundP(gross - sacrificed), sacrificed };
}

// ---------------------------------------------------------------------------
// Umbrella / Inside‑IR35 (approximation)
//
// Contractors are typically paid via an umbrella. Employer NI + apprenticeship
// levy + margin are deducted before PAYE. This is not exact for every umbrella
// (margins vary widely) but is the widely‑used industry approximation used by
// most contractor calculators.

const EMPLOYER_NI_RATE = 0.15; // 2025/26 employer NI Class 1 secondary main rate
const APPRENTICESHIP_LEVY_RATE = 0.005;
const DEFAULT_UMBRELLA_MARGIN_WEEKLY = 25;

function applyUmbrella(
  turnover: number,
  cfg: TaxYearConfig,
  weeklyMargin = DEFAULT_UMBRELLA_MARGIN_WEEKLY,
): { grossPaye: number; breakdown: UmbrellaBreakdown } {
  const annualMargin = weeklyMargin * 52;
  const afterMargin = clamp0(turnover - annualMargin);
  // Employer NI applies above employer's secondary threshold ≈ £5,000 in 2025/26.
  // Approximate that as PT for simplicity.
  const pt = cfg.nationalInsurance.primaryThreshold;
  const employerNi = clamp0(afterMargin - pt) * EMPLOYER_NI_RATE;
  const levy = afterMargin * APPRENTICESHIP_LEVY_RATE;
  const grossPaye = clamp0(afterMargin - employerNi - levy);
  return {
    grossPaye,
    breakdown: {
      turnover: roundP(turnover),
      umbrellaMargin: roundP(annualMargin),
      employerNi: roundP(employerNi),
      apprenticeshipLevy: roundP(levy),
      netPassThroughGross: roundP(grossPaye),
    },
  };
}

// ---------------------------------------------------------------------------
// Limited Company Outside IR35 (director salary + dividends approximation)

function calculateLtdOutsideIr35(
  input: NonNullable<CalculatorInput["ltdOutsideIr35"]>,
  companyRevenue: number,
  cfg: TaxYearConfig,
): LtdOutsideIr35Breakdown {
  const { directorSalary, dividends } = input;
  const employerNi =
    clamp0(directorSalary - cfg.nationalInsurance.primaryThreshold) * EMPLOYER_NI_RATE;
  const taxableProfit = clamp0(companyRevenue - directorSalary - employerNi);

  // Simple marginal‑relief corporation tax approximation.
  const ct = cfg.corporationTax;
  let corporationTax = 0;
  if (taxableProfit <= ct.smallProfitsUpper) {
    corporationTax = taxableProfit * ct.smallProfitsRate;
  } else if (taxableProfit >= ct.mainRateLower) {
    corporationTax = taxableProfit * ct.mainRate;
  } else {
    corporationTax =
      taxableProfit * ct.mainRate -
      (ct.mainRateLower - taxableProfit) * ct.marginalReliefFraction;
  }

  const dividendsPaid = Math.min(dividends, clamp0(taxableProfit - corporationTax));

  // Personal tax on director salary (as if it were the only income) — use
  // full PAYE engine below for full accuracy.
  const salaryOnly = calculatePaye({ grossAnnual: directorSalary, region: "england-wales-ni" });
  const salaryTax = salaryOnly.incomeTax;
  const salaryNi = salaryOnly.nationalInsurance;

  // Dividend tax: use standard divs allowance + basic/higher/additional bands.
  // Divs stack *on top of* other income.
  const div = cfg.dividends;
  const regime = cfg.incomeTax.ukRestOf;
  const pa = taperedPersonalAllowance(directorSalary + dividendsPaid, regime);
  const paLeft = clamp0(pa - directorSalary);
  const taxableDividends = clamp0(dividendsPaid - paLeft);
  const withAllowance = clamp0(taxableDividends - div.allowance);

  // Where in the bands do the dividends sit?
  const remainingBasic = clamp0(regime.bands[0].to - clamp0(directorSalary - pa));
  const remainingHigher = clamp0(
    regime.bands[1].to - clamp0(directorSalary - pa) - Math.min(withAllowance, remainingBasic),
  );
  const inBasic = Math.min(withAllowance, remainingBasic);
  const inHigher = Math.min(clamp0(withAllowance - inBasic), remainingHigher);
  const inAdditional = clamp0(withAllowance - inBasic - inHigher);
  const dividendTax =
    inBasic * div.basicRate + inHigher * div.higherRate + inAdditional * div.additionalRate;

  const totalTakeHome = directorSalary - salaryTax - salaryNi + dividendsPaid - dividendTax;

  return {
    companyRevenue: roundP(companyRevenue),
    directorSalary: roundP(directorSalary),
    employerNi: roundP(employerNi),
    taxableProfit: roundP(taxableProfit),
    corporationTax: roundP(corporationTax),
    dividendsPaid: roundP(dividendsPaid),
    personalIncomeTaxOnDividends: roundP(dividendTax),
    personalIncomeTaxOnSalary: roundP(salaryTax + salaryNi),
    totalTakeHome: roundP(totalTakeHome),
    effectiveRate: companyRevenue > 0 ? 1 - totalTakeHome / companyRevenue : 0,
  };
}

// ---------------------------------------------------------------------------
// Core PAYE (used for salary pages, pay‑rise, £100k trap, comparison…)

export function calculatePaye(input: CalculatorInput): CalculatorResult {
  const cfg = getTaxYear(input.taxYear ?? DEFAULT_TAX_YEAR);
  const region: Region = input.region ?? "england-wales-ni";
  const regime = region === "scotland" ? cfg.incomeTax.scotland : cfg.incomeTax.ukRestOf;

  const gross0 = clamp0(input.grossAnnual);

  // 1. Umbrella pre‑processing.
  let workingGross = gross0;
  let umbrella: UmbrellaBreakdown | undefined;
  if (input.umbrella) {
    const u = applyUmbrella(gross0, cfg, input.umbrellaMargin ?? DEFAULT_UMBRELLA_MARGIN_WEEKLY);
    workingGross = u.grossPaye;
    umbrella = u.breakdown;
  }

  // 2. Salary sacrifice.
  const { adjustedGross, sacrificed } = applySalarySacrifice(
    workingGross,
    input.pensionSalarySacrifice,
  );

  // 3. PA taper.
  const pa = taperedPersonalAllowance(adjustedGross, regime);
  const taxable = clamp0(adjustedGross - pa);

  // 4. Income Tax — respecting tax code overrides.
  let itResult = applyBands(taxable, regime, pa);
  if (input.taxCode) {
    const code = input.taxCode.toUpperCase();
    if (code === "BR") {
      itResult = { total: adjustedGross * 0.2, rows: [], marginalRate: 0.2 };
    } else if (code === "D0") {
      itResult = { total: adjustedGross * 0.4, rows: [], marginalRate: 0.4 };
    } else if (code === "D1") {
      itResult = { total: adjustedGross * 0.45, rows: [], marginalRate: 0.45 };
    } else if (code === "NT") {
      itResult = { total: 0, rows: [], marginalRate: 0 };
    }
  }
  const incomeTax = roundP(itResult.total);

  // 5. NI.
  const ni = nationalInsurance(adjustedGross, cfg);

  // 6. Student loan.
  const sl = studentLoanRepayment(adjustedGross, input.studentLoanPlans, cfg);

  // 7. Net pension contributions taken from net pay.
  const netContrib = roundP(input.pensionNetContribution ?? 0);
  const sipp = roundP(input.sipp ?? 0);
  const sippRelief = roundP(sipp * 0.25); // basic‑rate reclaim added back at source

  const net = adjustedGross - incomeTax - ni - sl - netContrib - sipp + sippRelief;

  // 8. Optional Ltd Outside IR35 blend.
  let ltd: LtdOutsideIr35Breakdown | undefined;
  if (input.ltdOutsideIr35) {
    ltd = calculateLtdOutsideIr35(input.ltdOutsideIr35, gross0, cfg);
  }

  const netAnnual = roundP(net);
  return {
    taxYear: cfg.id,
    region,
    grossAnnual: roundP(gross0),
    taxableIncome: roundP(taxable),
    personalAllowance: roundP(pa),
    incomeTax,
    incomeTaxBreakdown: itResult.rows,
    nationalInsurance: ni,
    studentLoan: sl,
    pension: {
      salarySacrifice: sacrificed,
      netContribution: netContrib,
      sipp,
      sippTaxRelief: sippRelief,
    },
    netAnnual,
    netMonthly: roundP(netAnnual / 12),
    netWeekly: roundP(netAnnual / 52),
    netDaily: roundP(netAnnual / 260),
    netHourly: roundP(netAnnual / (52 * 37.5)),
    effectiveRate: gross0 > 0 ? 1 - netAnnual / gross0 : 0,
    marginalRate: itResult.marginalRate + (adjustedGross > cfg.nationalInsurance.upperEarningsLimit
      ? cfg.nationalInsurance.additionalRate
      : adjustedGross > cfg.nationalInsurance.primaryThreshold
        ? cfg.nationalInsurance.mainRate
        : 0),
    umbrella,
    ltdOutsideIr35: ltd,
  };
}

// ---------------------------------------------------------------------------
// Period conversion (used everywhere in the UI/content)

export function convertToAnnual(amount: number, frequency: PayFrequency): number {
  switch (frequency) {
    case "annual":
      return amount;
    case "monthly":
      return amount * 12;
    case "four-weekly":
      return amount * 13;
    case "fortnightly":
      return amount * 26;
    case "weekly":
      return amount * 52;
    case "daily":
      return amount * 260; // 52w × 5d
    case "hourly":
      return amount * 52 * 37.5;
  }
}

export function annualToPeriods(annual: number) {
  return {
    annual: roundP(annual),
    monthly: roundP(annual / 12),
    fourWeekly: roundP(annual / 13),
    fortnightly: roundP(annual / 26),
    weekly: roundP(annual / 52),
    daily: roundP(annual / 260),
    hourly: roundP(annual / (52 * 37.5)),
  };
}

// ---------------------------------------------------------------------------
// Convenience shortcut used by salary pages.

export function calculateSalary(
  gross: number,
  overrides: Partial<CalculatorInput> = {},
): CalculatorResult {
  return calculatePaye({ grossAnnual: gross, ...overrides });
}
