import { UK_TAX_2025, LoanKey } from "../tax/uk2025";
import { calcPAYECombined, PayeIncomeStream } from "./paye";

export type LimitedInput = {
  dayRate?: number; hourlyRate?: number;
  monthlyRate?: number; annualRate?: number;
  daysPerWeek?: number; hoursPerDay?: number; weeksPerYear?: number;
  salaryAnnual?: number; allowableExpensesAnnual?: number; employerPension?: number;
  taxCode?: string;
  salarySacrificePct?: number; salarySacrificeFixed?: number;
  sippPersonal?: number;
  loans?: LoanKey[];
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

  // Calculate PAYE on director's salary
  const directorStream: PayeIncomeStream = {
    id: "primary",
    label: "Director Salary",
    frequency: "annual",
    amount: salary,
    taxCode: i.taxCode ?? "1257L",
    salarySacrificePct: i.salarySacrificePct,
    salarySacrificeFixed: i.salarySacrificeFixed,
  };

  const paye = calcPAYECombined({
    streams: [directorStream],
    sippPersonal: i.sippPersonal ?? 0,
    loans: i.loans ?? [],
  });

  const netSalary = paye.totalTakeHomeAnnual;

  // Calculate dividend tax
  // Dividend tax is calculated on taxable income (after personal allowance)
  // Personal allowance is already applied to salary via PAYE calculation
  // Dividend allowance: first £500 of dividends is tax-free
  
  const dividendAllowance = UK_TAX_2025.dividend.allowance;
  
  // Calculate taxable income from salary (after personal allowance)
  // This is the taxable amount used to determine which tax band dividends fall into
  const salaryTaxableIncome = paye.streams[0]?.taxableIncomeAfterReliefs ?? 0;
  
  // Taxable dividends (after dividend allowance)
  const taxableDividends = Math.max(0, distributable - dividendAllowance);
  
  // Total taxable income for dividend tax banding = salary taxable income + all dividends
  // Note: dividend allowance doesn't affect which band dividends fall into, only the taxable amount
  const totalTaxableForBanding = salaryTaxableIncome + distributable;
  
  // Calculate which tax bands the dividends fall into
  // Tax bands: Basic (£0-£37,700), Higher (£37,701-£112,570), Additional (>£112,570)
  // Note: higherBandTop (125,140) - personalAllowance (12,570) = 112,570
  const higherBandTopTaxable = UK_TAX_2025.higherBandTop - UK_TAX_2025.personalAllowance;
  
  let divBasic = 0, divHigher = 0, divAdditional = 0;
  
  if (totalTaxableForBanding <= UK_TAX_2025.basicBandTop) {
    // All dividends fall in basic rate band
    divBasic = taxableDividends;
  } else if (salaryTaxableIncome <= UK_TAX_2025.basicBandTop) {
    // Salary is in basic rate band, dividends span multiple bands
    const divInBasic = Math.max(0, UK_TAX_2025.basicBandTop - salaryTaxableIncome);
    divBasic = Math.min(divInBasic, taxableDividends);
    const remainingDiv = Math.max(0, taxableDividends - divBasic);
    
    if (totalTaxableForBanding <= higherBandTopTaxable) {
      // All remaining dividends are in higher rate band
      divHigher = remainingDiv;
    } else {
      // Dividends span higher and additional rate bands
      const divInHigher = Math.max(0, higherBandTopTaxable - Math.max(UK_TAX_2025.basicBandTop, salaryTaxableIncome));
      divHigher = Math.min(divInHigher, remainingDiv);
      divAdditional = Math.max(0, remainingDiv - divHigher);
    }
  } else if (salaryTaxableIncome <= higherBandTopTaxable) {
    // Salary is in higher rate band
    if (totalTaxableForBanding <= higherBandTopTaxable) {
      // All dividends are in higher rate band
      divHigher = taxableDividends;
    } else {
      // Dividends span higher and additional rate bands
      const divInHigher = Math.max(0, higherBandTopTaxable - salaryTaxableIncome);
      divHigher = Math.min(divInHigher, taxableDividends);
      divAdditional = Math.max(0, taxableDividends - divHigher);
    }
  } else {
    // Salary is in additional rate band, all dividends are additional rate
    divAdditional = taxableDividends;
  }

  const divTax = divBasic * UK_TAX_2025.dividend.basic
               + divHigher * UK_TAX_2025.dividend.higher
               + divAdditional * UK_TAX_2025.dividend.additional;

  const netDividends = Math.max(0, distributable - divTax);
  const netToDirector = netSalary + netDividends;

  return {
    revenueAnnual,
    salary,
    expenses,
    employerPension: erPension,
    profitBeforeTax,
    corpTax,
    distributable,
    paye,
    dividendTax: divTax,
    netDividends,
    netSalary,
    netToDirector,
  };
}
