import { UK_TAX_2025, LoanKey } from "../tax/uk2025";
import { calcPAYECombined, PayeIncomeStream } from "./paye";

export type UmbrellaInput = {
  dayRate?: number; hourlyRate?: number;
  monthlyRate?: number; annualRate?: number;
  daysPerWeek?: number; hoursPerDay?: number; weeksPerYear?: number;
  umbrellaMarginPerWeek?: number;
  holidayPayPct?: number;
  taxCode?: string;
  salarySacrificePct?: number; salarySacrificeFixed?: number;
  sippPersonal?: number;
  loans?: LoanKey[];
};

export function calcUmbrella(i: UmbrellaInput) {
  const weeks = i.weeksPerYear ?? 46;
  const days = i.daysPerWeek ?? 5;
  const hours = i.hoursPerDay ?? (i.hourlyRate ? 7.5 : undefined);

  const assignmentAnnual = i.annualRate
    ? i.annualRate
    : i.monthlyRate
    ? i.monthlyRate * 12
    : i.dayRate
    ? i.dayRate * days * weeks
    : i.hourlyRate && hours
    ? i.hourlyRate * hours * days * weeks
    : 0;

  const margin = (i.umbrellaMarginPerWeek ?? 20) * weeks;
  const employerNI =
    Math.max(0, assignmentAnnual - UK_TAX_2025.employerNi.secondaryThreshold) *
    UK_TAX_2025.employerNi.rate;
  const levy = assignmentAnnual * UK_TAX_2025.employerNi.apprenticeshipLevy;

  const employmentCostAnnual = margin + employerNI + levy;
  const grossToEmployeeAnnual = Math.max(0, assignmentAnnual - employmentCostAnnual);

  const stream: PayeIncomeStream = {
    id: "primary",
    label: "Umbrella PAYE",
    frequency: "annual",
    amount: grossToEmployeeAnnual,
    taxCode: i.taxCode ?? "1257L",
    salarySacrificePct: i.salarySacrificePct,
    salarySacrificeFixed: i.salarySacrificeFixed,
  };

  const paye = calcPAYECombined({ 
    streams: [stream], 
    sippPersonal: i.sippPersonal ?? 0,
    loans: i.loans ?? [],
  });

  const rolledHoliday = i.holidayPayPct ? grossToEmployeeAnnual * (i.holidayPayPct / 100) : 0;

  return {
    assignmentAnnual,
    employmentCostAnnual,
    grossToEmployeeAnnual,
    rolledHoliday,
    paye,
    netTakeHomeAnnual: paye.totalTakeHomeAnnual,
  };
}
