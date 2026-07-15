/**
 * Landing-page marketing helper: computes the four take-home scenarios
 * (Standard PAYE, Umbrella Inside IR35, Limited Inside IR35, Limited
 * Outside IR35) for a shared "same day-rate" contractor so we can present
 * a side-by-side comparison strip on the landing page.
 *
 * All figures are derived from the same domain engines the calculators
 * themselves use — so the marketing numbers can never silently drift from
 * the calculator numbers.
 */

import {
  calculateContractorAnnual,
  type ContractorInputs,
} from "@/domain/tax/contracting";
import {
  createUK2026Config,
  calculateAnnualTax,
} from "@/domain/tax/periodTax";
import { calculateOutsideIR35Annual } from "@/domain/tax/outsideIR35";
import { getPayeTaxConfig } from "@/lib/tax/uk2025";
import { calcPAYECombined } from "@/lib/calculators/paye";

const TAX_YEAR = "2026-27";

export interface ComparisonScenarioInputs {
  /** Contract day rate (£). */
  dayRate: number;
  /** Contracted days per week. */
  daysPerWeek: number;
  /** Billable weeks worked per year (accounts for holidays / bench). */
  weeksWorkedPerYear: number;
  /** Weekly umbrella-margin assumption for the umbrella scenario. */
  umbrellaFeeWeekly: number;
  /** Annual company overheads assumption for the limited-outside scenario. */
  outsideOverheadsAnnual: number;
}

export interface ScenarioResult {
  key: "paye" | "umbrella" | "limited-inside" | "limited-outside";
  label: string;
  regime: "PAYE" | "Inside IR35" | "Outside IR35";
  netAnnual: number;
  netMonthly: number;
  effectiveTaxRate: number;
  /**
   * Delta versus the same day-rate on Standard PAYE, expressed as an
   * annual GBP figure. Positive means "you keep more than the PAYE
   * baseline".
   */
  deltaVsPayeAnnual: number;
  /** Human-readable one-line "what's happening" note for the card. */
  note: string;
}

export interface LandingComparison {
  inputs: ComparisonScenarioInputs;
  headlineDayRate: number;
  headlineAnnualAssignment: number;
  scenarios: ScenarioResult[];
  /** Best-take-home scenario for a quick call-out on the card. */
  bestScenarioKey: ScenarioResult["key"];
  /** Worst-take-home scenario for the same. */
  worstScenarioKey: ScenarioResult["key"];
  /** GBP gap between the best and worst annual net take-home. */
  bestVsWorstAnnual: number;
}

const DEFAULT_INPUTS: ComparisonScenarioInputs = {
  dayRate: 500,
  daysPerWeek: 5,
  weeksWorkedPerYear: 46,
  umbrellaFeeWeekly: 25,
  outsideOverheadsAnnual: 1_200,
};

/**
 * Deterministic take-home comparison for the landing hero. Uses production
 * defaults (£500/day, 5 days/week, 46 weeks worked, £25/week umbrella fee,
 * £1,200 outside-IR35 overheads, 1257L tax code, no student loans, no
 * employee pension).
 */
export function computeLandingComparison(
  inputs: Partial<ComparisonScenarioInputs> = {},
): LandingComparison {
  const merged: ComparisonScenarioInputs = { ...DEFAULT_INPUTS, ...inputs };
  const annualAssignment =
    merged.dayRate * merged.daysPerWeek * merged.weeksWorkedPerYear;

  const scenarios: ScenarioResult[] = [
    computePayeScenario(annualAssignment),
    computeUmbrellaScenario(annualAssignment, merged),
    computeLimitedInsideScenario(annualAssignment, merged),
    computeLimitedOutsideScenario(annualAssignment, merged),
  ];

  const payeNet = scenarios[0].netAnnual;
  for (const s of scenarios) {
    s.deltaVsPayeAnnual = s.netAnnual - payeNet;
  }

  const sorted = [...scenarios].sort((a, b) => b.netAnnual - a.netAnnual);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return {
    inputs: merged,
    headlineDayRate: merged.dayRate,
    headlineAnnualAssignment: annualAssignment,
    scenarios,
    bestScenarioKey: best.key,
    worstScenarioKey: worst.key,
    bestVsWorstAnnual: best.netAnnual - worst.netAnnual,
  };
}

