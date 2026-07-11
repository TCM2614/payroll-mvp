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

  /** Tax-year + PAYE config. */
  taxYear: SupportedTaxYear;
  taxCode: string;
  pensionEmployeePercent?: number;
  studentLoanPlan?: "none" | "plan1" | "plan2" | "plan4" | "plan5" | "postgrad";
}

export interface ContractorAnnualResult {
  supported: boolean;
  reasonIfUnsupported?: string;

  /**
   * Annualised taxable gross income (after any umbrella-fee deduction).
   * This is the figure fed into PAYE/NI calculations.
   */
  grossAnnualIncome: number;

  /**
   * Total annualised invoiced/assignment income before any pre-tax
   * deductions such as the umbrella fee. Equals `grossAnnualIncome` when no
   * pre-tax deductions apply.
   */
  assignmentGrossAnnual: number;

  /** Total annual umbrella fee (0 for limited-company or fee-less scenarios). */
  umbrellaFeeAnnual: number;

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
  // Umbrella fee is a pre-tax deduction from the assignment income. Guard
  // against fees larger than the assignment income.
  const grossAnnualIncome = Math.max(
    0,
    assignmentGrossAnnual - umbrellaFeeAnnual,
  );

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

  if (input.ir35Status === "outside") {
    return {
      supported: false,
      reasonIfUnsupported:
        "Outside IR35 limited company modelling is not yet supported. " +
        "This tool currently focuses on inside IR35 / PAYE-style calculations.",
      grossAnnualIncome,
      assignmentGrossAnnual,
      umbrellaFeeAnnual,
      weeksWorkedPerYear,
    };
  }

  if (input.ir35Status === "inside") {
    const config = deps.createConfigForYear(input.taxYear);

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
      },
    };
  }

  return {
    supported: false,
    reasonIfUnsupported: `Unknown IR35 status: ${input.ir35Status}`,
    grossAnnualIncome,
    assignmentGrossAnnual,
    umbrellaFeeAnnual,
    weeksWorkedPerYear,
  };
}

