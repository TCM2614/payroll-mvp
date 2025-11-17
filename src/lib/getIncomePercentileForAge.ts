import { incomePercentilesByAge } from "@/data/incomePercentilesByAge";

export type IncomePercentileResult = {
  percentile: number; // 0–100 (float, rounded to 1dp)
  bandLabel: string; // “Below median”, “Around average”, “Above average”, “Top 25%”, “Top 10%”
  ageBand: { ageMin: number; ageMax: number };
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

  const sorted = [...rowsForBand].sort((a, b) => a.income - b.income);

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // Below the 10th percentile anchor – nudge slightly below
  if (income <= first.income) {
    const pct = Math.max(0, first.percentile - 5);
    const pctRounded = Math.round(pct * 10) / 10;
    return {
      percentile: pctRounded,
      bandLabel: getBandLabel(pctRounded),
      ageBand,
    };
  }

  // Above the 95th/90th percentile anchor – nudge slightly above
  if (income >= last.income) {
    const pct = Math.min(100, last.percentile + 5);
    const pctRounded = Math.round(pct * 10) / 10;
    return {
      percentile: pctRounded,
      bandLabel: getBandLabel(pctRounded),
      ageBand,
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
          ageBand,
        };
      }

      const ratio = (income - a.income) / (b.income - a.income);
      const pct = a.percentile + ratio * (b.percentile - a.percentile);
      const pctRounded = Math.round(pct * 10) / 10;

      return {
        percentile: pctRounded,
        bandLabel: getBandLabel(pctRounded),
        ageBand,
      };
    }
  }

  // Fallback – should not normally be hit, but keep it safe
  const pctFallback = Math.round(((first.percentile + last.percentile) / 2) * 10) / 10;
  return {
    percentile: pctFallback,
    bandLabel: getBandLabel(pctFallback),
    ageBand,
  };
}

function getBandLabel(percentile: number): string {
  if (percentile < 25) return "Below median";
  if (percentile < 50) return "Around average";
  if (percentile < 75) return "Above average";
  if (percentile <= 90) return "Top 25%";
  return "Top 10%";
}


