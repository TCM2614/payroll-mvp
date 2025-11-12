import { UK_TAX_2025 } from "../tax/uk2025";

export type LimitedInput = {
  dayRate?: number; hourlyRate?: number;
  monthlyRate?: number; annualRate?: number;
  daysPerWeek?: number; hoursPerDay?: number; weeksPerYear?: number;
  salaryAnnual?: number; allowableExpensesAnnual?: number; employerPension?: number;
};

export function calcLimited(i: LimitedInput) {
  const weeks = i.weeksPerYear ?? 46;
  const days = i.daysPerWeek ?? 5;
  const hours = i.hoursPerDay ?? (i.hourlyRate ? 7.5 : undefined);

  const revenueAnnual = i.annualRate
    ? i.annualRate
    : i.monthlyRate
    ? i.monthlyRate * 12
    : i.dayRate
    ? i.dayRate * days * weeks
    : i.hourlyRate && hours
    ? i.hourlyRate * hours * days * weeks
    : 0;

  const salary = i.salaryAnnual ?? 12570;
  const expenses = i.allowableExpensesAnnual ?? 0;
  const erPension = i.employerPension ?? 0;

  const profitBeforeTax = Math.max(0, revenueAnnual - salary - expenses - erPension);
  const corpTax = profitBeforeTax * UK_TAX_2025.corpTaxRate;
  const distributable = Math.max(0, profitBeforeTax - corpTax);

  const free = UK_TAX_2025.dividend.allowance;
  let remaining = Math.max(0, distributable - free);

  const basicWidth = UK_TAX_2025.basicBandTop;
  const divBasic = Math.min(remaining, basicWidth); remaining -= divBasic;
  const divHigher = Math.min(remaining, UK_TAX_2025.higherBandTop - UK_TAX_2025.basicBandTop); remaining -= divHigher;
  const divAdditional = Math.max(0, remaining);

  const divTax = divBasic*UK_TAX_2025.dividend.basic
               + divHigher*UK_TAX_2025.dividend.higher
               + divAdditional*UK_TAX_2025.dividend.additional;

  const netDividends = Math.max(0, distributable - divTax);
  const directorNetSalary = salary;
  const netToDirector = directorNetSalary + netDividends;

  return {
    revenueAnnual, salary, expenses, employerPension: erPension,
    profitBeforeTax, corpTax, distributable, netDividends, netToDirector
  };
}
