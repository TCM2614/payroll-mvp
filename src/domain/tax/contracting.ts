/**
 * Contractor calculation engine for UK tax year 2024/25
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
  type TaxYearConfig,
} from "./periodTax";

export type ContractorEngagementType = "umbrella" | "limited";

export type Ir35Status = "inside" | "outside";

export interface ContractorInputs {
  engagementType: ContractorEngagementType;
  ir35Status: Ir35Status;

  /** One of day/hour/month will be provided; convert to annual. */
  dayRate?: number;
  hoursPerDay?: number;
  daysPerWeek?: number;
  hourlyRate?: number;
  monthlyRate?: number;

  /** Tax-year + PAYE config. */
  taxYear: "2024-25";
  taxCode: string;
  pensionEmployeePercent?: number;
  studentLoanPlan?: "none" | "plan1" | "plan2" | "plan4" | "plan5" | "postgrad";
}

export interface ContractorAnnualResult {
  supported: boolean;
  reasonIfUnsupported?: string;

  grossAnnualIncome: number;

  /** When supported = true and treated as PAYE employment: */
  annual?: {
    paye: number;
    ni: number;
    pensionEmployee: number;
    studentLoan: number;
    net: number;
  };
}

/**
 * Derive annual gross income from contractor inputs.
 * 
 * Rules:
 * - If monthlyRate is provided, use monthlyRate * 12
 * - Else if dayRate is provided:
 *   - Use daysPerWeek if provided, else default to 5
 *   - Annual = dayRate * daysPerWeek * 52
 * - Else if hourlyRate is provided:
 *   - Require hoursPerDay and daysPerWeek, otherwise throw a domain error
 *   - Annual = hourlyRate * hoursPerDay * daysPerWeek * 52
 * 
 * Priority: monthly > day > hourly
 * 
 * Validates all numbers are finite and ≥ 0; throws for invalid input.
 * 
 * @param input - Contractor inputs
 * @returns Annual gross income
 * @throws Error if validation fails or required fields are missing
 */
export function deriveGrossAnnualFromContractorInputs(input: ContractorInputs): number {
  const { monthlyRate, dayRate, hourlyRate, daysPerWeek, hoursPerDay } = input;

  // Validate all provided numbers are finite and non-negative
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

  // Priority 1: Monthly rate
  if (monthlyRate !== undefined && monthlyRate > 0) {
    return monthlyRate * 12;
  }

  // Priority 2: Day rate
  if (dayRate !== undefined && dayRate > 0) {
    const effectiveDaysPerWeek = daysPerWeek ?? 5;
    return dayRate * effectiveDaysPerWeek * 52;
  }

  // Priority 3: Hourly rate
  if (hourlyRate !== undefined && hourlyRate > 0) {
    if (hoursPerDay === undefined || hoursPerDay <= 0) {
      throw new Error("hoursPerDay is required when hourlyRate is provided");
    }
    if (daysPerWeek === undefined || daysPerWeek <= 0) {
      throw new Error("daysPerWeek is required when hourlyRate is provided");
    }
    return hourlyRate * hoursPerDay * daysPerWeek * 52;
  }

  return 0;
}

/**
 * Dependencies for contractor calculation engine.
 * Allows injection of tax calculation logic for testability.
 */
export interface ContractorEngineDeps {
  createConfigForYear(taxYear: "2024-25"): TaxYearConfig;
  calculateAnnual(input: {
    grossAnnualIncome: number;
    taxCode: string;
    pensionEmployeePercent?: number;
    studentLoanPlan?: ContractorInputs["studentLoanPlan"];
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
  // Always derive gross annual income
  let grossAnnualIncome: number;
  try {
    grossAnnualIncome = deriveGrossAnnualFromContractorInputs(input);
  } catch (error) {
    return {
      supported: false,
      reasonIfUnsupported: error instanceof Error ? error.message : "Invalid rate input provided",
      grossAnnualIncome: 0,
    };
  }

  if (grossAnnualIncome <= 0) {
    return {
      supported: false,
      reasonIfUnsupported: "No valid rate provided. Please provide day rate, hourly rate, or monthly rate.",
      grossAnnualIncome: 0,
    };
  }

  // Check IR35 status
  if (input.ir35Status === "outside") {
    return {
      supported: false,
      reasonIfUnsupported:
        "Outside IR35 limited company modelling is not yet supported. " +
        "This tool currently focuses on inside IR35 / PAYE-style calculations.",
      grossAnnualIncome,
    };
  }

  // Inside IR35: treat as PAYE employment income
  if (input.ir35Status === "inside") {
    const config = deps.createConfigForYear(input.taxYear);
    const breakdown = deps.calculateAnnual({
      grossAnnualIncome,
      taxCode: input.taxCode,
      pensionEmployeePercent: input.pensionEmployeePercent,
      studentLoanPlan: input.studentLoanPlan,
      config,
    });

    return {
      supported: true,
      grossAnnualIncome,
      annual: {
        paye: breakdown.annualPAYE,
        ni: breakdown.annualNI,
        pensionEmployee: breakdown.annualPensionEmployee,
        studentLoan: breakdown.annualStudentLoan,
        net: breakdown.netAnnualIncome,
      },
    };
  }

  // Fallback (should not reach here with proper types)
  return {
    supported: false,
    reasonIfUnsupported: `Unknown IR35 status: ${input.ir35Status}`,
    grossAnnualIncome,
  };
}

