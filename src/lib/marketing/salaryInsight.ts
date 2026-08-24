/**
 * Deterministic salary insight helper.
 *
 * Wraps the existing `calcPAYECombined` engine into a compact, calculator-
 * agnostic shape that the new acquisition pages (`/salary/[slug]-after-tax`,
 * `/pay-rise`, `/100k-tax-trap`, `/salary-percentile`) and the 30-day
 * marketing calendar can consume without duplicating tax logic.
 *
 * IMPORTANT: this module never invents numbers. All financial figures
 * originate from the calculators in `@/lib/calculators/paye`.
 */

import {
  calcPAYECombined,
  type CombinedPayeInput,
  type PayeIncomeStream,
} from "@/lib/calculators/paye";
import type { TaxYearLabel } from "@/lib/taxYear";
import type { LoanKey } from "@/lib/tax/uk2025";
import { salaryPath } from "./salaryCatalog";
import { getIncomePercentileForAge } from "@/lib/getIncomePercentileForAge";

const gbp0 = (n: number): string =>
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

export interface SalaryInsightOptions {
  taxYear?: TaxYearLabel;
  loans?: LoanKey[];
  /** Salary-sacrifice percentage of gross (0–1). */
  salarySacrificePct?: number;
  taxCode?: string;
  /** Age used for the age-adjusted percentile lookup. Defaults to 35. */
  age?: number;
}

export interface SalaryInsight {
  salary: number;
  taxYear: TaxYearLabel;
  gross: number;
  incomeTax: number;
  employeeNI: number;
  studentLoan: number;
  netAnnual: number;
  netMonthly: number;
  netWeekly: number;
  netDaily: number;
  netHourly: number;
  effectiveRate: number;
  retainedPercent: number;
  path: string;
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
  percentile: {
    percentile: number;
    ageGroupLabel: string;
    bandLabel: string;
    medianForAgeGroup: number;
    descriptor: string;
    source: string;
  } | null;
}

const DEFAULT_TAX_CODE = "1257L";
const DEFAULT_AGE_FOR_PERCENTILE = 35;

/**
 * Build a deterministic `SalaryInsight` object from a gross annual salary.
 *
 * Uses the exact same engine (`calcPAYECombined`) the calculators use so
 * page copy and calculator output can never silently drift.
 */
export function buildSalaryInsight(
  salary: number,
  opts: SalaryInsightOptions = {},
): SalaryInsight {
  const taxYear: TaxYearLabel = opts.taxYear ?? "2026-27";
  const primary: PayeIncomeStream = {
    id: "primary",
    label: "Primary",
    frequency: "annual",
    amount: salary,
    taxCode: opts.taxCode ?? DEFAULT_TAX_CODE,
    salarySacrificePct: opts.salarySacrificePct
      ? opts.salarySacrificePct * 100
      : undefined,
  };
  const input: CombinedPayeInput = {
    streams: [primary],
    loans: opts.loans,
    taxYear,
  };
  const out = calcPAYECombined(input);

  const gross = out.totalGrossAnnual;
  const net = out.totalTakeHomeAnnual;
  const netMonthly = net / 12;
  const netWeekly = net / 52;
  const netDaily = net / (5 * 46);
  const netHourly = net / (7.5 * 5 * 46);
  const effectiveRate = gross > 0 ? 1 - net / gross : 0;
  const retainedPercent = gross > 0 ? (net / gross) * 100 : 0;

  const p = getIncomePercentileForAge({
    age: opts.age ?? DEFAULT_AGE_FOR_PERCENTILE,
    income: salary,
  });

  const percentile = p
    ? {
        percentile: p.percentile,
        ageGroupLabel: p.ageGroupLabel,
        bandLabel: p.bandLabel,
        medianForAgeGroup: p.medianIncomeForAgeGroup,
        descriptor: percentileDescriptor(p.percentile),
        source:
          "HMRC Survey of Personal Incomes / ONS ASHE — indicative, verify against latest release",
      }
    : null;

  return {
    salary,
    taxYear,
    gross,
    incomeTax: out.totalIncomeTax,
    employeeNI: out.totalEmployeeNI,
    studentLoan: out.totalStudentLoans,
    netAnnual: net,
    netMonthly,
    netWeekly,
    netDaily,
    netHourly,
    effectiveRate,
    retainedPercent,
    path: salaryPath(salary),
    formatted: {
      gross: gbp0(salary),
      net: gbp0(net),
      monthly: gbp0(netMonthly),
      weekly: gbp0(netWeekly),
      daily: gbp2(netDaily),
      hourly: gbp2(netHourly),
      incomeTax: gbp0(out.totalIncomeTax),
      ni: gbp0(out.totalEmployeeNI),
      effectiveRate: `${(effectiveRate * 100).toFixed(1)}%`,
      retainedPercent: `${retainedPercent.toFixed(1)}%`,
    },
    percentile,
  };
}

export interface ComparisonInsight {
  from: SalaryInsight;
  to: SalaryInsight;
  grossDelta: number;
  netDelta: number;
  monthlyNetDelta: number;
  taxDelta: number;
  niDelta: number;
  studentLoanDelta: number;
  retainedShareOfRaise: number;
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

export function compareSalaryInsights(
  fromSalary: number,
  toSalary: number,
  opts: SalaryInsightOptions = {},
): ComparisonInsight {
  const from = buildSalaryInsight(fromSalary, opts);
  const to = buildSalaryInsight(toSalary, opts);
  const grossDelta = to.gross - from.gross;
  const netDelta = to.netAnnual - from.netAnnual;
  const taxDelta = to.incomeTax - from.incomeTax;
  const niDelta = to.employeeNI - from.employeeNI;
  const studentLoanDelta = to.studentLoan - from.studentLoan;
  const retainedShare = grossDelta !== 0 ? netDelta / grossDelta : 0;
  return {
    from,
    to,
    grossDelta,
    netDelta,
    monthlyNetDelta: netDelta / 12,
    taxDelta,
    niDelta,
    studentLoanDelta,
    retainedShareOfRaise: retainedShare,
    formatted: {
      grossDelta: gbp0(grossDelta),
      netDelta: gbp0(netDelta),
      monthlyNetDelta: gbp0(netDelta / 12),
      taxDelta: gbp0(taxDelta),
      niDelta: gbp0(niDelta),
      studentLoanDelta: gbp0(studentLoanDelta),
      retainedPercent: `${(retainedShare * 100).toFixed(0)}%`,
    },
  };
}

function percentileDescriptor(percentile: number): string {
  const fromTop = 100 - percentile;
  if (fromTop <= 1) return "top 1% of UK earners";
  if (fromTop <= 5) return "top 5% of UK earners";
  if (fromTop <= 10) return "top 10% of UK earners";
  if (fromTop <= 25) return "top quartile of UK earners";
  if (fromTop <= 50) return "above the UK median earner";
  return "below the UK median earner";
}
