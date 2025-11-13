/**
 * Tests for period-based PAYE calculation engine
 * 
 * Tests cover:
 * - Simple monthly case with standard tax code
 * - Over-taxation scenario
 * - Underpayment scenario
 * - Emergency/non-cumulative tax codes
 * - Period range aggregation
 */

import {
  calculatePeriodTax,
  aggregatePeriodRange,
  createUK2025Config,
  type PeriodTaxInput,
  type PeriodTaxResult,
} from "../periodTax";

describe("calculatePeriodTax", () => {
  const config = createUK2025Config();

  describe("Simple monthly case", () => {
    it("should calculate correct tax for £36,000 salary over 12 months", () => {
      const monthlyGross = 3000; // £36,000 annual
      const periods: PeriodTaxResult[] = [];
      let ytdGross = 0;
      let ytdTax = 0;
      let ytdNI = 0;
      let ytdStudentLoan = 0;

      // Calculate first 6 months
      for (let period = 1; period <= 6; period++) {
        const input: PeriodTaxInput = {
          taxYear: "2024-25",
          payFrequency: "monthly",
          periodIndex: period,
          totalPeriodsInYear: 12,
          grossForPeriod: monthlyGross,
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

      // After 6 months, YTD tax should be roughly half of annual tax
      const sixMonthResult = periods[5];
      const annualGross = 36000;
      const expectedAnnualTax = calculateExpectedAnnualTax(annualGross, config);

      // Allow 5% tolerance for rounding differences
      const expectedSixMonthTax = expectedAnnualTax * 0.5;
      const tolerance = expectedSixMonthTax * 0.05;

      expect(Math.abs(sixMonthResult.ytdActual.paye - expectedSixMonthTax)).toBeLessThan(
        tolerance
      );

      // Variance should be within tolerance
      expect(sixMonthResult.variance.direction).toBe("withinTolerance");
      expect(sixMonthResult.variance.toleranceBreached).toBe(false);

      // No major warnings for standard case
      const criticalWarnings = sixMonthResult.warnings.filter(
        (w) => w.severity === "critical"
      );
      expect(criticalWarnings.length).toBe(0);
    });
  });

  describe("Over-taxation scenario", () => {
    it("should detect over-taxation when early months have large spikes", () => {
      const periods: PeriodTaxResult[] = [];
      let ytdGross = 0;
      let ytdTax = 0;
      let ytdNI = 0;
      let ytdStudentLoan = 0;

      // First 3 months: high income (£5,000/month = £60k annual)
      for (let period = 1; period <= 3; period++) {
        const input: PeriodTaxInput = {
          taxYear: "2024-25",
          payFrequency: "monthly",
          periodIndex: period,
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

      // Then 3 months: lower income (£2,000/month = £24k annual)
      for (let period = 4; period <= 6; period++) {
        const input: PeriodTaxInput = {
          taxYear: "2024-25",
          payFrequency: "monthly",
          periodIndex: period,
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

      // After 6 months, should detect over-taxation
      const sixMonthResult = periods[5];

      // With lower average income, expected tax should be less than actual
      expect(sixMonthResult.variance.direction).toBe("over");
      expect(sixMonthResult.variance.toleranceBreached).toBe(true);

      // Should have over-taxation warning
      const overTaxWarnings = sixMonthResult.warnings.filter(
        (w) => w.code === "potential_overtax_mid_year"
      );
      expect(overTaxWarnings.length).toBeGreaterThan(0);
    });
  });

  describe("Underpayment scenario", () => {
    it("should detect underpayment when income spikes after low initial periods", () => {
      const periods: PeriodTaxResult[] = [];
      let ytdGross = 0;
      let ytdTax = 0;
      let ytdNI = 0;
      let ytdStudentLoan = 0;

      // First 3 months: low income (£1,000/month)
      for (let period = 1; period <= 3; period++) {
        const input: PeriodTaxInput = {
          taxYear: "2024-25",
          payFrequency: "monthly",
          periodIndex: period,
          totalPeriodsInYear: 12,
          grossForPeriod: 1000,
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

      // Then 3 months: high income (£5,000/month)
      for (let period = 4; period <= 6; period++) {
        const input: PeriodTaxInput = {
          taxYear: "2024-25",
          payFrequency: "monthly",
          periodIndex: period,
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

      // After 6 months, should detect underpayment
      const sixMonthResult = periods[5];

      // With higher average income, expected tax should be more than actual
      expect(sixMonthResult.variance.direction).toBe("under");
      expect(sixMonthResult.variance.toleranceBreached).toBe(true);

      // Should have underpayment warning
      const underTaxWarnings = sixMonthResult.warnings.filter(
        (w) => w.code === "potential_undertax_mid_year"
      );
      expect(underTaxWarnings.length).toBeGreaterThan(0);
    });
  });

  describe("Emergency / non-cumulative tax codes", () => {
    it("should detect non-cumulative tax code (W1/M1)", () => {
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
        taxCode: "1257L W1",
        config,
      };

      const result = calculatePeriodTax(input);

      const nonCumulativeWarnings = result.warnings.filter(
        (w) => w.code === "non_cumulative_code_detected"
      );
      expect(nonCumulativeWarnings.length).toBeGreaterThan(0);
    });

    it("should detect emergency tax code (0T, BR, D0)", () => {
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
        taxCode: "0T",
        config,
      };

      const result = calculatePeriodTax(input);

      const emergencyWarnings = result.warnings.filter(
        (w) => w.code === "emergency_tax_code_pattern"
      );
      expect(emergencyWarnings.length).toBeGreaterThan(0);
    });
  });

  describe("Irregular income detection", () => {
    it("should detect irregular income patterns", () => {
      const periods: PeriodTaxResult[] = [];
      let ytdGross = 0;
      let ytdTax = 0;
      let ytdNI = 0;
      let ytdStudentLoan = 0;

      // First 5 months: normal income
      for (let period = 1; period <= 5; period++) {
        const input: PeriodTaxInput = {
          taxYear: "2024-25",
          payFrequency: "monthly",
          periodIndex: period,
          totalPeriodsInYear: 12,
          grossForPeriod: 3000,
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

      // 6th month: large spike (3x average)
      const input: PeriodTaxInput = {
        taxYear: "2024-25",
        payFrequency: "monthly",
        periodIndex: 6,
        totalPeriodsInYear: 12,
        grossForPeriod: 9000, // 3x normal
        ytdGrossBeforeThisPeriod: ytdGross,
        ytdTaxBeforeThisPeriod: ytdTax,
        ytdNiBeforeThisPeriod: ytdNI,
        ytdStudentLoanBeforeThisPeriod: ytdStudentLoan,
        taxCode: "1257L",
        config,
      };

      const result = calculatePeriodTax(input);

      const irregularWarnings = result.warnings.filter(
        (w) => w.code === "multiple_jobs_or_irregular_income_possible"
      );
      expect(irregularWarnings.length).toBeGreaterThan(0);
    });
  });
});

describe("aggregatePeriodRange", () => {
  it("should correctly aggregate totals for a range of periods", () => {
    const config = createUK2025Config();
    const periods: PeriodTaxResult[] = [];
    let ytdGross = 0;
    let ytdTax = 0;
    let ytdNI = 0;
    let ytdStudentLoan = 0;

    // Create 4 periods
    for (let period = 1; period <= 4; period++) {
      const input: PeriodTaxInput = {
        taxYear: "2024-25",
        payFrequency: "monthly",
        periodIndex: period,
        totalPeriodsInYear: 12,
        grossForPeriod: 3000,
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

    // Aggregate periods 1-2 (indices 0-1)
    const aggregation = aggregatePeriodRange({
      periods,
      fromIndex: 0,
      toIndex: 1,
    });

    expect(aggregation.fromIndex).toBe(0);
    expect(aggregation.toIndex).toBe(1);
    expect(aggregation.periodsIncluded).toBe(2);

    // Totals should be sum of period 1 and 2
    const expectedGross = periods[0].period.gross + periods[1].period.gross;
    const expectedTax = periods[0].period.paye + periods[1].period.paye;
    const expectedNI = periods[0].period.ni + periods[1].period.ni;
    const expectedStudentLoan =
      periods[0].period.studentLoan + periods[1].period.studentLoan;
    const expectedNet = periods[0].period.net + periods[1].period.net;

    expect(aggregation.totals.gross).toBe(expectedGross);
    expect(aggregation.totals.tax).toBe(expectedTax);
    expect(aggregation.totals.ni).toBe(expectedNI);
    expect(aggregation.totals.studentLoan).toBe(expectedStudentLoan);
    expect(aggregation.totals.net).toBe(expectedNet);
  });

  it("should throw error for invalid range", () => {
    const periods: PeriodTaxResult[] = [];

    expect(() => {
      aggregatePeriodRange({
        periods,
        fromIndex: 0,
        toIndex: 5,
      });
    }).toThrow();

    expect(() => {
      aggregatePeriodRange({
        periods,
        fromIndex: 5,
        toIndex: 0,
      });
    }).toThrow();
  });
});

/**
 * Helper function to calculate expected annual tax
 */
function calculateExpectedAnnualTax(
  grossAnnual: number,
  config: ReturnType<typeof createUK2025Config>
): number {
  const personalAllowance = config.personalAllowance;
  const taxableIncome = Math.max(0, grossAnnual - personalAllowance);

  let tax = 0;
  let remaining = taxableIncome;

  for (const band of config.bands) {
    if (remaining <= 0) break;
    const bandWidth = band.upper
      ? Math.min(remaining, band.upper - band.lower)
      : remaining;
    tax += bandWidth * band.rate;
    remaining -= bandWidth;
  }

  return tax;
}

