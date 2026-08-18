/**
 * Approximate UK gross annual earnings percentiles.
 *
 * Values are indicative and used for the "How rich are you?" acquisition
 * feature only. They are not authoritative — see disclaimer & methodology on
 * the percentile page. Numbers should be reviewed against the latest HMRC
 * Survey of Personal Incomes / ONS ASHE release.
 *
 * Data is stored ascending by salary. `percentile` = share of UK income tax
 * payers earning *less than or equal to* this salary.
 *
 * Source (indicative): HMRC Survey of Personal Incomes, 2022–23; ONS Annual
 * Survey of Hours and Earnings. Marked for verification in
 * `docs/growth/manual-actions.md`.
 */

export interface PercentileRow {
  salary: number;
  percentile: number;
}

export const UK_SALARY_PERCENTILES: PercentileRow[] = [
  { salary: 10_000, percentile: 12 },
  { salary: 15_000, percentile: 22 },
  { salary: 20_000, percentile: 33 },
  { salary: 25_000, percentile: 46 },
  { salary: 30_000, percentile: 58 },
  { salary: 35_000, percentile: 67 },
  { salary: 40_000, percentile: 74 },
  { salary: 45_000, percentile: 80 },
  { salary: 50_000, percentile: 85 },
  { salary: 55_000, percentile: 88 },
  { salary: 60_000, percentile: 90 },
  { salary: 70_000, percentile: 93 },
  { salary: 80_000, percentile: 95 },
  { salary: 90_000, percentile: 96 },
  { salary: 100_000, percentile: 97 },
  { salary: 125_000, percentile: 98 },
  { salary: 150_000, percentile: 99 },
  { salary: 200_000, percentile: 99.5 },
  { salary: 300_000, percentile: 99.8 },
  { salary: 500_000, percentile: 99.9 },
];
