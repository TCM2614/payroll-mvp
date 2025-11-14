"use client";

import {
  calculateTakeHome,
  STUDENT_LOAN_PLANS,
  type UkRegion,
  type StudentLoanPlan,
} from "./uk-tax";

export type Frequency = "year" | "month" | "week" | "day" | "hour";
export type RegionOption = "EWNI" | "Scotland";

export interface Inputs {
  gross: number;
  freq: Frequency;
  hoursPerWeek?: number;
  region: RegionOption;
  taxYear: string;
  studentLoan: string;
  pensionPct?: number;
}

export interface PeriodTotals {
  incomeTax: number;
  ni: number;
  studentLoan: number;
  pension: number;
  net: number;
}

export interface ComputeResult {
  annual: PeriodTotals;
  monthly: PeriodTotals;
  weekly: PeriodTotals;
  daily: PeriodTotals;
}

const HOURS_DEFAULT = 37.5;
const WORKING_DAYS = 260;
const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

const STUDENT_LOAN_ID_MAP: Record<string, StudentLoanPlan | null> = {
  Plan1: "plan-1",
  Plan2: "plan-2",
  Plan4: "plan-4",
  Plan5: "plan-5",
  PGL: "postgraduate",
};

const mapRegion = (region: RegionOption): UkRegion =>
  region === "Scotland" ? "scotland" : "england-wales-ni";

const toAnnualGross = (gross: number, freq: Frequency, hoursPerWeek?: number) => {
  switch (freq) {
    case "year":
      return gross;
    case "month":
      return gross * MONTHS_PER_YEAR;
    case "week":
      return gross * WEEKS_PER_YEAR;
    case "day":
      return gross * WORKING_DAYS;
    case "hour": {
      const hours = hoursPerWeek ?? HOURS_DEFAULT;
      return gross * hours * WEEKS_PER_YEAR;
    }
    default:
      return gross;
  }
};

const divideTotals = (totals: PeriodTotals, divisor: number): PeriodTotals => ({
  incomeTax: totals.incomeTax / divisor,
  ni: totals.ni / divisor,
  studentLoan: totals.studentLoan / divisor,
  pension: totals.pension / divisor,
  net: totals.net / divisor,
});

export function compute(inputs: Inputs): ComputeResult {
  const annualGross = toAnnualGross(inputs.gross, inputs.freq, inputs.hoursPerWeek);

  const region = mapRegion(inputs.region);

  const base = calculateTakeHome({
    grossSalary: annualGross,
    region,
    studentLoanPlan: "none",
  });

  const pensionPct = inputs.pensionPct ?? 0;
  const pensionAmount = pensionPct > 0 ? (annualGross * pensionPct) / 100 : 0;

  const loanIds =
    inputs.studentLoan && inputs.studentLoan !== "None"
      ? inputs.studentLoan.split("+").map((item) => item.trim())
      : [];

  let studentLoanTotal = 0;
  for (const loanId of loanIds) {
    const planKey = STUDENT_LOAN_ID_MAP[loanId];
    if (!planKey) {
      continue;
    }
    const details = STUDENT_LOAN_PLANS[planKey];
    if (!details || details.rate === 0) {
      continue;
    }
    const repayable = Math.max(0, annualGross - details.threshold);
    studentLoanTotal += repayable * details.rate;
  }

  const annualTotals: PeriodTotals = {
    incomeTax: base.incomeTax,
    ni: base.nationalInsurance,
    studentLoan: studentLoanTotal,
    pension: pensionAmount,
    net: annualGross - base.incomeTax - base.nationalInsurance - studentLoanTotal - pensionAmount,
  };

  return {
    annual: annualTotals,
    monthly: divideTotals(annualTotals, MONTHS_PER_YEAR),
    weekly: divideTotals(annualTotals, WEEKS_PER_YEAR),
    daily: divideTotals(annualTotals, WORKING_DAYS),
  };
}

