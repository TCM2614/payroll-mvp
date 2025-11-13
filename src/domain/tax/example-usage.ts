/**
 * Example usage of the period-based PAYE calculation engine
 * 
 * This file demonstrates how to use calculatePeriodTax and aggregatePeriodRange
 * for calculating tax on a period-by-period basis and detecting mid-year variances.
 */

import {
  calculatePeriodTax,
  aggregatePeriodRange,
  createUK2025Config,
  type PeriodTaxInput,
  type PeriodTaxResult,
} from "./periodTax";

/**
 * Example 1: Calculate tax for a single period
 */
export function exampleSinglePeriod() {
  const config = createUK2025Config();

  // Month 6 of the tax year
  const input: PeriodTaxInput = {
    taxYear: "2024-25",
    payFrequency: "monthly",
    periodIndex: 6,
    totalPeriodsInYear: 12,
    grossForPeriod: 3000, // £3,000 this month
    pensionForPeriod: 150, // £150 pension contribution
    studentLoanPlan: "plan2",
    ytdGrossBeforeThisPeriod: 15000, // £15,000 earned in months 1-5
    ytdTaxBeforeThisPeriod: 2500, // £2,500 tax paid so far
    ytdNiBeforeThisPeriod: 1200, // £1,200 NI paid so far
    ytdStudentLoanBeforeThisPeriod: 450, // £450 student loan paid so far
    taxCode: "1257L",
    config,
  };

  const result = calculatePeriodTax(input);

  console.log("Period Breakdown:", result.period);
  console.log("YTD Actual:", result.ytdActual);
  console.log("YTD Expected:", result.ytdExpected);
  console.log("Variance:", result.variance);
  console.log("Warnings:", result.warnings);

  return result;
}

/**
 * Example 2: Calculate tax for multiple periods (full tax year)
 */
export function exampleFullTaxYear() {
  const config = createUK2025Config();
  const monthlyGross = 3000; // £36,000 annual salary
  const monthlyPension = 150; // 5% pension contribution

  const periods: PeriodTaxResult[] = [];
  let ytdGross = 0;
  let ytdTax = 0;
  let ytdNI = 0;
  let ytdStudentLoan = 0;

  // Calculate all 12 months
  for (let month = 1; month <= 12; month++) {
    const input: PeriodTaxInput = {
      taxYear: "2024-25",
      payFrequency: "monthly",
      periodIndex: month,
      totalPeriodsInYear: 12,
      grossForPeriod: monthlyGross,
      pensionForPeriod: monthlyPension,
      studentLoanPlan: "plan2",
      ytdGrossBeforeThisPeriod: ytdGross,
      ytdTaxBeforeThisPeriod: ytdTax,
      ytdNiBeforeThisPeriod: ytdNI,
      ytdStudentLoanBeforeThisPeriod: ytdStudentLoan,
      taxCode: "1257L",
      config,
    };

    const result = calculatePeriodTax(input);
    periods.push(result);

    // Update YTD values for next period
    ytdGross = result.ytdActual.gross;
    ytdTax = result.ytdActual.paye;
    ytdNI = result.ytdActual.ni;
    ytdStudentLoan = result.ytdActual.studentLoan;
  }

  return periods;
}

/**
 * Example 3: Detect over-taxation scenario
 * 
 * Early months have high income, later months have lower income
 */
