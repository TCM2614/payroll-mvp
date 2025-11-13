/**
 * Period-based PAYE calculation engine for UK tax year 2024/25
 * 
 * Calculates tax for specific periods within the tax year and detects
 * mid-year over-taxation or underpayment.
 * 
 * Pure TypeScript domain functions - deterministic, side-effect free,
 * suitable for serverless/edge context.
 */

import { UK_TAX_2025 } from "@/lib/tax/uk2025";

export type PayFrequency = "monthly" | "weekly" | "four-weekly";

export interface TaxYearConfig {
  taxYear: "2024-25";
  personalAllowance: number;
  basicRateLimit: number;
  higherRateLimit: number;
  additionalRateThreshold: number;
  bands: {
    rate: number;
    lower: number;
    upper?: number;
  }[];
  ni: {
    primaryThreshold: number;
    upperEarningsLimit: number;
    mainRate: number;
    upperRate: number;
  };
  studentLoans: {
    [key: string]: { threshold: number; rate: number };
  };
}

export interface AnnualTaxInputs {
  grossAnnualIncome: number;
  pensionEmployeeAnnual?: number;
  studentLoanPlan?: "none" | "plan1" | "plan2" | "plan4" | "plan5" | "postgrad";
  taxCode: string;
  config: TaxYearConfig;
}

export interface AnnualTaxBreakdown {
  grossAnnualIncome: number;
  taxableAnnualIncome: number;
  annualPAYE: number;
  annualNI: number;
  annualStudentLoan: number;
  annualPensionEmployee: number;
  netAnnualIncome: number;
}

export interface PeriodTaxInput {
  taxYear: "2024-25";
  payFrequency: PayFrequency;
  /** 1-based index of the current pay period within the tax year (e.g. 1–12 for monthly). */
  periodIndex: number;
  /** Total number of pay periods in the year for this frequency: 12, 52, 13, etc. */
  totalPeriodsInYear: number;

  /** Gross income for this specific period. */
  grossForPeriod: number;

  /** Employee pension contribution for this period (amount, not percent – assume upstream conversion). */
  pensionForPeriod?: number;

  /** Optional student loan deduction for this period, if we're directly passing it. */
  studentLoanPlan?: "none" | "plan1" | "plan2" | "plan4" | "plan5" | "postgrad";

  /** Cumulative gross income from the start of the tax year up to (but excluding) this period. */
  ytdGrossBeforeThisPeriod: number;

  /** Cumulative tax already paid (PAYE only) before this period. */
  ytdTaxBeforeThisPeriod: number;

  /** Cumulative NI + SL already paid before this period – allow undefined and treat as 0 if missing. */
  ytdNiBeforeThisPeriod?: number;
  ytdStudentLoanBeforeThisPeriod?: number;

  taxCode: string; // assume standard UK tax codes, e.g. "1257L", can later extend to W1/M1 etc.
  config: TaxYearConfig;
}

export interface PeriodTaxYtdSnapshot {
  gross: number;
  taxableIncome: number;
  paye: number;
  ni: number;
  studentLoan: number;
  pension: number;
  net: number;
}

/** Direction of variance compared to expected tax to date. */
export type TaxVarianceDirection = "over" | "under" | "withinTolerance";

export type TaxWarningCode =
  | "potential_overtax_mid_year"
  | "potential_undertax_mid_year"
  | "non_cumulative_code_detected"
  | "emergency_tax_code_pattern"
  | "multiple_jobs_or_irregular_income_possible";

export interface TaxWarning {
  code: TaxWarningCode;
  severity: "info" | "warning" | "critical";
  message: string;
  /** Optional numeric context (e.g. size of variance). */
  metadata?: Record<string, unknown>;
}

export interface PeriodTaxResult {
  /** Net figures for *this* period only. */
  period: {
    gross: number;
    taxableIncome: number;
    paye: number;
    ni: number;
    studentLoan: number;
    pension: number;
    net: number;
  };

  /** YTD including this period. */
  ytdActual: PeriodTaxYtdSnapshot;

  /** YTD "expected" based on prorated annual logic. */
  ytdExpected: PeriodTaxYtdSnapshot;

  /** Variance between actual and expected PAYE tax. */
  variance: {
    amount: number; // actual - expected (positive = overpay, negative = underpay)
    direction: TaxVarianceDirection;
    percentOfExpected: number; // |amount| / expected
    toleranceBreached: boolean;
  };

