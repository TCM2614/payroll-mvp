// UK Tax constants and utilities

export const TAX_YEARS = {
  "2024-25": {
    personalAllowance: 12570,
    basicRateThreshold: 50270,
    higherRateThreshold: 125140,
    basicRate: 0.20,
    higherRate: 0.40,
    additionalRate: 0.45,
  },
} as const;

export type TaxYear = keyof typeof TAX_YEARS;