function computePayeScenario(annualGross: number): ScenarioResult {
  const result = calcPAYECombined({
    streams: [
      {
        id: "primary",
        label: "Primary job",
        frequency: "monthly",
        amount: annualGross / 12,
        taxCode: "1257L",
      },
    ],
    taxYear: TAX_YEAR,
  });

  const netAnnual = result.totalTakeHomeAnnual;
  return {
    key: "paye",
    label: "Standard PAYE employment",
    regime: "PAYE",
    netAnnual,
    netMonthly: netAnnual / 12,
    effectiveTaxRate: 1 - netAnnual / annualGross,
    deltaVsPayeAnnual: 0,
    note: "As if you were on payroll with the same annualised salary.",
  };
}

function computeUmbrellaScenario(
  annualAssignment: number,
  inputs: ComparisonScenarioInputs,
): ScenarioResult {
  const contractorInputs: ContractorInputs = {
    engagementType: "umbrella",
    ir35Status: "inside",
    dayRate: inputs.dayRate,
    daysPerWeek: inputs.daysPerWeek,
    weeksWorkedPerYear: inputs.weeksWorkedPerYear,
    umbrellaFeeAmount: inputs.umbrellaFeeWeekly,
    umbrellaFeeFrequency: "weekly",
    taxYear: TAX_YEAR,
    taxCode: "1257L",
  };

  const res = calculateContractorAnnual(contractorInputs, {
    createConfigForYear: () => createUK2026Config(),
    calculateAnnual: (input) => {
      const pensionEmployeeAnnual =
        ((input.pensionEmployeePercent ?? 0) / 100) * input.grossAnnualIncome;
      return calculateAnnualTax({ ...input, pensionEmployeeAnnual });
    },
  });

  const netAnnual = res.supported && res.annual ? res.annual.net : 0;
  return {
    key: "umbrella",
    label: "Umbrella company",
    regime: "Inside IR35",
    netAnnual,
    netMonthly: netAnnual / 12,
    effectiveTaxRate:
      annualAssignment > 0 ? 1 - netAnnual / annualAssignment : 0,
    deltaVsPayeAnnual: 0,
    note: `Includes £${inputs.umbrellaFeeWeekly}/week margin, employer NI, apprenticeship levy — modelled like a real payslip.`,
  };
}

function computeLimitedInsideScenario(
  annualAssignment: number,
  inputs: ComparisonScenarioInputs,
): ScenarioResult {
  const contractorInputs: ContractorInputs = {
    engagementType: "limited",
    ir35Status: "inside",
    dayRate: inputs.dayRate,
    daysPerWeek: inputs.daysPerWeek,
    weeksWorkedPerYear: inputs.weeksWorkedPerYear,
    taxYear: TAX_YEAR,
    taxCode: "1257L",
  };

  const res = calculateContractorAnnual(contractorInputs, {
    createConfigForYear: () => createUK2026Config(),
    calculateAnnual: (input) => {
      const pensionEmployeeAnnual =
        ((input.pensionEmployeePercent ?? 0) / 100) * input.grossAnnualIncome;
      return calculateAnnualTax({ ...input, pensionEmployeeAnnual });
    },
  });

  const netAnnual = res.supported && res.annual ? res.annual.net : 0;
  return {
    key: "limited-inside",
    label: "Limited (Inside IR35)",
    regime: "Inside IR35",
    netAnnual,
    netMonthly: netAnnual / 12,
    effectiveTaxRate:
      annualAssignment > 0 ? 1 - netAnnual / annualAssignment : 0,
    deltaVsPayeAnnual: 0,
    note: "PAYE-style deemed employment via the fee-payer.",
  };
}

function computeLimitedOutsideScenario(
  annualAssignment: number,
  inputs: ComparisonScenarioInputs,
): ScenarioResult {
  const config = getPayeTaxConfig(TAX_YEAR);
  const res = calculateOutsideIR35Annual(
    {
      companyIncomeAnnual: annualAssignment,
      companyOverheadsAnnual: inputs.outsideOverheadsAnnual,
      salaryStrategy: "ni-optimal",
      taxCode: "1257L",
    },
    config,
  );

  return {
    key: "limited-outside",
    label: "Limited (Outside IR35)",
    regime: "Outside IR35",
    netAnnual: res.personal.netTakeHomeAnnual,
    netMonthly: res.personal.netTakeHomeAnnual / 12,
    effectiveTaxRate: res.effectiveTaxRate,
    deltaVsPayeAnnual: 0,
    note: "NI-optimal salary + dividends, with corporation-tax marginal relief.",
  };
}
