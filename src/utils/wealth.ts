const PERCENTILE_ANCHORS = [
  { income: 12000, percentile: 10 },
  { income: 20000, percentile: 25 },
  { income: 30000, percentile: 40 },
  { income: 38000, percentile: 55 },
  { income: 50000, percentile: 70 },
  { income: 65000, percentile: 82 },
  { income: 85000, percentile: 90 },
  { income: 110000, percentile: 95 },
  { income: 150000, percentile: 98 },
  { income: 220000, percentile: 99.5 },
];

export function estimatePercentileFromIncome(income: number): number {
  if (!Number.isFinite(income) || income <= 0) return 0;
  const anchors = PERCENTILE_ANCHORS;
  if (income <= anchors[0].income) return anchors[0].percentile;
  for (let i = 0; i < anchors.length - 1; i++) {
    const current = anchors[i];
    const next = anchors[i + 1];
    if (income >= current.income && income <= next.income) {
      const ratio = (income - current.income) / (next.income - current.income || 1);
      return current.percentile + ratio * (next.percentile - current.percentile);
    }
  }
  const last = anchors[anchors.length - 1];
  const overshoot = Math.log10(income / last.income + 1);
  return Math.min(99.9, last.percentile + overshoot * 0.5 * (100 - last.percentile));
}

export function buildWealthCurveData(step = 5) {
  const points: { percentile: number; density: number }[] = [];
  for (let p = 0; p <= 100; p += step) {
    const mean = 60;
    const sigma = 18;
    const density = Math.exp(-0.5 * Math.pow((p - mean) / sigma, 2));
    points.push({ percentile: p, density });
  }
  return points;
}

export function getIncomeForPercentile(targetPercentile: number): number {
  const anchors = PERCENTILE_ANCHORS;
  if (targetPercentile <= anchors[0].percentile) {
    return anchors[0].income;
  }
  for (let i = 0; i < anchors.length - 1; i++) {
    const current = anchors[i];
    const next = anchors[i + 1];
    if (targetPercentile >= current.percentile && targetPercentile <= next.percentile) {
      const ratio = (targetPercentile - current.percentile) / (next.percentile - current.percentile || 1);
      return Math.round(current.income + ratio * (next.income - current.income));
    }
  }
  const last = anchors[anchors.length - 1];
  const overshoot = targetPercentile - last.percentile;
  return Math.round(last.income * Math.pow(1.08, overshoot));
}
