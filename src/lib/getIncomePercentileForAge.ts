import { incomePercentilesByAge } from "@/data/incomePercentilesByAge";

export type IncomePercentileResult = {
  /** Estimated percentile position (0–100, rounded to 1 decimal place internally). */
  percentile: number;
  /** Human-readable band label derived from percentile. */
  bandLabel: string; // “Below median”, “Around average”, “Above average”, “Top 25%”, “Top 10%”
  /** Age band used for the calculation. */
  ageBand: { ageMin: number; ageMax: number };
  /** Convenience label for the age group, e.g. "Ages 25–29". */
  ageGroupLabel: string;
  /** Approximate median gross annual income for this age band. */
  medianIncomeForAgeGroup: number;
  /** Approximate 10th percentile gross annual income for this age band. */
  p10Income: number;
  /** Approximate 90th percentile gross annual income for this age band. */
  p90Income: number;
};

type GetIncomePercentileParams = {
  age: number;
  income: number;
  countryCode?: string; // default "UK"
};

export function getIncomePercentileForAge(
  params: GetIncomePercentileParams,
): IncomePercentileResult | null {
  const { age, income, countryCode = "UK" } = params;

  if (!Number.isFinite(age) || !Number.isFinite(income) || age <= 0 || income < 0) {
    return null;
  }

  const rowsForBand = incomePercentilesByAge.filter((row) => {
    const cc = row.countryCode ?? "UK";
    return cc === countryCode && age >= row.ageMin && age <= row.ageMax;
  });

  if (rowsForBand.length === 0) {
    return null;
  }

  // All rows in this band share the same ageMin/ageMax by construction
  const ageBand = {
    ageMin: rowsForBand[0].ageMin,
    ageMax: rowsForBand[0].ageMax,
  };
  const ageGroupLabel = `Ages ${ageBand.ageMin}–${ageBand.ageMax}`;

  const sorted = [...rowsForBand].sort((a, b) => a.income - b.income);

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // Helper to extract key reference points for this age band
  const medianRow =
    sorted.find((row) => row.percentile === 50) ?? sorted[Math.floor(sorted.length / 2)];
  const p10Row =
    sorted.find((row) => row.percentile === 10) ?? sorted.reduce((min, row) => (row.percentile < min.percentile ? row : min), sorted[0]);
  const p90Row =
    sorted.find((row) => row.percentile === 90) ?? sorted.reduce((max, row) => (row.percentile > max.percentile ? row : max), sorted[sorted.length - 1]);

  const baseStats = {
    ageBand,
    ageGroupLabel,
    medianIncomeForAgeGroup: medianRow.income,
    p10Income: p10Row.income,
    p90Income: p90Row.income,
  };

  // Below the 10th percentile anchor – extrapolate towards 0 asymptotically
  // using the ratio of income to the p10 anchor. Someone on £1 shouldn't
  // sit in the same bucket as someone on £9,999 when p10 is £10,000.
  if (income <= first.income) {
    const denom = first.income > 0 ? first.income : 1;
    const pctRaw = first.percentile * (income / denom);
    const pct = Math.max(0, Math.min(first.percentile, pctRaw));
    const pctRounded = Math.round(pct * 10) / 10;
    return {
      percentile: pctRounded,
      bandLabel: getBandLabel(pctRounded),
      ...baseStats,
    };
  }

  // Above the top anchor – extrapolate towards 100 asymptotically rather
  // than clamping the entire top tail to a single value. Otherwise anyone
  // above the p95 anchor (£60k for 25–29 year olds) is reported as "100%",
  // which is both false and impossible.
  //
  //   percentile = last.percentile + (100 - last.percentile) · (1 - last.income / income)
  //
  // Sanity check for the p95=£60k anchor:
  //   income = £60k   → 95.0
  //   income = £72k   → 95.83
  //   income = £100k  → 97.0
  //   income = £250k  → 98.8
  //   income → ∞     → 100 (asymptotic; never reached).
  //
  // We cap the reported value at 99.9 so we never claim someone earns more
  // than 100% of their peers.
  if (income >= last.income) {
    const ratio = income > 0 ? last.income / income : 1;
    const pctRaw = last.percentile + (100 - last.percentile) * (1 - ratio);
    const pct = Math.max(last.percentile, Math.min(99.9, pctRaw));
    const pctRounded = Math.round(pct * 10) / 10;
    return {
      percentile: pctRounded,
      bandLabel: getBandLabel(pctRounded),
      ...baseStats,
    };
  }

  // In between anchors: linearly interpolate between the surrounding points
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];

    if (income >= a.income && income <= b.income) {
      // Handle the degenerate case where incomes are identical
      if (b.income === a.income) {
        const pctMid = (a.percentile + b.percentile) / 2;
        const pctRoundedMid = Math.round(pctMid * 10) / 10;
        return {
          percentile: pctRoundedMid,
          bandLabel: getBandLabel(pctRoundedMid),
          ...baseStats,
        };
      }

      const ratio = (income - a.income) / (b.income - a.income);
      const pct = a.percentile + ratio * (b.percentile - a.percentile);
      const pctRounded = Math.round(pct * 10) / 10;

      return {
        percentile: pctRounded,
        bandLabel: getBandLabel(pctRounded),
        ...baseStats,
      };
    }
  }

  // Fallback – should not normally be hit, but keep it safe
  const pctFallback = Math.round(((first.percentile + last.percentile) / 2) * 10) / 10;
  return {
    percentile: pctFallback,
    bandLabel: getBandLabel(pctFallback),
    ...baseStats,
  };
}

function getBandLabel(percentile: number): string {
  if (percentile < 25) return "Below median";
  if (percentile < 50) return "Around average";
  if (percentile < 75) return "Above average";
  if (percentile <= 90) return "Top 25%";
  return "Top 10%";
}