  warnings: TaxWarning[];
}

export interface PeriodRangeAggregationInput {
  /** Pre-computed period-level results (e.g. from a list of pay dates). */
  periods: PeriodTaxResult[];
  /** Inclusive indices within the array (0-based indices) OR periodIndex ranges; choose and document clearly. */
  fromIndex: number;
  toIndex: number;
}

export interface PeriodRangeAggregationResult {
  fromIndex: number;
  toIndex: number;
  periodsIncluded: number;
  totals: {
    gross: number;
    tax: number;
    ni: number;
    studentLoan: number;
    pension: number;
    net: number;
  };
}

/**
 * Default tolerance thresholds for variance detection
 */
const DEFAULT_TOLERANCE_AMOUNT = 50; // GBP
const DEFAULT_TOLERANCE_PERCENT = 0.1; // 10%

/**
 * Calculate annual tax breakdown (reference calculation)
 * This integrates with existing annual calculation logic
 */
export function calculateAnnualTax(inputs: AnnualTaxInputs): AnnualTaxBreakdown {
  const {
    grossAnnualIncome,
    pensionEmployeeAnnual = 0,
    studentLoanPlan = "none",
    taxCode,
    config,
  } = inputs;

  // Apply pension deduction
  const grossAfterPension = grossAnnualIncome - pensionEmployeeAnnual;

  // Calculate personal allowance (with tapering)
  const paTaperStart = 100000;
  let personalAllowance = config.personalAllowance;
  if (grossAfterPension > paTaperStart) {
    const reduction = Math.floor((grossAfterPension - paTaperStart) / 2);
    personalAllowance = Math.max(0, personalAllowance - reduction);
  }

  // Parse tax code to determine personal allowance
  const taxCodePA = parseTaxCodePA(taxCode, config.personalAllowance);
  const effectivePA = taxCodePA ?? personalAllowance;

  // Calculate taxable income
  const taxableIncome = Math.max(0, grossAfterPension - effectivePA);

  // Calculate income tax by bands
  let annualPAYE = 0;
  let remaining = taxableIncome;
  for (const band of config.bands) {
    if (remaining <= 0) break;
    const bandWidth = band.upper
      ? Math.min(remaining, band.upper - band.lower)
      : remaining;
    const taxableInBand = Math.max(0, Math.min(bandWidth, remaining));
    annualPAYE += taxableInBand * band.rate;
    remaining -= taxableInBand;
  }

  // Calculate NI
  const annualNI = calculateAnnualNI(grossAfterPension, config.ni);

  // Calculate student loan
  const annualStudentLoan = calculateAnnualStudentLoan(
    grossAfterPension,
    studentLoanPlan,
    config.studentLoans
  );

  return {
    grossAnnualIncome,
    taxableAnnualIncome: taxableIncome,
    annualPAYE,
    annualNI,
    annualStudentLoan,
    annualPensionEmployee: pensionEmployeeAnnual,
    netAnnualIncome:
      grossAfterPension - annualPAYE - annualNI - annualStudentLoan,
  };
}

/**
 * Calculate tax for a specific period within the tax year.
 * 
 * This function computes:
 * - Period-level tax, NI, student loan, and net pay
 * - YTD actual values (cumulative including this period)
 * - YTD expected values (prorated from annual projection)
 * - Variance analysis between actual and expected
 * - Warnings for potential issues
 * 
 * @param input - Period tax calculation inputs
 * @returns Period tax result with breakdown, variance, and warnings
 */
