// PAYE (Pay As You Earn) calculator

export interface PAYEInput {
  grossAnnual: number;
  taxYear?: string;
}

export interface PAYEOutput {
  grossAnnual: number;
  personalAllowance: number;
  taxableIncome: number;
  incomeTax: number;
  nationalInsurance: number;
  netAnnual: number;
  netMonthly: number;
}

export function calculatePAYE(input: PAYEInput): PAYEOutput {
  const { grossAnnual } = input;
  
  // Placeholder calculation - implement actual UK tax logic
  const personalAllowance = 12570;
  const taxableIncome = Math.max(0, grossAnnual - personalAllowance);
  const incomeTax = taxableIncome * 0.20; // Simplified
  const nationalInsurance = grossAnnual * 0.08; // Simplified
  const netAnnual = grossAnnual - incomeTax - nationalInsurance;
  const netMonthly = netAnnual / 12;

  return {
    grossAnnual,
    personalAllowance,
    taxableIncome,
    incomeTax,
    nationalInsurance,
    netAnnual,
    netMonthly,
  };
}

