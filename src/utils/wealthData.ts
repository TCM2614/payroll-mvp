import { useMemo } from "react";

export type WealthPercentilePoint = {
  percentile: number;
  income: number;
};

// Approximate gross income percentiles for UK full-time earners (ONS, 2023/24).
// These values are rounded for simplicity but preserve the overall distribution shape.
export const wealthPercentiles: WealthPercentilePoint[] = [
  { percentile: 10, income: 12000 },
  { percentile: 20, income: 17000 },
  { percentile: 30, income: 21000 },
  { percentile: 40, income: 26000 },
  { percentile: 50, income: 35000 },
  { percentile: 60, income: 36000 },
  { percentile: 70, income: 42000 },
  { percentile: 80, income: 52000 },
  { percentile: 85, income: 58000 },
  { percentile: 90, income: 66000 },
  { percentile: 95, income: 90000 },
  { percentile: 96, income: 98000 },
  { percentile: 97, income: 108000 },
  { percentile: 98, income: 125000 },
  { percentile: 99, income: 170000 },
];

const sortedPercentiles = [...wealthPercentiles].sort(
  (a, b) => a.percentile - b.percentile,
);

function interpolateIncomeForPercentile(percentile: number): number | null {
  if (sortedPercentiles.length === 0) return null;
  const first = sortedPercentiles[0];
  const last = sortedPercentiles[sortedPercentiles.length - 1];

  if (percentile <= first.percentile) return first.income;
  if (percentile >= last.percentile) return last.income;

  for (let i = 0; i < sortedPercentiles.length - 1; i++) {
    const current = sortedPercentiles[i];
    const next = sortedPercentiles[i + 1];
    if (
      percentile >= current.percentile &&
      percentile <= next.percentile &&
      next.percentile !== current.percentile
    ) {
      const ratio =
        (percentile - current.percentile) / (next.percentile - current.percentile);
      return current.income + ratio * (next.income - current.income);
    }
  }

  return last.income;
}

function interpolatePercentileForIncome(income: number): number {
  if (sortedPercentiles.length === 0) return 0;
  const first = sortedPercentiles[0];
  const last = sortedPercentiles[sortedPercentiles.length - 1];

  if (income <= first.income) return first.percentile;
  if (income >= last.income) return last.percentile;

  for (let i = 0; i < sortedPercentiles.length - 1; i++) {
    const current = sortedPercentiles[i];
    const next = sortedPercentiles[i + 1];
    if (income >= current.income && income <= next.income) {
      if (next.income === current.income) {
        return next.percentile;
      }
      const ratio = (income - current.income) / (next.income - current.income);
      return current.percentile + ratio * (next.percentile - current.percentile);
    }
  }

  return last.percentile;
}

export function getIncomeForPercentile(percentile: number): number | null {
  return interpolateIncomeForPercentile(percentile);
}

export function getPercentileForIncome(income: number): number {
  return interpolatePercentileForIncome(income);
}

export const UK_MEDIAN_INCOME =
  getIncomeForPercentile(50) ?? sortedPercentiles[4]?.income ?? 0;
export const UK_AVERAGE_SALARY = 35000;

export type WealthComparison = {
  percentile: number | null;
  aboveMedianPercent: number | null;
  comparisonText: string | null;
};

export function useWealthPercentile(
  salary?: number | null,
): WealthComparison {
  return useMemo(() => {
    if (!salary || salary <= 0) {
      return {
        percentile: null,
        aboveMedianPercent: null,
        comparisonText: null,
      };
    }

    const percentile = Number(getPercentileForIncome(salary).toFixed(1));

    const aboveMedianPercent =
      UK_MEDIAN_INCOME > 0
        ? Number((((salary - UK_MEDIAN_INCOME) / UK_MEDIAN_INCOME) * 100).toFixed(1))
        : null;

    const comparisonText =
      percentile != null
        ? `You earn more than ${percentile}% of the UK population.`
        : null;

    return {
      percentile,
      aboveMedianPercent,
      comparisonText,
    };
  }, [salary]);
}