export function calculatePeriodTax(
  input: PeriodTaxInput
): PeriodTaxResult {
  const {
    periodIndex,
    totalPeriodsInYear,
    grossForPeriod,
    pensionForPeriod = 0,
    studentLoanPlan = "none",
    ytdGrossBeforeThisPeriod,
    ytdTaxBeforeThisPeriod,
    ytdNiBeforeThisPeriod = 0,
    ytdStudentLoanBeforeThisPeriod = 0,
    taxCode,
    config,
  } = input;

  // Compute YTD including current period
  const ytdGross = ytdGrossBeforeThisPeriod + grossForPeriod;
  const ytdPensionSimple = pensionForPeriod * periodIndex; // Simplified: assume consistent pension

  // Derive period fraction
  const periodFraction = periodIndex / totalPeriodsInYear;

  // Estimate annualised income from YTD
  const projectedAnnualGross = periodFraction > 0 ? ytdGross / periodFraction : ytdGross;

  // Calculate annual breakdown using projected income
  const annualBreakdown = calculateAnnualTax({
    grossAnnualIncome: projectedAnnualGross,
    pensionEmployeeAnnual: (ytdPensionSimple / periodFraction) || 0,
    studentLoanPlan,
    taxCode,
    config,
  });

  // Prorate expected YTD values from annual
  const expectedYtdPAYE = annualBreakdown.annualPAYE * periodFraction;
  const expectedYtdNI = annualBreakdown.annualNI * periodFraction;
  const expectedYtdStudentLoan = annualBreakdown.annualStudentLoan * periodFraction;
  const expectedYtdPension = (annualBreakdown.annualPensionEmployee || 0) * periodFraction;
  const expectedYtdGross = projectedAnnualGross * periodFraction;
  const expectedYtdTaxable = annualBreakdown.taxableAnnualIncome * periodFraction;
  const expectedYtdNet = annualBreakdown.netAnnualIncome * periodFraction;

  // Calculate actual YTD tax by computing full YTD tax from scratch
  const actualYtdBreakdown = calculateAnnualTax({
    grossAnnualIncome: ytdGross * (totalPeriodsInYear / periodIndex),
    pensionEmployeeAnnual: (ytdPensionSimple * totalPeriodsInYear) / periodIndex,
    studentLoanPlan,
    taxCode,
    config,
  });

  // Scale back to YTD
  const actualYtdPAYE = (actualYtdBreakdown.annualPAYE * periodFraction);
  const actualYtdNI = (actualYtdBreakdown.annualNI * periodFraction);
  const actualYtdStudentLoan = (actualYtdBreakdown.annualStudentLoan * periodFraction);

  // Alternative: compute period tax as difference
  // This is more accurate for cumulative PAYE systems
  const periodPAYE = actualYtdPAYE - ytdTaxBeforeThisPeriod;
  const periodNI = actualYtdNI - ytdNiBeforeThisPeriod;
  const periodStudentLoan = actualYtdStudentLoan - ytdStudentLoanBeforeThisPeriod;

  // Build YTD snapshots
  const ytdActual: PeriodTaxYtdSnapshot = {
    gross: ytdGross,
    taxableIncome: actualYtdBreakdown.taxableAnnualIncome * periodFraction,
    paye: actualYtdPAYE,
    ni: actualYtdNI,
    studentLoan: actualYtdStudentLoan,
    pension: ytdPensionSimple,
    net: ytdGross - actualYtdPAYE - actualYtdNI - actualYtdStudentLoan - ytdPensionSimple,
  };

  const ytdExpected: PeriodTaxYtdSnapshot = {
    gross: expectedYtdGross,
    taxableIncome: expectedYtdTaxable,
    paye: expectedYtdPAYE,
    ni: expectedYtdNI,
    studentLoan: expectedYtdStudentLoan,
    pension: expectedYtdPension,
    net: expectedYtdNet,
  };

  // Calculate variance
  const varianceAmount = actualYtdPAYE - expectedYtdPAYE;
  const toleranceAmount = DEFAULT_TOLERANCE_AMOUNT;
  const tolerancePercent = DEFAULT_TOLERANCE_PERCENT;
  const percentOfExpected =
    expectedYtdPAYE > 0 ? Math.abs(varianceAmount) / expectedYtdPAYE : 0;
  const toleranceBreached =
    Math.abs(varianceAmount) > toleranceAmount ||
    percentOfExpected > tolerancePercent;

  let direction: TaxVarianceDirection = "withinTolerance";
  if (varianceAmount > toleranceAmount || percentOfExpected > tolerancePercent) {
    direction = "over";
  } else if (
    varianceAmount < -toleranceAmount ||
    percentOfExpected > tolerancePercent
  ) {
    direction = "under";
  }

  // Generate warnings
  const warnings = detectWarnings({
    input,
    varianceAmount,
    toleranceBreached,
    direction,
    ytdActual,
    ytdExpected,
    periodIndex,
  });

  // Period breakdown (difference between YTD including and YTD before)
  const periodBreakdown = {
    gross: grossForPeriod,
    taxableIncome: ytdActual.taxableIncome - (ytdActual.taxableIncome - (grossForPeriod - pensionForPeriod - (config.personalAllowance / totalPeriodsInYear))),
    paye: periodPAYE,
    ni: periodNI,
    studentLoan: periodStudentLoan,
    pension: pensionForPeriod,
    net: grossForPeriod - periodPAYE - periodNI - periodStudentLoan - pensionForPeriod,
  };

  // Recalculate taxable income for period more accurately
  const previousYtdGross = ytdGrossBeforeThisPeriod;
  const previousYtdPension = ytdPensionSimple - pensionForPeriod;
  const previousYtdBreakdown = calculateAnnualTax({
    grossAnnualIncome: previousYtdGross * (totalPeriodsInYear / Math.max(1, periodIndex - 1)),
    pensionEmployeeAnnual: (previousYtdPension * totalPeriodsInYear) / Math.max(1, periodIndex - 1),
    studentLoanPlan,
    taxCode,
    config,
  });
  const previousYtdTaxable = (previousYtdBreakdown.taxableAnnualIncome * (periodIndex - 1)) / totalPeriodsInYear;
  periodBreakdown.taxableIncome = ytdActual.taxableIncome - previousYtdTaxable;

  return {
    period: periodBreakdown,
    ytdActual,
    ytdExpected,
    variance: {
      amount: varianceAmount,
      direction,
      percentOfExpected,
      toleranceBreached,
    },
    warnings,
  };
}

