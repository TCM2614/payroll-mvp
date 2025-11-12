// Umbrella company calculator

export interface UmbrellaInput {
  grossAnnual: number;
  umbrellaFee?: number;
  taxYear?: string;
}

export interface UmbrellaOutput {
  grossAnnual: number;
  umbrellaFee: number;
  taxableIncome: number;
  incomeTax: number;
  nationalInsurance: number;
  netAnnual: number;
  netMonthly: number;
}

export function calculateUmbrella(input: UmbrellaInput): UmbrellaOutput {
  const { grossAnnual, umbrellaFee = 0 } = input;
  
  // Placeholder calculation - implement actual umbrella logic
  const taxableIncome = grossAnnual - umbrellaFee;
  const incomeTax = taxableIncome * 0.20; // Simplified
  const nationalInsurance = taxableIncome * 0.08; // Simplified
  const netAnnual = grossAnnual - umbrellaFee - incomeTax - nationalInsurance;
  const netMonthly = netAnnual / 12;

  return {
    grossAnnual,
    umbrellaFee,
    taxableIncome,
    incomeTax,
    nationalInsurance,
    netAnnual,
    netMonthly,
  };
}

