/**
 * Contractor calculation engine for UK tax years 2025/26 and 2026/27.
 *
 * Provides safe, explicit calculations for:
 * - Umbrella (inside IR35) → PAYE-like treatment
 * - Limited company + IR35 flag → inside IR35 uses PAYE-like treatment
 * - Outside IR35 → explicitly marked as unsupported
 * 
 * Pure TypeScript domain functions - deterministic, side-effect free,
 * suitable for serverless/edge context.
 */

import {
  type AnnualTaxBreakdown,
  type SupportedTaxYear,
  type TaxYearConfig,
} from "./periodTax";

export type ContractorEngagementType = "umbrella" | "limited";

export type Ir35Status = "inside" | "outside";

export type UmbrellaFeeFrequency = "weekly" | "monthly";

export interface ContractorInputs {
  engagementType: ContractorEngagementType;
  ir35Status: Ir35Status;

  /** One of day/hour/month will be provided; convert to annual. */
  dayRate?: number;
  hoursPerDay?: number;
  daysPerWeek?: number;
  hourlyRate?: number;
  monthlyRate?: number;

  /**
   * Number of billable weeks worked in the tax year. Defaults to 52 for
   * back-compat. For most contractors 46 (5 weeks holiday + 1 non-billable
   * week) is a more realistic default.
   */
  weeksWorkedPerYear?: number;

  /**
   * Umbrella company fee/margin. Only applies when
   * engagementType === "umbrella". Deducted from the assignment/invoiced
   * income before the remainder is taxed as PAYE employment income.
   */
  umbrellaFeeAmount?: number;
  /** How the umbrella fee is quoted. Defaults to "weekly". */
  umbrellaFeeFrequency?: UmbrellaFeeFrequency;

  /**
   * Employer's pension contribution as a percentage of the employee's
   * wages, deducted by the umbrella from the assignment rate before PAYE.
   * Only applies when engagementType === "umbrella". Defaults to 0 (most
   * umbrella contractors opt out of the umbrella's auto-enrolment scheme).
   */
  employerPensionPercent?: number;

  /** Tax-year + PAYE config. */
  taxYear: SupportedTaxYear;
  taxCode: string;
  pensionEmployeePercent?: number;
  studentLoanPlan?: "none" | "plan1" | "plan2" | "plan4" | "plan5" | "postgrad";
}

/**
 * Employer-side costs that come out of an umbrella assignment before the
 * remainder becomes the employee's PAYE gross pay. Mirrors the "Company
 * Income and Costs" block on a real umbrella reconciliation payslip.
 */
export interface UmbrellaEmployerCosts {
  /** Annual employer NI (secondary Class 1 contributions). */
  employerNIAnnual: number;
  /** Annual apprenticeship levy passed on to the assignment. */
  apprenticeshipLevyAnnual: number;
  /** Annual employer pension contribution paid by the umbrella. */
  employerPensionAnnual: number;
  /** Total annual company margin / umbrella fee. */
  umbrellaFeeAnnual: number;
  /** Sum of the four pre-tax deductions above. */
  totalEmployerCostsAnnual: number;
  /**
   * The employee's PAYE gross pay for the year — i.e. assignment income
   * minus all employer costs. This is the number fed into PAYE / NI /
   * pension / student-loan calculations.
   */
  wagesAnnual: number;
}

export interface ContractorAnnualResult {
  supported: boolean;
  reasonIfUnsupported?: string;

  /**
   * Annualised taxable gross income (after any umbrella-side pre-tax
   * deductions). Equals `wagesAnnual` on the employer-cost breakdown for
   * umbrella scenarios, and `assignmentGrossAnnual` otherwise. This is the
   * figure fed into PAYE/NI calculations.
   */
  grossAnnualIncome: number;

  /**
   * Total annualised invoiced/assignment income before any pre-tax
   * deductions. Equals `grossAnnualIncome` when no pre-tax deductions apply.
   */
  assignmentGrossAnnual: number;

  /** Total annual umbrella fee (0 for limited-company or fee-less scenarios). */
  umbrellaFeeAnnual: number;

  /**
   * Umbrella-side employer costs breakdown. Populated for umbrella
   * engagements; undefined for limited-company engagements.
   */
  employerCosts?: UmbrellaEmployerCosts;

  /** Number of billable weeks used in the derivation (52 when unspecified). */
  weeksWorkedPerYear: number;

