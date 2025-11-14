/**
 * Student Loan Data Model
 * 
 * Supports combined student loan deductions:
 * - Exactly one undergraduate plan (or none): Plan1 | Plan2 | Plan4 | Plan5 | None
 * - Separate Postgraduate loan flag: boolean
 * 
 * This allows users to have both an undergraduate plan AND a postgraduate loan
 * at the same time (e.g., Plan 2 + Postgraduate loan).
 */

export type UndergraduatePlan = "plan1" | "plan2" | "plan4" | "plan5" | "none";

export interface StudentLoanSelection {
  /** Exactly one undergraduate plan, or "none" */
  undergraduatePlan: UndergraduatePlan;
  /** Separate flag for postgraduate loan (can be combined with undergraduate) */
  hasPostgraduateLoan: boolean;
}

/**
 * Convert StudentLoanSelection to LoanKey array for calculation functions
 */
export function studentLoanSelectionToLoanKeys(
  selection: StudentLoanSelection
): Array<"plan1" | "plan2" | "plan4" | "plan5" | "postgrad"> {
  const loans: Array<"plan1" | "plan2" | "plan4" | "plan5" | "postgrad"> = [];
  
  if (selection.undergraduatePlan !== "none") {
    loans.push(selection.undergraduatePlan);
  }
  
  if (selection.hasPostgraduateLoan) {
    loans.push("postgrad");
  }
  
  return loans;
}

/**
 * Calculate student loan deductions per plan
 * Returns breakdown by plan and total
 */
export interface StudentLoanBreakdown {
  /** Per-plan deductions */
  byPlan: Array<{
    plan: "plan1" | "plan2" | "plan4" | "plan5" | "postgrad";
    label: string;
    amount: number;
  }>;
  /** Total of all student loan deductions */
  total: number;
}

export function calculateStudentLoanBreakdown(
  grossAnnual: number,
  loans: Array<"plan1" | "plan2" | "plan4" | "plan5" | "postgrad">,
  studentLoanConfig: Record<string, { threshold: number; rate: number; label?: string }>
): StudentLoanBreakdown {
  const byPlan: StudentLoanBreakdown["byPlan"] = [];
  let total = 0;

  for (const loanKey of loans) {
    const config = studentLoanConfig[loanKey];
    if (!config) continue;

    const repayable = Math.max(0, grossAnnual - config.threshold);
    const amount = repayable * config.rate;

    if (amount > 0) {
      byPlan.push({
        plan: loanKey,
        label: config.label || loanKey,
        amount,
      });
      total += amount;
    }
  }

  return { byPlan, total };
}

/**
 * Legacy conversion: Convert old single-plan format to new model
 * For backwards compatibility
 */
export function legacyPlanToSelection(
  plan: "none" | "plan1" | "plan2" | "plan4" | "plan5" | "postgrad"
): StudentLoanSelection {
  if (plan === "postgrad") {
    return {
      undergraduatePlan: "none",
      hasPostgraduateLoan: true,
    };
  }
  
  return {
    undergraduatePlan: plan === "none" ? "none" : plan,
    hasPostgraduateLoan: false,
  };
}

