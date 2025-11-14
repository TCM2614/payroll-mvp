import type { TaxYearLabel } from "../taxYear";

export const UK_TAX_2025 = {
  personalAllowance: 12_570,
  paTaperStart: 100_000,
  paTaperEnd: 125_140,
  basicRate: 0.2,
  higherRate: 0.4,
  additionalRate: 0.45,
  basicBandTop: 37_700,
  higherBandTop: 125_140,
  ni: {
    primaryThreshold: 12_570,
    upperEarningsLimit: 50_270,
    mainRate: 0.08,
    upperRate: 0.02,
  },
  employerNi: {
    secondaryThreshold: 5_000,
    rate: 0.15,
    apprenticeshipLevy: 0.005,
  },
  corpTaxRate: 0.19,
  dividend: {
    allowance: 500,
    basic: 0.0875,
    higher: 0.3375,
    additional: 0.3935,
  },
  studentLoans: {
    // 2025/26 thresholds
    plan1: { threshold: 26_065, rate: 0.09 },
    plan2: { threshold: 28_470, rate: 0.09 },
    plan4: { threshold: 32_745, rate: 0.09 },
    // Plan 5: no PAYE deductions until April 2026 – keep in the model with 0% rate
    plan5: { threshold: 25_000, rate: 0 },
    postgrad: { threshold: 21_000, rate: 0.06 },
  },
} as const;

export type LoanKey = keyof typeof UK_TAX_2025["studentLoans"];

export type PayeTaxConfig = {
  personalAllowance: number;
  paTaperStart: number;
  paTaperEnd: number;
  basicRate: number;
  higherRate: number;
  additionalRate: number;
  basicBandTop: number;
  higherBandTop: number;
  ni: {
    primaryThreshold: number;
    upperEarningsLimit: number;
    mainRate: number;
    upperRate: number;
  };
  employerNi: {
    secondaryThreshold: number;
    rate: number;
    apprenticeshipLevy: number;
  };
  corpTaxRate: number;
  dividend: {
    allowance: number;
    basic: number;
    higher: number;
    additional: number;
  };
  studentLoans: {
    plan1: { threshold: number; rate: number };
    plan2: { threshold: number; rate: number };
    plan4: { threshold: number; rate: number };
    plan5: { threshold: number; rate: number };
    postgrad: { threshold: number; rate: number };
  };
};

// 2024/25 config for the PAYE multi-job engine (used when taxYear = "2024-25")
export const UK_TAX_2024 = {
  personalAllowance: 12_570,
  paTaperStart: 100_000,
  paTaperEnd: 125_140,
  basicRate: 0.2,
  higherRate: 0.4,
  additionalRate: 0.45,
  basicBandTop: 37_700,
  higherBandTop: 125_140,
  ni: {
    // From NI_2024_25 in src/lib/rates/2024-25.ts
    primaryThreshold: 12_570,
    upperEarningsLimit: 50_270,
    mainRate: 0.08,
    upperRate: 0.02,
  },
  employerNi: {
    // Keep conservative 2024/25-style employer NI for modelling
    secondaryThreshold: 9_100,
    rate: 0.138,
    apprenticeshipLevy: 0.005,
  },
  corpTaxRate: 0.19,
  dividend: {
    allowance: 500,
    basic: 0.0875,
    higher: 0.3375,
    additional: 0.3935,
  },
  studentLoans: {
    // From SL_2024_25 in src/lib/rates/2024-25.ts
    plan1: { threshold: 22_015, rate: 0.09 },
    plan2: { threshold: 27_295, rate: 0.09 },
    plan4: { threshold: 31_395, rate: 0.09 },
    plan5: { threshold: 25_000, rate: 0.09 },
    postgrad: { threshold: 21_000, rate: 0.06 },
  },
} as const;

const PAYE_TAX_CONFIGS: Record<TaxYearLabel, PayeTaxConfig> = {
  "2024-25": UK_TAX_2024,
  "2025-26": UK_TAX_2025,
};

export function getPayeTaxConfig(taxYear: TaxYearLabel): PayeTaxConfig {
  return PAYE_TAX_CONFIGS[taxYear] ?? UK_TAX_2025;
}

