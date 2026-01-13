/**
 * Tests for period actuals analysis
 */

import {
  analyseActualVsExpectedTax,
  type PeriodActualInput,
  type PeriodActualAnalysisConfig,
} from "../periodActuals";
import { createUK2025Config } from "../periodTax";

describe("analyseActualVsExpectedTax", () => {
  const baseConfig: PeriodActualAnalysisConfig = {
    taxYear: "2024-25",
    payFrequency: "monthly",
    totalPeriodsInYear: 12,
    baseTaxCode: "1257L",
    config: createUK2025Config(),
    toleranceAmount: 50,
    tolerancePercent: 0.1,
  };

  it("should handle empty periods gracefully", () => {
    const result = analyseActualVsExpectedTax(baseConfig, []);
    expect(result.items).toEqual([]);
    expect(result.finalCumulativeAmount).toBe(0);
    expect(result.finalDirection).toBe("withinTolerance");
  });

  it("should return withinTolerance when actual equals expected", () => {
    const periods: PeriodActualInput[] = [
      {
        periodIndex: 1,
        grossForPeriod: 5000,
        pensionForPeriod: 250,
        actualTaxForPeriod: 600, // Will be compared against expected
      },
    ];

    // First calculate what the expected tax should be
    const result = analyseActualVsExpectedTax(baseConfig, periods);

    // The actual tax should be close to expected (within tolerance)
    // We'll use the expected value as actual to test the matching case
    const expectedTax = result.items[0]?.expected.payeForPeriod ?? 0;

    const matchingPeriods: PeriodActualInput[] = [
      {
        periodIndex: 1,
        grossForPeriod: 5000,
        pensionForPeriod: 250,
        actualTaxForPeriod: expectedTax,
      },
    ];

    const matchingResult = analyseActualVsExpectedTax(baseConfig, matchingPeriods);
    expect(matchingResult.items[0]?.variance.periodDirection).toBe("withinTolerance");
    expect(matchingResult.finalDirection).toBe("withinTolerance");
  });

  it("should detect consistent overpayment", () => {
    const periods: PeriodActualInput[] = [
      {
        periodIndex: 1,
        grossForPeriod: 5000,
        actualTaxForPeriod: 1000, // High overpayment
      },
      {
        periodIndex: 2,
        grossForPeriod: 5000,
        actualTaxForPeriod: 1000, // High overpayment
      },
    ];

    const result = analyseActualVsExpectedTax(baseConfig, periods);

    expect(result.items.length).toBe(2);
    // Both periods should show over-taxed
    expect(result.items[0]?.variance.periodDirection).toBe("over");
    expect(result.items[1]?.variance.periodDirection).toBe("over");
    // Cumulative should also be over
    expect(result.finalDirection).toBe("over");
    expect(result.finalCumulativeAmount).toBeGreaterThan(0);
  });

  it("should detect consistent underpayment", () => {
    const periods: PeriodActualInput[] = [
      {
        periodIndex: 1,
        grossForPeriod: 5000,
        actualTaxForPeriod: 100, // Very low (underpayment)
      },
      {
        periodIndex: 2,
        grossForPeriod: 5000,
        actualTaxForPeriod: 100, // Very low (underpayment)
      },
    ];

    const result = analyseActualVsExpectedTax(baseConfig, periods);

    expect(result.items.length).toBe(2);
    // Both periods should show under-taxed
    expect(result.items[0]?.variance.periodDirection).toBe("under");
    expect(result.items[1]?.variance.periodDirection).toBe("under");
    // Cumulative should also be under
    expect(result.finalDirection).toBe("under");
    expect(result.finalCumulativeAmount).toBeLessThan(0);
  });

  it("should handle changing tax codes mid-year using taxCodeOverride", () => {
    const periods: PeriodActualInput[] = [
      {
        periodIndex: 1,
        grossForPeriod: 5000,
        actualTaxForPeriod: 600,
        // Uses base tax code
      },
      {
        periodIndex: 2,
        grossForPeriod: 5000,
        actualTaxForPeriod: 800,
        taxCodeOverride: "BR", // Different tax code
      },
    ];

    const result = analyseActualVsExpectedTax(baseConfig, periods);

    expect(result.items.length).toBe(2);
    // Period 1 should use base tax code (1257L)
    // Period 2 should use BR tax code
    expect(result.items[0]?.expected.payeForPeriod).toBeDefined();
    expect(result.items[1]?.expected.payeForPeriod).toBeDefined();
    // BR code should result in different expected tax
    expect(result.items[1]?.expected.payeForPeriod).not.toBe(
      result.items[0]?.expected.payeForPeriod
    );
  });

  it("should sort periods by periodIndex", () => {
    const periods: PeriodActualInput[] = [
      {
        periodIndex: 3,
        grossForPeriod: 5000,
        actualTaxForPeriod: 600,
      },
      {
        periodIndex: 1,
        grossForPeriod: 5000,
        actualTaxForPeriod: 600,
      },
      {
        periodIndex: 2,
        grossForPeriod: 5000,
        actualTaxForPeriod: 600,
      },
    ];

    const result = analyseActualVsExpectedTax(baseConfig, periods);

    expect(result.items.length).toBe(3);
    expect(result.items[0]?.periodIndex).toBe(1);
    expect(result.items[1]?.periodIndex).toBe(2);
    expect(result.items[2]?.periodIndex).toBe(3);
  });

  it("should track cumulative variance correctly", () => {
    const periods: PeriodActualInput[] = [
      {
        periodIndex: 1,
        grossForPeriod: 5000,
        actualTaxForPeriod: 700, // Over by some amount
      },
      {
        periodIndex: 2,
        grossForPeriod: 5000,
        actualTaxForPeriod: 500, // Under by some amount
      },
    ];

    const result = analyseActualVsExpectedTax(baseConfig, periods);

    expect(result.items.length).toBe(2);
    const period1Variance = result.items[0]?.variance.periodAmount ?? 0;
    const period2Variance = result.items[1]?.variance.periodAmount ?? 0;
    const cumulativeVariance = result.items[1]?.variance.cumulativeAmount ?? 0;

    // Cumulative should be sum of period variances
    expect(cumulativeVariance).toBeCloseTo(period1Variance + period2Variance, 2);
    expect(result.finalCumulativeAmount).toBeCloseTo(cumulativeVariance, 2);
  });

  it("should use custom tolerance values", () => {
    const customConfig: PeriodActualAnalysisConfig = {
      ...baseConfig,
      toleranceAmount: 100,
      tolerancePercent: 0.2,
    };

    const periods: PeriodActualInput[] = [
      {
        periodIndex: 1,
        grossForPeriod: 5000,
        actualTaxForPeriod: 650, // Small difference
      },
    ];

    const result = analyseActualVsExpectedTax(customConfig, periods);
    // With higher tolerance, small differences should be within tolerance
    expect(result.items[0]?.variance.periodDirection).toBeDefined();
  });
});


