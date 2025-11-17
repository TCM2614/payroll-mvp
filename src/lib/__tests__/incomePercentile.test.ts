import { getIncomePercentileForAge } from "@/lib/getIncomePercentileForAge";

/**
 * Lightweight runtime sanity checks for income percentile logic.
 * 
 * These follow the same pattern as other compile-time / runtime tests in this
 * project: they can be invoked manually or by a test runner, and will throw if
 * expectations are not met.
 */

export function testVeryLowIncomeIsLowPercentile(): void {
  const res = getIncomePercentileForAge({ age: 30, income: 5_000 });
  if (!res) {
    throw new Error("Expected a result for age 30, income 5k");
  }
  if (res.percentile >= 25) {
    throw new Error(`Expected very low income to be below 25th percentile, got ${res.percentile}`);
  }
}

export function testVeryHighIncomeIsHighPercentile(): void {
  const res = getIncomePercentileForAge({ age: 30, income: 150_000 });
  if (!res) {
    throw new Error("Expected a result for age 30, income 150k");
  }
  if (res.percentile <= 75) {
    throw new Error(`Expected very high income to be above 75th percentile, got ${res.percentile}`);
  }
}

export function testMiddleIncomeAroundMedian(): void {
  // For 30–34, median anchor is ~33k, so 33k should sit roughly around 50th percentile.
  const res = getIncomePercentileForAge({ age: 32, income: 33_000 });
  if (!res) {
    throw new Error("Expected a result for age 32, income 33k");
  }
  if (res.percentile < 30 || res.percentile > 70) {
    throw new Error(
      `Expected middle income to be around the median (30–70th pct), got ${res.percentile}`,
    );
  }
}