  /** When supported = true and treated as PAYE employment: */
  annual?: {
    paye: number;
    ni: number;
    pensionEmployee: number;
    studentLoan: number;
    /** Per-plan student loan breakdown */
    studentLoanBreakdown?: Array<{ plan: string; label: string; amount: number }>;
    net: number;
    /** Total annual umbrella fee (mirrors top-level field). */
    umbrellaFee: number;
    /** Assignment/invoiced gross (mirrors top-level field). */
    assignmentGrossAnnual: number;
    /** Umbrella-side employer costs (mirrors top-level field). */
    employerCosts?: UmbrellaEmployerCosts;
  };
}

const DEFAULT_WEEKS_PER_YEAR = 52;
const WEEKS_PER_YEAR_CALENDAR = 52;
const MONTHS_PER_YEAR = 12;

/**
 * Resolve the effective weeks-worked-per-year for a contractor input. Falls
 * back to 52 when unspecified or invalid.
 */
export function resolveWeeksWorkedPerYear(input: ContractorInputs): number {
  const weeks = input.weeksWorkedPerYear;
  if (weeks === undefined) {
    return DEFAULT_WEEKS_PER_YEAR;
  }
  if (!Number.isFinite(weeks) || weeks <= 0) {
    return DEFAULT_WEEKS_PER_YEAR;
  }
  // Cap at the number of calendar weeks in a year. Anything above 52 is not
  // physically possible for a single engagement.
  return Math.min(weeks, WEEKS_PER_YEAR_CALENDAR);
}

/**
 * Compute the annualised umbrella fee for an input. Returns 0 when the
 * engagement is not umbrella-based or no fee is configured.
 */
export function resolveAnnualUmbrellaFee(input: ContractorInputs): number {
  if (input.engagementType !== "umbrella") {
    return 0;
  }
  const amount = input.umbrellaFeeAmount ?? 0;
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  const frequency: UmbrellaFeeFrequency = input.umbrellaFeeFrequency ?? "weekly";
  if (frequency === "monthly") {
    return amount * MONTHS_PER_YEAR;
  }
  const weeks = resolveWeeksWorkedPerYear(input);
  return amount * weeks;
}

/**
 * Solve the umbrella pay pipeline for the employee wage figure that PAYE is
 * assessed on. Mirrors how umbrella payroll bureaus reconcile an assignment
 * rate on the way to a payslip:
 *
 *   assignmentIncome
 *     − apprenticeship levy (AL_rate · wages)
 *     − employer NI          (eRate · max(0, wages − secondary threshold))
 *     − employer pension     (epRate · wages)
 *     − umbrella margin      (fixed £)
 *   = wages (PAYE gross)
 *
 * Because the first three deductions are linear in `wages`, we can solve
 * analytically. Numbers are clamped to be non-negative for degenerate cases
 * where the assignment is smaller than the fixed costs.
 */
export function computeUmbrellaEmployerCosts(params: {
  assignmentGrossAnnual: number;
  umbrellaFeeAnnual: number;
  employerNiRate: number;
  employerNiSecondaryThresholdAnnual: number;
  apprenticeshipLevyRate: number;
  employerPensionRate: number;
}): UmbrellaEmployerCosts {
  const {
    assignmentGrossAnnual,
    umbrellaFeeAnnual,
    employerNiRate,
    employerNiSecondaryThresholdAnnual,
    apprenticeshipLevyRate,
    employerPensionRate,
  } = params;

  const netAfterFixed = Math.max(0, assignmentGrossAnnual - umbrellaFeeAnnual);

  // Try the "wages above secondary threshold" branch first, which produces
  // the closed-form solution used above the ST. If it yields wages below
  // the threshold we fall back to the sub-threshold branch (no employer
  // NI applies).
  const denomAbove =
    1 + employerNiRate + apprenticeshipLevyRate + employerPensionRate;
  const wagesAbove = denomAbove > 0
    ? (netAfterFixed + employerNiRate * employerNiSecondaryThresholdAnnual)
        / denomAbove
    : 0;

  let wagesAnnual: number;
  let employerNIAnnual: number;

  if (wagesAbove >= employerNiSecondaryThresholdAnnual) {
    wagesAnnual = wagesAbove;
    employerNIAnnual = employerNiRate * (wagesAbove - employerNiSecondaryThresholdAnnual);
  } else {
    const denomBelow = 1 + apprenticeshipLevyRate + employerPensionRate;
    wagesAnnual = denomBelow > 0 ? netAfterFixed / denomBelow : 0;
    employerNIAnnual = 0;
  }

  wagesAnnual = Math.max(0, wagesAnnual);
  employerNIAnnual = Math.max(0, employerNIAnnual);

  const apprenticeshipLevyAnnual = Math.max(
    0,
    apprenticeshipLevyRate * wagesAnnual,
  );
  const employerPensionAnnual = Math.max(
    0,
    employerPensionRate * wagesAnnual,
  );

  const totalEmployerCostsAnnual =
    employerNIAnnual +
    apprenticeshipLevyAnnual +
    employerPensionAnnual +
    umbrellaFeeAnnual;

  return {
    employerNIAnnual,
    apprenticeshipLevyAnnual,
    employerPensionAnnual,
    umbrellaFeeAnnual,
    totalEmployerCostsAnnual,
    wagesAnnual,
  };
}

