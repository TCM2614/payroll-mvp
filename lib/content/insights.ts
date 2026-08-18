/**
 * Deterministic content‑insight layer.
 *
 * Turns a calculator result into a structured object that content templates,
 * OG images, marketing copy generators and the 30‑day calendar can consume.
 *
 * IMPORTANT: this file never invents numbers. Every financial figure comes
 * from the tax engine. Copy that references £ values must derive those values
 * from `SalaryInsight`, not from freeform prose.
 */

import { calculateSalary, type CalculatorResult, type Region } from "@/lib/tax";
import { salaryPath } from "./salary-catalog";
import { UK_SALARY_PERCENTILES } from "./percentile-data";

const gbp = (n: number): string =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);

const gbp2 = (n: number): string =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(n);

export interface SalaryInsight {
  salary: number;
  region: Region;
  result: CalculatorResult;
  formatted: {
    gross: string;
    net: string;
    monthly: string;
    weekly: string;
    daily: string;
    hourly: string;
    incomeTax: string;
    ni: string;
    effectiveRate: string;
    retainedPercent: string;
  };
  percentile: PercentileInsight;
  path: string;
}

export interface PercentileInsight {
  /** Percentile from 0–100 (higher = earns more). */
  percentile: number;
  /** Copy‑ready phrase, e.g. "top 15% of UK earners". */
  descriptor: string;
  source: string;
  sourceYear: string;
  disclaimer: string;
}

export function computePercentile(salary: number): PercentileInsight {
  // UK_SALARY_PERCENTILES is sorted ascending by salary.
  let p = 0;
  for (const row of UK_SALARY_PERCENTILES) {
    if (salary >= row.salary) p = row.percentile;
    else break;
  }
  const rankFromTop = 100 - p;
  const descriptor =
    rankFromTop <= 1
      ? "top 1% of UK earners"
      : rankFromTop <= 5
        ? "top 5% of UK earners"
        : rankFromTop <= 10
          ? "top 10% of UK earners"
          : rankFromTop <= 25
            ? "top quartile of UK earners"
            : rankFromTop <= 50
              ? "above the UK median earner"
              : "below the UK median earner";
  return {
    percentile: p,
    descriptor,
    source: "HMRC / ONS Survey of Personal Incomes",
    sourceYear: "2022–23 (latest published)",
    disclaimer:
      "Percentile is approximate and compares gross pay across UK adult income tax payers. See methodology.",
  };
}

export function buildSalaryInsight(
  salary: number,
  region: Region = "england-wales-ni",
): SalaryInsight {
  const result = calculateSalary(salary, { region });
  const retainedPct = salary > 0 ? (result.netAnnual / salary) * 100 : 0;
  return {
    salary,
    region,
    result,
    formatted: {
      gross: gbp(salary),
      net: gbp(result.netAnnual),
      monthly: gbp(result.netMonthly),
      weekly: gbp(result.netWeekly),
      daily: gbp2(result.netDaily),
      hourly: gbp2(result.netHourly),
      incomeTax: gbp(result.incomeTax),
      ni: gbp(result.nationalInsurance),
      effectiveRate: `${(result.effectiveRate * 100).toFixed(1)}%`,
      retainedPercent: `${retainedPct.toFixed(1)}%`,
    },
    percentile: computePercentile(salary),
    path: salaryPath(salary),
  };
}

/**
 * Compares two salaries and returns pay‑rise / comparison insight objects.
 * All numbers come from the tax engine.
 */
export interface ComparisonInsight {
  from: SalaryInsight;
  to: SalaryInsight;
  grossDelta: number;
  netDelta: number;
  monthlyNetDelta: number;
  taxDelta: number;
  niDelta: number;
  studentLoanDelta: number;
  retainedShareOfRaise: number; // 0–1
  formatted: {
    grossDelta: string;
    netDelta: string;
    monthlyNetDelta: string;
    taxDelta: string;
    niDelta: string;
    studentLoanDelta: string;
    retainedPercent: string;
  };
}

export function compareSalaries(
  fromSalary: number,
  toSalary: number,
  region: Region = "england-wales-ni",
): ComparisonInsight {
  const from = buildSalaryInsight(fromSalary, region);
  const to = buildSalaryInsight(toSalary, region);
  const grossDelta = to.salary - from.salary;
  const netDelta = to.result.netAnnual - from.result.netAnnual;
  const taxDelta = to.result.incomeTax - from.result.incomeTax;
  const niDelta = to.result.nationalInsurance - from.result.nationalInsurance;
  const slDelta = to.result.studentLoan - from.result.studentLoan;
  const retainedShare = grossDelta !== 0 ? netDelta / grossDelta : 0;
  return {
    from,
    to,
    grossDelta,
    netDelta,
    monthlyNetDelta: netDelta / 12,
    taxDelta,
    niDelta,
    studentLoanDelta: slDelta,
    retainedShareOfRaise: retainedShare,
    formatted: {
      grossDelta: gbp(grossDelta),
      netDelta: gbp(netDelta),
      monthlyNetDelta: gbp(netDelta / 12),
      taxDelta: gbp(taxDelta),
      niDelta: gbp(niDelta),
      studentLoanDelta: gbp(slDelta),
      retainedPercent: `${(retainedShare * 100).toFixed(0)}%`,
    },
  };
}