export function exampleOverTaxation() {
  const config = createUK2025Config();
  const periods: PeriodTaxResult[] = [];
  let ytdGross = 0;
  let ytdTax = 0;
  let ytdNI = 0;
  let ytdStudentLoan = 0;

  // First 3 months: high income (£5,000/month)
  for (let month = 1; month <= 3; month++) {
    const input: PeriodTaxInput = {
      taxYear: "2024-25",
      payFrequency: "monthly",
      periodIndex: month,
      totalPeriodsInYear: 12,
      grossForPeriod: 5000,
      ytdGrossBeforeThisPeriod: ytdGross,
      ytdTaxBeforeThisPeriod: ytdTax,
      ytdNiBeforeThisPeriod: ytdNI,
      ytdStudentLoanBeforeThisPeriod: ytdStudentLoan,
      taxCode: "1257L",
      config,
    };

    const result = calculatePeriodTax(input);
    periods.push(result);

    ytdGross = result.ytdActual.gross;
    ytdTax = result.ytdActual.paye;
    ytdNI = result.ytdActual.ni;
    ytdStudentLoan = result.ytdActual.studentLoan;
  }

  // Next 3 months: lower income (£2,000/month)
  for (let month = 4; month <= 6; month++) {
    const input: PeriodTaxInput = {
      taxYear: "2024-25",
      payFrequency: "monthly",
      periodIndex: month,
      totalPeriodsInYear: 12,
      grossForPeriod: 2000,
      ytdGrossBeforeThisPeriod: ytdGross,
      ytdTaxBeforeThisPeriod: ytdTax,
      ytdNiBeforeThisPeriod: ytdNI,
      ytdStudentLoanBeforeThisPeriod: ytdStudentLoan,
      taxCode: "1257L",
      config,
    };

    const result = calculatePeriodTax(input);
    periods.push(result);

    ytdGross = result.ytdActual.gross;
    ytdTax = result.ytdActual.paye;
    ytdNI = result.ytdActual.ni;
    ytdStudentLoan = result.ytdActual.studentLoan;
  }

  // Check for over-taxation warnings
  const sixMonthResult = periods[5];
  const overTaxWarnings = sixMonthResult.warnings.filter(
    (w) => w.code === "potential_overtax_mid_year"
  );

  return {
    periods,
    sixMonthResult,
    overTaxWarnings,
    variance: sixMonthResult.variance,
  };
}

/**
 * Example 4: Aggregate totals for a specific range of periods
 * 
 * "How much tax did I pay between months 3 and 6?"
 */
export function examplePeriodRange() {
  // First, calculate all periods (using example from above)
  const allPeriods = exampleFullTaxYear();

  // Aggregate months 3-6 (indices 2-5, 0-based)
  const aggregation = aggregatePeriodRange({
    periods: allPeriods,
    fromIndex: 2, // Month 3 (0-based index)
    toIndex: 5, // Month 6 (0-based index)
  });

  console.log("Periods included:", aggregation.periodsIncluded);
  console.log("Total gross:", aggregation.totals.gross);
  console.log("Total tax:", aggregation.totals.tax);
  console.log("Total NI:", aggregation.totals.ni);
  console.log("Total net:", aggregation.totals.net);

  return aggregation;
}

/**
 * Example 5: Weekly pay frequency
 */
export function exampleWeeklyPay() {
  const config = createUK2025Config();
  const weeklyGross = 692.31; // ~£36,000 annual / 52 weeks

  const periods: PeriodTaxResult[] = [];
  let ytdGross = 0;
  let ytdTax = 0;
  let ytdNI = 0;
  let ytdStudentLoan = 0;

  // Calculate first 26 weeks (half year)
  for (let week = 1; week <= 26; week++) {
    const input: PeriodTaxInput = {
      taxYear: "2024-25",
      payFrequency: "weekly",
      periodIndex: week,
      totalPeriodsInYear: 52,
      grossForPeriod: weeklyGross,
      ytdGrossBeforeThisPeriod: ytdGross,
      ytdTaxBeforeThisPeriod: ytdTax,
      ytdNiBeforeThisPeriod: ytdNI,
      ytdStudentLoanBeforeThisPeriod: ytdStudentLoan,
      taxCode: "1257L",
      config,
    };

    const result = calculatePeriodTax(input);
    periods.push(result);

    ytdGross = result.ytdActual.gross;
    ytdTax = result.ytdActual.paye;
    ytdNI = result.ytdActual.ni;
    ytdStudentLoan = result.ytdActual.studentLoan;
  }

  return periods;
}

/**
 * Example 6: Handle emergency tax code
 */
export function exampleEmergencyTaxCode() {
  const config = createUK2025Config();

  const input: PeriodTaxInput = {
    taxYear: "2024-25",
    payFrequency: "monthly",
    periodIndex: 1,
    totalPeriodsInYear: 12,
    grossForPeriod: 3000,
    ytdGrossBeforeThisPeriod: 0,
    ytdTaxBeforeThisPeriod: 0,
    ytdNiBeforeThisPeriod: 0,
    ytdStudentLoanBeforeThisPeriod: 0,
    taxCode: "0T", // Emergency tax code
    config,
  };

  const result = calculatePeriodTax(input);

  // Check for emergency tax code warning
  const emergencyWarnings = result.warnings.filter(
    (w) => w.code === "emergency_tax_code_pattern"
  );

  return {
    result,
    emergencyWarnings,
  };
}

