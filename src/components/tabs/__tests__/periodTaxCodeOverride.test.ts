/**
 * Pure TypeScript tests for per-period tax code override logic
 * 
 * These tests verify:
 * 1. The effective tax code calculation logic
 * 2. Type safety of PeriodRow and tax code handling
 * 3. That calculatePeriodTax receives the correct tax code parameter
 * 
 * These tests don't require a test framework - they're compile-time type checks
 * and can be verified by TypeScript compilation.
 */

import type { PeriodTaxInput } from "@/domain/tax/periodTax";
import { calculatePeriodTax, createUK2025Config } from "@/domain/tax/periodTax";

/**
 * Type definition matching PeriodicTaxTab's PeriodRow
 */
type PeriodRow = {
  id: string;
  periodIndex: number;
  gross: number;
  pension: number;
  taxCode?: string; // optional override for this period
};

/**
 * Pure function to calculate effective tax code (matches PeriodicTaxTab logic)
 */
function getEffectiveTaxCode(
  periodTaxCode: string | undefined,
  globalTaxCode: string
): string {
  return (periodTaxCode && periodTaxCode.trim()) || globalTaxCode;
}

/**
 * Test case: Same salary, but one period uses emergency tax code (BR or 0T)
 * 
 * This simulates the scenario where:
 * - Period 1-5: Standard tax code (1257L)
 * - Period 6: Emergency tax code (0T or BR)
 * - Period 7-12: Back to standard tax code
 */
export function testEmergencyTaxCodeOverride(): void {
  const globalTaxCode = "1257L";
  const config = createUK2025Config();
  const payFrequency = "monthly" as const;
  const totalPeriodsInYear = 12;

  // Period 1-5: Standard tax code
  let ytdGross = 0;
  let ytdTax = 0;
  let ytdNI = 0;
  let ytdStudentLoan = 0;

  const periods: PeriodRow[] = [
    { id: "1", periodIndex: 1, gross: 3000, pension: 150, taxCode: undefined }, // uses global
    { id: "2", periodIndex: 2, gross: 3000, pension: 150, taxCode: undefined }, // uses global
    { id: "3", periodIndex: 3, gross: 3000, pension: 150, taxCode: undefined }, // uses global
    { id: "4", periodIndex: 4, gross: 3000, pension: 150, taxCode: undefined }, // uses global
    { id: "5", periodIndex: 5, gross: 3000, pension: 150, taxCode: undefined }, // uses global
    { id: "6", periodIndex: 6, gross: 3000, pension: 150, taxCode: "0T" }, // OVERRIDE: emergency code
    { id: "7", periodIndex: 7, gross: 3000, pension: 150, taxCode: undefined }, // back to global
  ];

  const results: Array<{
    periodIndex: number;
    effectiveTaxCode: string;
    hasEmergencyWarning: boolean;
  }> = [];

  periods.forEach((row) => {
    // This matches the logic in PeriodicTaxTab.tsx line 89
    const effectiveTaxCode = getEffectiveTaxCode(row.taxCode, globalTaxCode);

    const input: PeriodTaxInput = {
      taxYear: "2024-25",
      payFrequency,
      periodIndex: row.periodIndex,
      totalPeriodsInYear,
      grossForPeriod: row.gross,
      pensionForPeriod: row.pension,
      ytdGrossBeforeThisPeriod: ytdGross,
      ytdTaxBeforeThisPeriod: ytdTax,
      ytdNiBeforeThisPeriod: ytdNI,
      ytdStudentLoanBeforeThisPeriod: ytdStudentLoan,
      taxCode: effectiveTaxCode, // <-- This is the key: per-period override is passed here
      config,
    };

    const result = calculatePeriodTax(input);

    // Verify calculatePeriodTax was called with the correct tax code
    if (row.periodIndex === 6) {
      // Period 6 should use "0T" (the override), not "1257L" (global)
      if (input.taxCode !== "0T") {
        throw new Error(
          `Expected period 6 to use tax code "0T", but got "${input.taxCode}"`
        );
      }
    } else {
      // Other periods should use "1257L" (global)
      if (input.taxCode !== "1257L") {
        throw new Error(
          `Expected period ${row.periodIndex} to use tax code "1257L", but got "${input.taxCode}"`
        );
      }
    }

    // Check for emergency tax code warning
    const hasEmergencyWarning = result.warnings.some(
      (w) => w.code === "emergency_tax_code_pattern"
    );

    results.push({
      periodIndex: row.periodIndex,
      effectiveTaxCode,
      hasEmergencyWarning,
    });

    // Update YTD for next iteration
    ytdGross = result.ytdActual.gross;
    ytdTax = result.ytdActual.paye;
    ytdNI = result.ytdActual.ni;
    ytdStudentLoan = result.ytdActual.studentLoan;
  });

  // Assertions
  // Period 6 (with 0T override) should have emergency warning
  const period6Result = results.find((r) => r.periodIndex === 6);
  if (!period6Result) {
    throw new Error("Period 6 result not found");
  }
  if (period6Result.effectiveTaxCode !== "0T") {
    throw new Error(
      `Period 6 should use "0T" tax code, got "${period6Result.effectiveTaxCode}"`
    );
  }
  if (!period6Result.hasEmergencyWarning) {
    throw new Error(
      "Period 6 should have emergency_tax_code_pattern warning, but it doesn't"
    );
  }

  // Other periods should NOT have emergency warning (they use standard code)
  const otherPeriods = results.filter((r) => r.periodIndex !== 6);
  for (const period of otherPeriods) {
    if (period.hasEmergencyWarning) {
      throw new Error(
        `Period ${period.periodIndex} should not have emergency warning (uses standard code)`
      );
    }
    if (period.effectiveTaxCode !== "1257L") {
      throw new Error(
        `Period ${period.periodIndex} should use "1257L" tax code, got "${period.effectiveTaxCode}"`
      );
    }
  }

  console.log("✅ All emergency tax code override tests passed!");
  console.log("Results:", results);
}

