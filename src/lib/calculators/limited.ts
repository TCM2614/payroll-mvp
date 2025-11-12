// Limited company calculator

export interface LimitedInput {
  grossAnnual: number;
  salary?: number;
  expenses?: number;
  corporationTaxRate?: number;
  dividendTaxRate?: number;
  taxYear?: string;
}

export interface LimitedOutput {
  grossAnnual: number;
  expenses: number;
  netRevenue: number;
  salary: number;
  corporationTax: number;
  profitAfterTax: number;
  dividends: number;
  dividendTax: number;
  netAnnual: number;
  netMonthly: number;
}

export function calculateLimited(input: LimitedInput): LimitedOutput {
  const {
    grossAnnual,
    salary = 12570, // Optimal salary for 2024-25
    expenses = 0,
    corporationTaxRate = 0.19,
    dividendTaxRate = 0.075, // Basic rate dividend tax
  } = input;

  // Placeholder calculation - implement actual limited company logic
  const netRevenue = grossAnnual - expenses;
  const corporationTax = (netRevenue - salary) * corporationTaxRate;
  const profitAfterTax = netRevenue - salary - corporationTax;
  const dividends = profitAfterTax;
  const dividendTax = dividends * dividendTaxRate;
  const netAnnual = salary + dividends - dividendTax;
  const netMonthly = netAnnual / 12;

  return {
    grossAnnual,
    expenses,
    netRevenue,
    salary,
    corporationTax,
    profitAfterTax,
    dividends,
    dividendTax,
    netAnnual,
    netMonthly,
  };
}

