/**
 * Outside-IR35 limited-company contractor calculation engine.
 *
 * Models the standard "personal service company / director-shareholder" tax
 * flow used by UK contractors operating outside IR35:
 *
 *   assignment income received by company
 *     − director's salary (paid to owner as employment income)
 *     − employer's NI on that salary
 *     − employer's pension contribution (paid by the company)
 *   = company profit before tax
 *     − corporation tax (small-profits rate up to £50k, main rate above £250k,
 *       marginal relief in between)
 *   = distributable profit paid out as dividends
 *
 * Personal-side deductions on the salary + dividends the director receives:
 *   − PAYE income tax on salary (via the standard band structure)
 *   − employee NIC on salary
 *   − dividend tax on dividends (allowance + basic / higher / additional rates)
 *   − student loan repayments on total taxable income (salary + dividends)
 *   − personal SIPP contributions
 *
 * Pure TypeScript domain functions — deterministic, side-effect free, safe
 * for edge/serverless runtimes.
 */

import type { PayeTaxConfig } from "@/lib/tax/uk2025";
import type { LoanKey } from "@/lib/tax/uk2025";
import {
  computeIncomeTaxFromCode,
  parseTaxCode,
  taperPersonalAllowance,
} from "./taxCode";

export type SalaryStrategy =
  | "ni-optimal" // Salary = personal allowance (£12,570) – 20% tax band, small employer NI
  | "secondary-threshold" // Salary = secondary threshold (£5,000) – no employer NI
  | "custom"; // User supplies their own salary

export interface OutsideIR35Inputs {
  /** Total annualised company income before any deductions. */
  companyIncomeAnnual: number;
  /**
   * Optional additional annual company overheads (accountancy fees,
   * insurance, software subscriptions, etc.). Reduces profit for CT
   * purposes.
   */
  companyOverheadsAnnual?: number;
  /** Salary strategy for the director. Defaults to "ni-optimal". */
  salaryStrategy?: SalaryStrategy;
  /** Custom annual salary. Used only when salaryStrategy === "custom". */
  customSalaryAnnual?: number;
  /**
   * Employer pension contribution (fixed £ per year) paid by the company on
   * behalf of the director. Deductible for corporation-tax purposes.
   */
  employerPensionAnnual?: number;
  /** Personal SIPP contributions made by the director (£/year). */
  personalSippAnnual?: number;
  /** Tax code for personal PAYE on the salary component. Defaults to 1257L. */
  taxCode?: string;
  /** Student loan plans in force for the director. */
  studentLoanPlans?: LoanKey[];
}

export interface OutsideIR35CompanyBreakdown {
  companyIncomeAnnual: number;
  companyOverheadsAnnual: number;
  directorSalaryAnnual: number;
  employerNIAnnual: number;
  employerPensionAnnual: number;
  profitBeforeCorporationTaxAnnual: number;
  corporationTaxAnnual: number;
  distributableDividendsAnnual: number;
  /**
   * True when the profit fell in the marginal-relief band (£50k–£250k) and
   * the effective CT rate is between the small-profits rate and the main
   * rate.
   */
  corporationTaxMarginalRelief: boolean;
}

export interface OutsideIR35PersonalBreakdown {
  salaryAnnual: number;
  dividendsAnnual: number;
  totalTaxableIncomeAnnual: number;
  payeIncomeTaxAnnual: number;
  employeeNIAnnual: number;
  dividendTaxAnnual: number;
  studentLoanAnnual: number;
  studentLoanBreakdown: Array<{ plan: LoanKey; label: string; amount: number }>;
  personalSippAnnual: number;
  netTakeHomeAnnual: number;
}

export interface OutsideIR35Result {
  company: OutsideIR35CompanyBreakdown;
  personal: OutsideIR35PersonalBreakdown;
  /** Effective tax rate across the whole pipeline (1 − net/companyIncome). */
  effectiveTaxRate: number;
}

const LOAN_LABELS: Record<LoanKey, string> = {
  plan1: "Plan 1",
  plan2: "Plan 2",
  plan4: "Plan 4",
  plan5: "Plan 5",
  postgrad: "Postgraduate loan",
};

const DEFAULT_TAX_CODE = "1257L";

/**
 * UK corporation tax with marginal relief. Small-profits rate applies up to
 * the lower limit, main rate above the upper limit, and marginal relief
 * smooths the effective rate in between.
 */