/**
 * Aggregate totals for a range of periods.
 * 
 * Sums period-level values (gross, tax, NI, student loan, pension, net)
 * for the specified inclusive range of periods.
 * 
 * @param input - Range aggregation input with periods array and indices
 * @returns Aggregated totals for the specified range
 */
export function aggregatePeriodRange(
  input: PeriodRangeAggregationInput
): PeriodRangeAggregationResult {
  const { periods, fromIndex, toIndex } = input;

  // Validate indices
  if (fromIndex < 0 || toIndex >= periods.length || fromIndex > toIndex) {
    throw new Error(
      `Invalid range: fromIndex=${fromIndex}, toIndex=${toIndex}, periods.length=${periods.length}`
    );
  }

  // Sum period values for the range
  const totals = {
    gross: 0,
    tax: 0,
    ni: 0,
    studentLoan: 0,
    pension: 0,
    net: 0,
  };

  for (let i = fromIndex; i <= toIndex; i++) {
    const period = periods[i];
    totals.gross += period.period.gross;
    totals.tax += period.period.paye;
    totals.ni += period.period.ni;
    totals.studentLoan += period.period.studentLoan;
    totals.pension += period.period.pension;
    totals.net += period.period.net;
  }

  return {
    fromIndex,
    toIndex,
    periodsIncluded: toIndex - fromIndex + 1,
    totals,
  };
}

/**
 * Detect warnings based on variance, tax code, and income patterns
 */
function detectWarnings(params: {
  input: PeriodTaxInput;
  varianceAmount: number;
  toleranceBreached: boolean;
  direction: TaxVarianceDirection;
  ytdActual: PeriodTaxYtdSnapshot;
  ytdExpected: PeriodTaxYtdSnapshot;
  periodIndex: number;
}): TaxWarning[] {
  const warnings: TaxWarning[] = [];
  const {
    input,
    varianceAmount,
    toleranceBreached,
    direction,
    ytdActual,
    periodIndex,
  } = params;

  // Check for over-taxation
  if (direction === "over" && toleranceBreached) {
    warnings.push({
      code: "potential_overtax_mid_year",
      severity: Math.abs(varianceAmount) > 200 ? "warning" : "info",
      message: `Based on your income so far this tax year, you may be overpaying PAYE tax by around ${formatGBP(
        Math.abs(varianceAmount)
      )}. HMRC may reconcile this automatically, but you can also query this if it persists.`,
      metadata: {
        varianceAmount: Math.abs(varianceAmount),
        ytdActual: ytdActual.paye,
        ytdExpected: params.ytdExpected.paye,
      },
    });
  }

  // Check for under-taxation
  if (direction === "under" && toleranceBreached) {
    warnings.push({
      code: "potential_undertax_mid_year",
      severity: Math.abs(varianceAmount) > 200 ? "critical" : "warning",
      message: `Based on your income so far this tax year, you may be underpaying PAYE tax by around ${formatGBP(
        Math.abs(varianceAmount)
      )}. You may owe this at year-end. Consider checking your tax code or contacting HMRC.`,
      metadata: {
        varianceAmount: Math.abs(varianceAmount),
        ytdActual: ytdActual.paye,
        ytdExpected: params.ytdExpected.paye,
      },
    });
  }

  // Check for non-cumulative tax codes
  const taxCodeUpper = input.taxCode.trim().toUpperCase();
  if (taxCodeUpper.includes("W1") || taxCodeUpper.includes("M1")) {
    warnings.push({
      code: "non_cumulative_code_detected",
      severity: "info",
      message: `Non-cumulative tax code detected (${input.taxCode}). Tax is calculated on each period independently, which may cause variance from expected cumulative calculations.`,
      metadata: {
        taxCode: input.taxCode,
      },
    });
  }

  // Check for emergency tax codes
  if (taxCodeUpper.includes("0T") || taxCodeUpper.includes("BR") || taxCodeUpper.includes("D0")) {
    warnings.push({
      code: "emergency_tax_code_pattern",
      severity: "warning",
      message: `Emergency or basic rate tax code detected (${input.taxCode}). This may result in incorrect tax calculations. Please verify your tax code with HMRC.`,
      metadata: {
        taxCode: input.taxCode,
      },
    });
  }

  // Check for irregular income patterns (if we have previous period data)
  if (periodIndex > 1) {
    const avgGrossPerPeriod = ytdActual.gross / periodIndex;
    const currentPeriodGross = input.grossForPeriod;
    if (currentPeriodGross > avgGrossPerPeriod * 2.5) {
      warnings.push({
        code: "multiple_jobs_or_irregular_income_possible",
        severity: "info",
        message: `Significant income variation detected this period. This may indicate multiple jobs or irregular income patterns, which can affect tax calculations.`,
        metadata: {
          currentPeriodGross,
          averageGrossPerPeriod: avgGrossPerPeriod,
          ratio: currentPeriodGross / avgGrossPerPeriod,
        },
      });
    }
  }

  return warnings;
}

