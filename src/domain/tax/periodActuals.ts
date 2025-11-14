/**
 * Analysis helper for comparing actual tax paid vs expected tax
 * 
 * Uses the existing calculatePeriodTax engine to compute expected PAYE
 * and compares against user-provided actual tax paid from payslips.
 * 
 * Pure TypeScript domain functions - deterministic, side-effect free.
 */

import {
  calculatePeriodTax,
  type PayFrequency,
  type PeriodTaxResult,
  type PeriodTaxInput,
  type TaxYearConfig,
} from "./periodTax";

export interface PeriodActualInput {
  /** 1-based period index within the tax year (1–12 monthly, 1–52 weekly, etc.) */
  periodIndex: number;
  grossForPeriod: number;
  pensionForPeriod?: number;
  /** Actual PAYE deducted for this period, from payslip. */
  actualTaxForPeriod: number;
  /** Optional override for tax code on this payslip; otherwise use global. */
  taxCodeOverride?: string;
}

export interface PeriodActualAnalysisItem {
  periodIndex: number;
  expected: {
    payeForPeriod: number;
    ytdPaye: number;
  };
  actual: {
    taxForPeriod: number;
    ytdTax: number;
  };
  variance: {
    periodAmount: number; // actual - expected for this period
    periodDirection: "over" | "under" | "withinTolerance";
    cumulativeAmount: number; // cumulative (sum of period variances up to this period)
    cumulativeDirection: "over" | "under" | "withinTolerance";
  };
}

export interface PeriodActualAnalysisResult {
  items: PeriodActualAnalysisItem[];
  finalCumulativeAmount: number;
  finalDirection: "over" | "under" | "withinTolerance";
}

export interface PeriodActualAnalysisConfig {
  taxYear: "2024-25";
  payFrequency: PayFrequency;
  totalPeriodsInYear: number;
  baseTaxCode: string;
  config: TaxYearConfig;
  toleranceAmount?: number; // default 50
  tolerancePercent?: number; // default 0.1 = 10%
}

/**
 * Determine variance direction based on amount, expected value, and tolerance.
 */
function determineDirection(
  amount: number,
  expected: number,
  toleranceAmount: number,
  tolerancePercent: number
): "over" | "under" | "withinTolerance" {
  const absAmount = Math.abs(amount);
  const toleranceThreshold = Math.max(
    toleranceAmount,
    tolerancePercent * Math.max(expected, 1)
  );

  if (absAmount < toleranceThreshold) {
    return "withinTolerance";
  }

  if (amount > 0) {
    return "over";
  }

  return "under";
}

/**
 * Analyse actual tax paid vs expected tax for a series of periods.
 * 
 * Algorithm:
 * 1. Sort periods by periodIndex ascending
 * 2. For each period, calculate expected tax using calculatePeriodTax
 * 3. Compare actual vs expected and track cumulative variance
 * 4. Return per-period and cumulative analysis
 * 
 * @param cfg - Analysis configuration
 * @param periods - Array of period inputs with actual tax paid
 * @returns Analysis result with per-period and cumulative variance
 */
export function analyseActualVsExpectedTax(
  cfg: PeriodActualAnalysisConfig,
  periods: PeriodActualInput[]
): PeriodActualAnalysisResult {
  const toleranceAmount = cfg.toleranceAmount ?? 50;
  const tolerancePercent = cfg.tolerancePercent ?? 0.1;

  // Handle empty periods gracefully
  if (periods.length === 0) {
    return {
      items: [],
      finalCumulativeAmount: 0,
      finalDirection: "withinTolerance",
    };
  }

  // Sort periods by periodIndex ascending
  const sortedPeriods = [...periods].sort((a, b) => a.periodIndex - b.periodIndex);

  // Initialize running YTD trackers for actual values
  let ytdGross = 0;
  let ytdTaxActual = 0;
  let cumulativeVariance = 0;

  const items: PeriodActualAnalysisItem[] = [];

  for (const period of sortedPeriods) {
    // Update YTD actual before this period
    const ytdGrossBefore = ytdGross;
    const ytdTaxBefore = ytdTaxActual;

    // Determine effective tax code
    const taxCode =
      period.taxCodeOverride?.trim() || cfg.baseTaxCode;

    // Build PeriodTaxInput for this period
    const periodTaxInput: PeriodTaxInput = {
      taxYear: cfg.taxYear,
      payFrequency: cfg.payFrequency,
      periodIndex: period.periodIndex,
      totalPeriodsInYear: cfg.totalPeriodsInYear,
      grossForPeriod: period.grossForPeriod,
      pensionForPeriod: period.pensionForPeriod,
      ytdGrossBeforeThisPeriod: ytdGrossBefore,
      ytdTaxBeforeThisPeriod: ytdTaxBefore,
      ytdNiBeforeThisPeriod: 0, // Not used for this analysis
      ytdStudentLoanBeforeThisPeriod: 0, // Not used for this analysis
      taxCode,
      config: cfg.config,
    };

    // Calculate expected tax using the period tax engine
    const result: PeriodTaxResult = calculatePeriodTax(periodTaxInput);

    // Expected values
    const expectedPeriodTax = result.period.paye;
    // Use ytdExpected.paye as the "ideal expected" YTD
    const expectedYtdTax = result.ytdExpected.paye;

    // Actual values
    const actualTaxForPeriod = period.actualTaxForPeriod;
    const actualYtdTax = ytdTaxBefore + actualTaxForPeriod;

    // Variance calculations
    const periodVariance = actualTaxForPeriod - expectedPeriodTax;
    cumulativeVariance += periodVariance;

    // Determine directions
    const periodDirection = determineDirection(
      periodVariance,
      expectedPeriodTax,
      toleranceAmount,
      tolerancePercent
    );

    const cumulativeDirection = determineDirection(
      cumulativeVariance,
      expectedYtdTax,
      toleranceAmount,
      tolerancePercent
    );

    // Create analysis item
    items.push({
      periodIndex: period.periodIndex,
      expected: {
        payeForPeriod: expectedPeriodTax,
        ytdPaye: expectedYtdTax,
      },
      actual: {
        taxForPeriod: actualTaxForPeriod,
        ytdTax: actualYtdTax,
      },
      variance: {
        periodAmount: periodVariance,
        periodDirection,
        cumulativeAmount: cumulativeVariance,
        cumulativeDirection,
      },
    });

    // Update YTD trackers
    ytdGross += period.grossForPeriod;
    ytdTaxActual += actualTaxForPeriod;
  }

  // Determine final direction
  const lastItem = items[items.length - 1];
  const finalExpectedYtd = lastItem?.expected.ytdPaye ?? 0;
  const finalDirection = determineDirection(
    cumulativeVariance,
    finalExpectedYtd,
    toleranceAmount,
    tolerancePercent
  );

  return {
    items,
    finalCumulativeAmount: cumulativeVariance,
    finalDirection,
  };
}