/**
 * Derive annualised assignment/invoiced income from contractor inputs. This
 * is the total contract income before any pre-tax deductions like umbrella
 * fees.
 *
 * Rules:
 * - If monthlyRate is provided, use monthlyRate * 12 (weeksWorkedPerYear
 *   does not apply — a monthly retainer implies year-round engagement).
 * - Else if dayRate is provided:
 *   - Use daysPerWeek if provided, else default to 5
 *   - Annual = dayRate * daysPerWeek * weeksWorkedPerYear (default 52)
 * - Else if hourlyRate is provided:
 *   - Require hoursPerDay and daysPerWeek, otherwise throw a domain error
 *   - Annual = hourlyRate * hoursPerDay * daysPerWeek * weeksWorkedPerYear
 *
 * Priority: monthly > day > hourly
 *
 * Validates all numbers are finite and ≥ 0; throws for invalid input.
 */
export function deriveGrossAnnualFromContractorInputs(input: ContractorInputs): number {
  const { monthlyRate, dayRate, hourlyRate, daysPerWeek, hoursPerDay } = input;

  const validateNumber = (value: number | undefined, name: string): void => {
    if (value !== undefined) {
      if (!Number.isFinite(value)) {
        throw new Error(`${name} must be a finite number`);
      }
      if (value < 0) {
        throw new Error(`${name} must be >= 0`);
      }
    }
  };

  validateNumber(monthlyRate, "monthlyRate");
  validateNumber(dayRate, "dayRate");
  validateNumber(hourlyRate, "hourlyRate");
  validateNumber(daysPerWeek, "daysPerWeek");
  validateNumber(hoursPerDay, "hoursPerDay");
  validateNumber(input.weeksWorkedPerYear, "weeksWorkedPerYear");

  const weeksWorked = resolveWeeksWorkedPerYear(input);

  if (monthlyRate !== undefined && monthlyRate > 0) {
    return monthlyRate * MONTHS_PER_YEAR;
  }

  if (dayRate !== undefined && dayRate > 0) {
    const effectiveDaysPerWeek = daysPerWeek ?? 5;
    return dayRate * effectiveDaysPerWeek * weeksWorked;
  }

  if (hourlyRate !== undefined && hourlyRate > 0) {
    if (hoursPerDay === undefined || hoursPerDay <= 0) {
      throw new Error("hoursPerDay is required when hourlyRate is provided");
    }
    if (daysPerWeek === undefined || daysPerWeek <= 0) {
      throw new Error("daysPerWeek is required when hourlyRate is provided");
    }
    return hourlyRate * hoursPerDay * daysPerWeek * weeksWorked;
  }

  return 0;
}

/**
 * Dependencies for contractor calculation engine.
 * Allows injection of tax calculation logic for testability.
 */
export interface ContractorEngineDeps {
  createConfigForYear(taxYear: SupportedTaxYear): TaxYearConfig;
  calculateAnnual(input: {
    grossAnnualIncome: number;
    taxCode: string;
    pensionEmployeePercent?: number;
    /** @deprecated Use studentLoanPlans instead */
    studentLoanPlan?: ContractorInputs["studentLoanPlan"];
    /** Array of student loan plans (e.g., ["plan2", "postgrad"]) */
    studentLoanPlans?: string[];
    config: TaxYearConfig;
  }): AnnualTaxBreakdown;
}

/**
 * Calculate contractor annual tax result.
 * 
 * Rules:
 * - Always derive grossAnnualIncome via deriveGrossAnnualFromContractorInputs
 * - If ir35Status === 'outside': Return unsupported result
 * - If ir35Status === 'inside': Treat as PAYE employment income
 * 
 * @param input - Contractor calculation inputs
 * @param deps - Engine dependencies for tax calculation
 * @returns Annual contractor result with tax breakdown or unsupported reason
 */