/**
 * Helper functions
 */

function parseTaxCodePA(taxCode: string, defaultPA: number): number | null {
  const upper = taxCode.trim().toUpperCase();
  const match = upper.match(/(\d{3,4})L/);
  if (match) {
    return Number(match[1]) * 10;
  }
  if (upper.includes("BR") || upper.includes("D0") || upper.includes("D1") || upper.includes("0T")) {
    return 0;
  }
  if (upper.includes("NT")) {
    return null; // No tax, so PA doesn't apply
  }
  return defaultPA;
}

function calculateAnnualNI(
  grossIncome: number,
  niConfig: TaxYearConfig["ni"]
): number {
  if (grossIncome <= niConfig.primaryThreshold) return 0;

  const mainBand =
    Math.min(grossIncome, niConfig.upperEarningsLimit) -
    niConfig.primaryThreshold;
  const upperBand = Math.max(0, grossIncome - niConfig.upperEarningsLimit);

  return mainBand * niConfig.mainRate + upperBand * niConfig.upperRate;
}

function calculateAnnualStudentLoan(
  grossIncome: number,
  plan: string,
  studentLoans: TaxYearConfig["studentLoans"]
): number {
  if (plan === "none") return 0;

  const loanConfig = studentLoans[plan];
  if (!loanConfig) return 0;

  const repayable = Math.max(0, grossIncome - loanConfig.threshold);
  return repayable * loanConfig.rate;
}

function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Create UK 2024/25 tax year configuration
 */
export function createUK2025Config(): TaxYearConfig {
  return {
    taxYear: "2024-25",
    personalAllowance: UK_TAX_2025.personalAllowance,
    basicRateLimit: UK_TAX_2025.basicBandTop,
    higherRateLimit: UK_TAX_2025.higherBandTop,
    additionalRateThreshold: UK_TAX_2025.higherBandTop,
    bands: [
      {
        rate: UK_TAX_2025.basicRate,
        lower: 0,
        upper: UK_TAX_2025.basicBandTop,
      },
      {
        rate: UK_TAX_2025.higherRate,
        lower: UK_TAX_2025.basicBandTop,
        upper: UK_TAX_2025.higherBandTop,
      },
      {
        rate: UK_TAX_2025.additionalRate,
        lower: UK_TAX_2025.higherBandTop,
      },
    ],
    ni: {
      primaryThreshold: UK_TAX_2025.ni.primaryThreshold,
      upperEarningsLimit: UK_TAX_2025.ni.upperEarningsLimit,
      mainRate: UK_TAX_2025.ni.mainRate,
      upperRate: UK_TAX_2025.ni.upperRate,
    },
    studentLoans: UK_TAX_2025.studentLoans,
  };
}