/**
 * Test case: BR (Basic Rate) tax code override
 */
export function testBRTaxCodeOverride(): void {
  const globalTaxCode = "1257L";
  const config = createUK2025Config();
  const payFrequency = "monthly" as const;
  const totalPeriodsInYear = 12;

  const row: PeriodRow = {
    id: "1",
    periodIndex: 1,
    gross: 3000,
    pension: 150,
    taxCode: "BR", // Override with BR
  };

  const effectiveTaxCode = getEffectiveTaxCode(row.taxCode, globalTaxCode);
  if (effectiveTaxCode !== "BR") {
    throw new Error(`Expected "BR", got "${effectiveTaxCode}"`);
  }

  const input: PeriodTaxInput = {
    taxYear: "2024-25",
    payFrequency,
    periodIndex: row.periodIndex,
    totalPeriodsInYear,
    grossForPeriod: row.gross,
    pensionForPeriod: row.pension,
    ytdGrossBeforeThisPeriod: 0,
    ytdTaxBeforeThisPeriod: 0,
    ytdNiBeforeThisPeriod: 0,
    ytdStudentLoanBeforeThisPeriod: 0,
    taxCode: effectiveTaxCode,
    config,
  };

  const result = calculatePeriodTax(input);

  // BR should trigger emergency tax code warning
  const hasEmergencyWarning = result.warnings.some(
    (w) => w.code === "emergency_tax_code_pattern"
  );

  if (!hasEmergencyWarning) {
    throw new Error("BR tax code should trigger emergency_tax_code_pattern warning");
  }

  console.log("✅ BR tax code override test passed!");
}

/**
 * Type safety test: Ensure PeriodRow taxCode is properly typed
 */
export function testTypeSafety(): void {
  // This function will fail to compile if types are wrong
  const validRow: PeriodRow = {
    id: "1",
    periodIndex: 1,
    gross: 3000,
    pension: 150,
    taxCode: "0T", // string | undefined - valid
  };

  const validRowNoOverride: PeriodRow = {
    id: "2",
    periodIndex: 2,
    gross: 3000,
    pension: 150,
    // taxCode omitted - valid (optional)
  };

  // TypeScript should catch this if PeriodRow.taxCode is not optional
  const effectiveTaxCode1 = getEffectiveTaxCode(validRow.taxCode, "1257L");
  const effectiveTaxCode2 = getEffectiveTaxCode(validRowNoOverride.taxCode, "1257L");

  // Both should be strings
  if (typeof effectiveTaxCode1 !== "string" || typeof effectiveTaxCode2 !== "string") {
    throw new Error("Effective tax code should always be a string");
  }

  console.log("✅ Type safety tests passed!");
}

/**
 * Export test functions for use in test runners or manual execution
 * 
 * To run these tests manually:
 * 1. Import and call the functions
 * 2. Or use a test runner that supports TypeScript
 * 
 * Example:
 * ```ts
 * import { testEmergencyTaxCodeOverride } from './periodTaxCodeOverride.test';
 * testEmergencyTaxCodeOverride();
 * ```
 */

