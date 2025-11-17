import { describe, expect, it } from "vitest";
import { getIncomePercentileForAge } from "../getIncomePercentileForAge";

describe("getIncomePercentileForAge", () => {
  it("returns low percentile for very low income", () => {
    const res = getIncomePercentileForAge({
      age: 30,
      income: 5_000,
    });

    expect(res).not.toBeNull();
    expect(res!.percentile).toBeGreaterThanOrEqual(0);
    expect(res!.percentile).toBeLessThan(10);
  });

  it("returns high percentile for very high income", () => {
    const res = getIncomePercentileForAge({
      age: 30,
      income: 200_000,
    });

    expect(res).not.toBeNull();
    expect(res!.percentile).toBeGreaterThan(90);
    expect(res!.percentile).toBeLessThanOrEqual(100);
  });

  it("returns around median for middle-of-range income", () => {
    const res = getIncomePercentileForAge({
      age: 30,
      income: 33_000,
    });

    expect(res).not.toBeNull();
    expect(res!.percentile).toBeGreaterThanOrEqual(40);
    expect(res!.percentile).toBeLessThanOrEqual(60);
    expect(res!.bandLabel === "Around average" || res!.bandLabel === "Above average").toBe(true);
  });
});