export function calculateContractorAnnual(
  input: ContractorInputs,
  deps: ContractorEngineDeps
): ContractorAnnualResult {
  const weeksWorkedPerYear = resolveWeeksWorkedPerYear(input);

  let assignmentGrossAnnual: number;
  try {
    assignmentGrossAnnual = deriveGrossAnnualFromContractorInputs(input);
  } catch (error) {
    return {
      supported: false,
      reasonIfUnsupported:
        error instanceof Error ? error.message : "Invalid rate input provided",
      grossAnnualIncome: 0,
      assignmentGrossAnnual: 0,
      umbrellaFeeAnnual: 0,
      weeksWorkedPerYear,
    };
  }

  const umbrellaFeeAnnual = resolveAnnualUmbrellaFee(input);

  if (assignmentGrossAnnual <= 0) {
    return {
      supported: false,
      reasonIfUnsupported:
        "No valid rate provided. Please provide day rate, hourly rate, or monthly rate.",
      grossAnnualIncome: 0,
      assignmentGrossAnnual: 0,
      umbrellaFeeAnnual: 0,
      weeksWorkedPerYear,
    };
  }

  // Resolve the tax-year config up front so we can build the umbrella
  // employer-cost breakdown (which needs the employer NI settings).
  const config = deps.createConfigForYear(input.taxYear);

  let employerCosts: UmbrellaEmployerCosts | undefined;
  let grossAnnualIncome: number;

  if (input.engagementType === "umbrella") {
    const employerPensionRate = Math.max(
      0,
      (input.employerPensionPercent ?? 0) / 100,
    );

    // Employer NI / apprenticeship-levy settings default to 2026/27 rates
    // when the config was produced by an older factory that didn't include
    // `employerNi`.
    const employerNi = config.employerNi ?? {
      secondaryThreshold: 5_000,
      rate: 0.15,
      apprenticeshipLevy: 0.005,
    };

    employerCosts = computeUmbrellaEmployerCosts({
      assignmentGrossAnnual,
      umbrellaFeeAnnual,
      employerNiRate: employerNi.rate,
      employerNiSecondaryThresholdAnnual: employerNi.secondaryThreshold,
      apprenticeshipLevyRate: employerNi.apprenticeshipLevy,
      employerPensionRate,
    });
    grossAnnualIncome = employerCosts.wagesAnnual;
  } else {
    // Limited company: no umbrella-side employer costs; the assignment
    // income is the taxable gross directly.
    grossAnnualIncome = assignmentGrossAnnual;
  }

  if (input.ir35Status === "outside") {
    return {
      supported: false,
      reasonIfUnsupported:
        "Outside IR35 limited company modelling is not yet supported. " +
        "This tool currently focuses on inside IR35 / PAYE-style calculations.",
      grossAnnualIncome,
      assignmentGrossAnnual,
      umbrellaFeeAnnual,
      employerCosts,
      weeksWorkedPerYear,
    };
  }

  if (input.ir35Status === "inside") {
    const studentLoanPlans =
      input.studentLoanPlan && input.studentLoanPlan !== "none"
        ? [input.studentLoanPlan]
        : undefined;

    const breakdown = deps.calculateAnnual({
      grossAnnualIncome,
      taxCode: input.taxCode,
      pensionEmployeePercent: input.pensionEmployeePercent,
      studentLoanPlan: input.studentLoanPlan,
      studentLoanPlans,
      config,
    });

    return {
      supported: true,
      grossAnnualIncome,
      assignmentGrossAnnual,
      umbrellaFeeAnnual,
      employerCosts,
      weeksWorkedPerYear,
      annual: {
        paye: breakdown.annualPAYE,
        ni: breakdown.annualNI,
        pensionEmployee: breakdown.annualPensionEmployee ?? 0,
        studentLoan: breakdown.annualStudentLoan,
        studentLoanBreakdown: breakdown.studentLoanBreakdown,
        net: breakdown.netAnnualIncome,
        umbrellaFee: umbrellaFeeAnnual,
        assignmentGrossAnnual,
        employerCosts,
      },
    };
  }

  return {
    supported: false,
    reasonIfUnsupported: `Unknown IR35 status: ${input.ir35Status}`,
    grossAnnualIncome,
    assignmentGrossAnnual,
    umbrellaFeeAnnual,
    employerCosts,
    weeksWorkedPerYear,
  };
}