export function calculateCorporationTax(
  profit: number,
  config: PayeTaxConfig,
): { tax: number; marginalRelief: boolean } {
  if (profit <= 0) {
    return { tax: 0, marginalRelief: false };
  }
  const ct = config.corporationTax;
  if (profit <= ct.smallProfitsUpperLimit) {
    return { tax: profit * ct.smallProfitsRate, marginalRelief: false };
  }
  if (profit >= ct.mainRateLowerLimit) {
    return { tax: profit * ct.mainRate, marginalRelief: false };
  }
  const gross = profit * ct.mainRate;
  const relief = (ct.mainRateLowerLimit - profit) * ct.marginalReliefFraction;
  return { tax: Math.max(0, gross - relief), marginalRelief: true };
}

function calculateEmployeeNIC(salary: number, config: PayeTaxConfig): number {
  const { primaryThreshold, upperEarningsLimit, mainRate, upperRate } = config.ni;
  if (salary <= primaryThreshold) {
    return 0;
  }
  const inMainBand = Math.min(salary, upperEarningsLimit) - primaryThreshold;
  const inUpperBand = Math.max(0, salary - upperEarningsLimit);
  return Math.max(0, inMainBand) * mainRate + inUpperBand * upperRate;
}

function calculateEmployerNI(salary: number, config: PayeTaxConfig): number {
  const eni = config.employerNi;
  return Math.max(0, salary - eni.secondaryThreshold) * eni.rate;
}

function calculatePayeOnSalary(
  salary: number,
  taxCode: string,
  totalIncomeForTaper: number,
  config: PayeTaxConfig,
): number {
  if (salary <= 0) return 0;
  // Route through the shared parser so K / M / N / T / S / C /
  // emergency-suffix codes all behave here exactly as they do on the
  // PAYE and umbrella calculators. Pass the *total* income (salary +
  // dividends) as the taper baseline — that's the correct HMRC rule
  // for outside-IR35 director-salary PAYE.
  const parsed = parseTaxCode(taxCode, config.personalAllowance);
  const effectivePA = taperPersonalAllowance(
    parsed.personalAllowance,
    totalIncomeForTaper,
    config,
  );
  return computeIncomeTaxFromCode(parsed, salary, config, {
    effectivePersonalAllowance: effectivePA,
  });
}

/**
 * Compute dividend tax given the total dividends received and the salary
 * already used against the personal allowance. Dividends stack on top of
 * salary for band-allocation purposes and get their own allowance and rate
 * schedule.
 */
function calculateDividendTax(
  dividends: number,
  salary: number,
  taxCode: string,
  config: PayeTaxConfig,
): number {
  if (dividends <= 0) return 0;

  const totalIncome = salary + dividends;
  const parsed = parseTaxCode(taxCode, config.personalAllowance);
  const pa = taperPersonalAllowance(parsed.personalAllowance, totalIncome, config);

  // Any personal allowance left after salary is applied to dividends first.
  const paRemaining = Math.max(0, pa - salary);
  const dividendAfterPA = Math.max(0, dividends - paRemaining);

  // Dividend allowance (£500 in 2026/27) is deducted from the dividends
  // portion but still uses up rate-band capacity in the band it falls in.
  const dividendAllowance = config.dividend.allowance;
  const taxableDividend = Math.max(0, dividendAfterPA - dividendAllowance);

  // Amount of basic-rate band already consumed by salary (after PA).
  const salaryAfterPA = Math.max(0, salary - pa);
  // Allocation of dividend income across basic/higher/additional bands.
  // Basic band top is measured from £0 taxable, so remaining basic room
  // starts at salaryAfterPA and ends at basicBandTop.
  const basicRoom = Math.max(0, config.basicBandTop - salaryAfterPA);
  // dividendAllowance also sits in a rate band; the allowance itself is not
  // taxed but it does consume band capacity as if taxed at the relevant
  // rate. For UK modelling, treat it as if it were basic-band dividend
  // income for capacity purposes: it eats into basicRoom first.
  const allowanceInBasic = Math.min(basicRoom, dividendAllowance);
  const basicRoomAfterAllowance = Math.max(0, basicRoom - allowanceInBasic);

  const higherRoomStart = Math.max(0, config.basicBandTop);
  const higherRoomWidth = Math.max(
    0,
    config.higherBandTop - higherRoomStart,
  );

  const dividendInBasic = Math.min(taxableDividend, basicRoomAfterAllowance);
  const remainingAfterBasic = Math.max(0, taxableDividend - dividendInBasic);
  const dividendInHigher = Math.min(remainingAfterBasic, higherRoomWidth);
  const dividendInAdditional = Math.max(
    0,
    remainingAfterBasic - dividendInHigher,
  );

  return (
    dividendInBasic * config.dividend.basic +
    dividendInHigher * config.dividend.higher +
    dividendInAdditional * config.dividend.additional
  );
}

