export const UK_TAX_2025 = {
  personalAllowance: 12570,
  paTaperStart: 100000,
  paTaperEnd: 125140,
  basicRate: 0.20,
  higherRate: 0.40,
  additionalRate: 0.45,
  basicBandTop: 37700,
  higherBandTop: 125140,
  ni: {
    primaryThreshold: 12570,
    upperEarningsLimit: 50270,
    mainRate: 0.08,
    upperRate: 0.02,
  },
  employerNi: {
    secondaryThreshold: 9100,
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
    plan1: { threshold: 22015, rate: 0.09 },
    plan2: { threshold: 27295, rate: 0.09 },
    plan4: { threshold: 27660, rate: 0.09 },
    plan5: { threshold: 25000, rate: 0.09 },
    postgrad: { threshold: 21000, rate: 0.06 },
  }
};
export type LoanKey = keyof typeof UK_TAX_2025["studentLoans"];

