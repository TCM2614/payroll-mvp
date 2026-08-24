/**
 * Regression coverage for the wealth-percentile logic against **every**
 * age band the UI exposes.
 *
 * This spec was added after we spotted two related bugs on the
 * How-rich-are-you? tab:
 *   1. Any income above the top data anchor was reported as "100th
 *      percentile" (both £61k and £250k came out identical for a 25–29
 *      year old).
 *   2. The result-card headline collapsed to "You earn more than 100% of
 *      people your age", which is impossible.
 *
 * The fixes rely on the same code path being exercised for all 11 age
 * bands defined in `incomePercentilesByAge.ts`, so this spec sweeps every
 * band explicitly. Update it when new bands are added or the extrapolation
 * curve changes shape.
 */

import { describe, expect, it } from "vitest";
import {
  getIncomePercentileForAge,
  type IncomePercentileResult,
} from "../getIncomePercentileForAge";
import { incomePercentilesByAge } from "@/data/incomePercentilesByAge";

interface AgeBand {
  ageMin: number;
  ageMax: number;
}

/** Distinct age bands defined in the dataset, ordered by ageMin. */
const AGE_BANDS: AgeBand[] = Array.from(
  new Map(
    incomePercentilesByAge.map((row) => [
      `${row.ageMin}-${row.ageMax}`,
      { ageMin: row.ageMin, ageMax: row.ageMax },
    ]),
  ).values(),
).sort((a, b) => a.ageMin - b.ageMin);

const midAge = (band: AgeBand): number =>
  Math.floor((band.ageMin + band.ageMax) / 2);

describe("getIncomePercentileForAge — age-band coverage", () => {
  it("exposes at least one age band per five-year bucket from 18 to 74", () => {
    // We should never quietly lose an age band. The UI validates against
    // 18–74 and expects a hit for every age in that window.
    const bandsCoverAge = (age: number): boolean =>
      AGE_BANDS.some((b) => age >= b.ageMin && age <= b.ageMax);
    for (let age = 18; age <= 74; age++) {
      expect(bandsCoverAge(age)).toBe(true);
    }
  });

  it.each(AGE_BANDS)(
    "returns a labelled, well-formed result for ages $ageMin–$ageMax",
    (band) => {
      const res = getIncomePercentileForAge({
        age: midAge(band),
        income: 30_000,
      });

      expect(res).not.toBeNull();
      const r = res as IncomePercentileResult;
      expect(r.ageBand).toEqual(band);
      expect(r.ageGroupLabel).toBe(`Ages ${band.ageMin}–${band.ageMax}`);
      expect(r.medianIncomeForAgeGroup).toBeGreaterThan(0);
      expect(r.p10Income).toBeGreaterThan(0);
      expect(r.p90Income).toBeGreaterThan(r.medianIncomeForAgeGroup);
    },
  );
});

describe("getIncomePercentileForAge — age-band boundary mapping", () => {
  it.each(AGE_BANDS)(
    "maps ageMin ($ageMin) and ageMax ($ageMax) to the same band $ageMin–$ageMax",
    (band) => {
      for (const age of [band.ageMin, band.ageMax]) {
        const res = getIncomePercentileForAge({ age, income: 30_000 });
        expect(res).not.toBeNull();
        expect(res!.ageBand).toEqual(band);
      }
    },
  );

  it("rejects ages outside the supported 18–74 window", () => {
    expect(getIncomePercentileForAge({ age: 17, income: 30_000 })).toBeNull();
    expect(getIncomePercentileForAge({ age: 75, income: 30_000 })).toBeNull();
  });
});

describe("getIncomePercentileForAge — top-tail extrapolation", () => {
  it.each(AGE_BANDS)(
    "never reports exactly 100% for ages $ageMin–$ageMax, even at absurd incomes",
    (band) => {
      const res = getIncomePercentileForAge({
        age: midAge(band),
        income: 10_000_000,
      });
      expect(res).not.toBeNull();
      expect(res!.percentile).toBeLessThan(100);
      // The extrapolation is capped at 99.9 in the source; leave a hair of
      // wiggle room here so a small refactor doesn't accidentally break
      // the guarantee we care about (which is strictly < 100).
      expect(res!.percentile).toBeLessThanOrEqual(99.9);
    },
  );

  it.each(AGE_BANDS)(
    "produces strictly-increasing percentiles above the top anchor for ages $ageMin–$ageMax",
    (band) => {
      const incomes = [50_000, 60_000, 75_000, 100_000, 150_000, 250_000, 1_000_000];
      const percentiles = incomes.map((income) => {
        const r = getIncomePercentileForAge({ age: midAge(band), income });
        return r!.percentile;
      });
      for (let i = 1; i < percentiles.length; i++) {
        // >= (not >) because two incomes near the p95 anchor can round to
        // the same 1-decimal value; the important thing is monotonicity.
        expect(percentiles[i]).toBeGreaterThanOrEqual(percentiles[i - 1]);
      }
      // And the last one must be strictly higher than the first —
      // otherwise the tail has collapsed to a flat clamp again.
      expect(percentiles[percentiles.length - 1]).toBeGreaterThan(percentiles[0]);
    },
  );

  it.each(AGE_BANDS)(
    "grades the tail — £61k and £250k should not tie for ages $ageMin–$ageMax",
    (band) => {
      const r61 = getIncomePercentileForAge({
        age: midAge(band),
        income: 61_000,
      });
      const r250 = getIncomePercentileForAge({
        age: midAge(band),
        income: 250_000,
      });
      expect(r61).not.toBeNull();
      expect(r250).not.toBeNull();
      // For young/older bands where £61k is already above the top anchor
      // this is the regression this whole suite exists to prevent.
      // For mid-career bands where £61k sits inside the interpolated
      // range, r250 will simply be higher.
      expect(r250!.percentile).toBeGreaterThan(r61!.percentile);
    },
  );
});

describe("getIncomePercentileForAge — age-relative calibration", () => {
  it("treats £30k differently for 25–29 vs 70–74", () => {
    const young = getIncomePercentileForAge({ age: 27, income: 30_000 });
    const old = getIncomePercentileForAge({ age: 72, income: 30_000 });
    expect(young).not.toBeNull();
    expect(old).not.toBeNull();
    // £30k is right on the median for 25–29 but sits high in the
    // distribution for 70–74. If those numbers ever converge, the age
    // filter is silently misbehaving.
    expect(old!.percentile).toBeGreaterThan(young!.percentile);
  });
});