function calculateStudentLoans(
  totalTaxableIncome: number,
  plans: LoanKey[],
  config: PayeTaxConfig,
): {
  total: number;
  breakdown: Array<{ plan: LoanKey; label: string; amount: number }>;
} {
  const breakdown: Array<{ plan: LoanKey; label: string; amount: number }> = [];
  let total = 0;
  for (const plan of plans) {
    const details = config.studentLoans[plan];
    if (!details || details.rate === 0) continue;
    const above = Math.max(0, totalTaxableIncome - details.threshold);
    const amount = above * details.rate;
    if (amount > 0) {
      breakdown.push({ plan, label: LOAN_LABELS[plan] ?? plan, amount });
      total += amount;
    }
  }
  return { total, breakdown };
}

/**
 * Resolve the director's annual salary based on the chosen strategy.
 */
export function resolveDirectorSalary(
  input: OutsideIR35Inputs,
  config: PayeTaxConfig,
): number {
  const strategy: SalaryStrategy = input.salaryStrategy ?? "ni-optimal";
  switch (strategy) {
    case "ni-optimal":
      return config.personalAllowance;
    case "secondary-threshold":
      return config.employerNi.secondaryThreshold;
    case "custom": {
      const raw = input.customSalaryAnnual ?? 0;
      if (!Number.isFinite(raw) || raw < 0) return 0;
      return raw;
    }
    default:
      return config.personalAllowance;
  }
}

/**
 * Run the full outside-IR35 pipeline and return a company-side + personal-
 * side breakdown. Never throws; degenerate inputs (0 income) produce a
 * zero-filled result.
 */
export function calculateOutsideIR35Annual(
  input: OutsideIR35Inputs,
  config: PayeTaxConfig,
): OutsideIR35Result {
  const companyIncome = Math.max(0, input.companyIncomeAnnual ?? 0);
  const overheads = Math.max(0, input.companyOverheadsAnnual ?? 0);
  const salary = Math.max(0, resolveDirectorSalary(input, config));
  const employerPension = Math.max(0, input.employerPensionAnnual ?? 0);
  const employerNI = calculateEmployerNI(salary, config);
  const personalSipp = Math.max(0, input.personalSippAnnual ?? 0);
  const taxCode = (input.taxCode ?? DEFAULT_TAX_CODE).toUpperCase();

  const profitBeforeCT = Math.max(
    0,
    companyIncome - salary - employerNI - employerPension - overheads,
  );
  const { tax: corpTax, marginalRelief } = calculateCorporationTax(
    profitBeforeCT,
    config,
  );
  const distributableDividends = Math.max(0, profitBeforeCT - corpTax);

  const totalIncome = salary + distributableDividends;

  const payeIncomeTax = calculatePayeOnSalary(
    salary,
    taxCode,
    totalIncome,
    config,
  );
  const employeeNI = calculateEmployeeNIC(salary, config);
  const dividendTax = calculateDividendTax(
    distributableDividends,
    salary,
    taxCode,
    config,
  );

  const { total: studentLoanAnnual, breakdown: studentLoanBreakdown } =
    calculateStudentLoans(
      totalIncome,
      input.studentLoanPlans ?? [],
      config,
    );

  const netTakeHome = Math.max(
    0,
    totalIncome -
      payeIncomeTax -
      employeeNI -
      dividendTax -
      studentLoanAnnual -
      personalSipp,
  );

  const effectiveTaxRate =
    companyIncome > 0
      ? Math.max(0, 1 - netTakeHome / companyIncome)
      : 0;

  return {
    company: {
      companyIncomeAnnual: companyIncome,
      companyOverheadsAnnual: overheads,
      directorSalaryAnnual: salary,
      employerNIAnnual: employerNI,
      employerPensionAnnual: employerPension,
      profitBeforeCorporationTaxAnnual: profitBeforeCT,
      corporationTaxAnnual: corpTax,
      distributableDividendsAnnual: distributableDividends,
      corporationTaxMarginalRelief: marginalRelief,
    },
    personal: {
      salaryAnnual: salary,
      dividendsAnnual: distributableDividends,
      totalTaxableIncomeAnnual: totalIncome,
      payeIncomeTaxAnnual: payeIncomeTax,
      employeeNIAnnual: employeeNI,
      dividendTaxAnnual: dividendTax,
      studentLoanAnnual,
      studentLoanBreakdown,
      personalSippAnnual: personalSipp,
      netTakeHomeAnnual: netTakeHome,
    },
    effectiveTaxRate,
  };
}
