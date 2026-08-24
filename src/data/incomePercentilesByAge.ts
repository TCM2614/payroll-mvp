/**
 * Approximate UK gross annual income percentiles by age band.
 *
 * Sources roughly mirrored:
 * - Office for National Statistics (ONS), Annual Survey of Hours and Earnings (ASHE) 2023/24 –
 *   tables on gross annual pay by age group.
 * - House of Commons Library briefing papers on average earnings by age.
 *
 * Assumptions & simplifications:
 * - Tax year approximated: 2024/25, but figures are rounded from recent ASHE releases.
 * - Values represent gross annual income (before tax) for all employees, not just full‑time.
 * - Percentiles are smoothed and rounded to the nearest £500–£1,000 to keep the table compact.
 * - This dataset is intended for relative comparison in a consumer tool, not for formal analysis.
 */

export type IncomePercentileRow = {
  ageMin: number;
  ageMax: number;
  percentile: number; // e.g. 10, 25, 50, 75, 90, 95
  income: number; // gross annual income (GBP) at that percentile
  countryCode?: string; // default "UK"
};

export const incomePercentilesByAge: IncomePercentileRow[] = [
  // 18–24
  { ageMin: 18, ageMax: 24, percentile: 10, income: 10000, countryCode: "UK" },
  { ageMin: 18, ageMax: 24, percentile: 25, income: 14000, countryCode: "UK" },
  { ageMin: 18, ageMax: 24, percentile: 50, income: 21000, countryCode: "UK" },
  { ageMin: 18, ageMax: 24, percentile: 75, income: 28000, countryCode: "UK" },
  { ageMin: 18, ageMax: 24, percentile: 90, income: 36000, countryCode: "UK" },
  { ageMin: 18, ageMax: 24, percentile: 95, income: 42000, countryCode: "UK" },

  // 25–29
  { ageMin: 25, ageMax: 29, percentile: 10, income: 16000, countryCode: "UK" },
  { ageMin: 25, ageMax: 29, percentile: 25, income: 22000, countryCode: "UK" },
  { ageMin: 25, ageMax: 29, percentile: 50, income: 30000, countryCode: "UK" },
  { ageMin: 25, ageMax: 29, percentile: 75, income: 40000, countryCode: "UK" },
  { ageMin: 25, ageMax: 29, percentile: 90, income: 50000, countryCode: "UK" },
  { ageMin: 25, ageMax: 29, percentile: 95, income: 60000, countryCode: "UK" },

  // 30–34
  { ageMin: 30, ageMax: 34, percentile: 10, income: 18000, countryCode: "UK" },
  { ageMin: 30, ageMax: 34, percentile: 25, income: 24000, countryCode: "UK" },
  { ageMin: 30, ageMax: 34, percentile: 50, income: 33000, countryCode: "UK" },
  { ageMin: 30, ageMax: 34, percentile: 75, income: 45000, countryCode: "UK" },
  { ageMin: 30, ageMax: 34, percentile: 90, income: 58000, countryCode: "UK" },
  { ageMin: 30, ageMax: 34, percentile: 95, income: 70000, countryCode: "UK" },

  // 35–39
  { ageMin: 35, ageMax: 39, percentile: 10, income: 19000, countryCode: "UK" },
  { ageMin: 35, ageMax: 39, percentile: 25, income: 26000, countryCode: "UK" },
  { ageMin: 35, ageMax: 39, percentile: 50, income: 36000, countryCode: "UK" },
  { ageMin: 35, ageMax: 39, percentile: 75, income: 48000, countryCode: "UK" },
  { ageMin: 35, ageMax: 39, percentile: 90, income: 62000, countryCode: "UK" },
  { ageMin: 35, ageMax: 39, percentile: 95, income: 75000, countryCode: "UK" },

  // 40–44
  { ageMin: 40, ageMax: 44, percentile: 10, income: 19000, countryCode: "UK" },
  { ageMin: 40, ageMax: 44, percentile: 25, income: 27000, countryCode: "UK" },
  { ageMin: 40, ageMax: 44, percentile: 50, income: 37000, countryCode: "UK" },
  { ageMin: 40, ageMax: 44, percentile: 75, income: 50000, countryCode: "UK" },
  { ageMin: 40, ageMax: 44, percentile: 90, income: 65000, countryCode: "UK" },
  { ageMin: 40, ageMax: 44, percentile: 95, income: 80000, countryCode: "UK" },

  // 45–49
  { ageMin: 45, ageMax: 49, percentile: 10, income: 18000, countryCode: "UK" },
  { ageMin: 45, ageMax: 49, percentile: 25, income: 26000, countryCode: "UK" },
  { ageMin: 45, ageMax: 49, percentile: 50, income: 36000, countryCode: "UK" },
  { ageMin: 45, ageMax: 49, percentile: 75, income: 48000, countryCode: "UK" },
  { ageMin: 45, ageMax: 49, percentile: 90, income: 62000, countryCode: "UK" },
  { ageMin: 45, ageMax: 49, percentile: 95, income: 75000, countryCode: "UK" },

  // 50–54
  { ageMin: 50, ageMax: 54, percentile: 10, income: 17000, countryCode: "UK" },
  { ageMin: 50, ageMax: 54, percentile: 25, income: 25000, countryCode: "UK" },
  { ageMin: 50, ageMax: 54, percentile: 50, income: 34000, countryCode: "UK" },
  { ageMin: 50, ageMax: 54, percentile: 75, income: 45000, countryCode: "UK" },
  { ageMin: 50, ageMax: 54, percentile: 90, income: 58000, countryCode: "UK" },
  { ageMin: 50, ageMax: 54, percentile: 95, income: 70000, countryCode: "UK" },

  // 55–59
  { ageMin: 55, ageMax: 59, percentile: 10, income: 16000, countryCode: "UK" },
  { ageMin: 55, ageMax: 59, percentile: 25, income: 24000, countryCode: "UK" },
  { ageMin: 55, ageMax: 59, percentile: 50, income: 32000, countryCode: "UK" },
  { ageMin: 55, ageMax: 59, percentile: 75, income: 42000, countryCode: "UK" },
  { ageMin: 55, ageMax: 59, percentile: 90, income: 54000, countryCode: "UK" },
  { ageMin: 55, ageMax: 59, percentile: 95, income: 65000, countryCode: "UK" },

  // 60–64
  { ageMin: 60, ageMax: 64, percentile: 10, income: 14000, countryCode: "UK" },
  { ageMin: 60, ageMax: 64, percentile: 25, income: 22000, countryCode: "UK" },
  { ageMin: 60, ageMax: 64, percentile: 50, income: 29000, countryCode: "UK" },
  { ageMin: 60, ageMax: 64, percentile: 75, income: 38000, countryCode: "UK" },
  { ageMin: 60, ageMax: 64, percentile: 90, income: 50000, countryCode: "UK" },
  { ageMin: 60, ageMax: 64, percentile: 95, income: 60000, countryCode: "UK" },

  // 65–69
  { ageMin: 65, ageMax: 69, percentile: 10, income: 12000, countryCode: "UK" },
  { ageMin: 65, ageMax: 69, percentile: 25, income: 20000, countryCode: "UK" },
  { ageMin: 65, ageMax: 69, percentile: 50, income: 26000, countryCode: "UK" },
  { ageMin: 65, ageMax: 69, percentile: 75, income: 34000, countryCode: "UK" },
  { ageMin: 65, ageMax: 69, percentile: 90, income: 45000, countryCode: "UK" },
  { ageMin: 65, ageMax: 69, percentile: 95, income: 55000, countryCode: "UK" },

  // 70–74
  { ageMin: 70, ageMax: 74, percentile: 10, income: 10000, countryCode: "UK" },
  { ageMin: 70, ageMax: 74, percentile: 25, income: 18000, countryCode: "UK" },
  { ageMin: 70, ageMax: 74, percentile: 50, income: 24000, countryCode: "UK" },
  { ageMin: 70, ageMax: 74, percentile: 75, income: 32000, countryCode: "UK" },
  { ageMin: 70, ageMax: 74, percentile: 90, income: 42000, countryCode: "UK" },
  { ageMin: 70, ageMax: 74, percentile: 95, income: 52000, countryCode: "UK" },
];


