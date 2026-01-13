/**
 * Multi-job PAYE calculation domain layer
 * 
 * Calculates per-job and combined breakdowns for users with multiple employments.
 * Reuses existing single-job calculation logic from periodTax.ts.
 * 
 * Pure TypeScript domain functions - deterministic, side-effect free.
 */

import { calculateAnnualTax, createUK2025Config, type TaxYearConfig } from "./periodTax";
import { UK_TAX_2025 } from "@/lib/tax/uk2025";
import type { LoanKey } from "@/lib/tax/uk2025";

export type TaxYear = "2024-25";

export type EmploymentKind = "main" | "additional";

export interface StudentLoanConfig {
  plans: LoanKey[];
}

export interface JobInput {
  id: string;
  label?: string;
  kind: EmploymentKind; // 'main' or 'additional'
  annualGross: number;
  taxCode: string;
  pensionEmployeeAnnual?: number;
}

export interface MultiJobInput {
  taxYear: TaxYear;
  jobs: JobInput[];
  studentLoan: StudentLoanConfig;
}

export interface JobBreakdown {
  id: string;
  label: string;
  kind: EmploymentKind;
  grossAnnual: number;
  annualPAYE: number;
  annualNI: number;
  annualPensionEmployee: number;
  annualStudentLoan: number;
  netAnnual: number;
}

export interface CombinedJobsBreakdown {
  grossAnnual: number;
  annualPAYE: number;
  annualNI: number;
  annualPensionEmployee: number;
  annualStudentLoan: number;
  studentLoanBreakdown: Array<{ plan: LoanKey; label: string; amount: number }>;
  netAnnual: number;
}

export interface MultiJobCalculationResult {
  jobs: JobBreakdown[];
  combined: CombinedJobsBreakdown;
  taxYear: TaxYear;
}

/**
 * Calculate multi-job PAYE breakdown
 * 
 * For each job:
 * - Calculates PAYE, NI, pension, and net using existing single-job logic
 * - Note: Student loans are calculated on combined gross, so per-job student loan
 *   is set to 0 (they appear only in combined breakdown)
 * 
 * Combined breakdown:
 * - Sums all per-job values
 * - Calculates student loans on total gross income
 * 
 * @param input - Multi-job input with jobs and student loan config
 * @returns Multi-job calculation result with per-job and combined breakdowns
 */
export function calculateMultiJob(input: MultiJobInput): MultiJobCalculationResult {
  const { taxYear, jobs, studentLoan } = input;
  
  // Get tax year config
  const config = createUK2025Config();
  
  // Validate at least one job
  if (jobs.length === 0) {
    throw new Error("At least one job is required");
  }
  
  // Calculate per-job breakdowns
  // For multi-job scenarios, we need to handle personal allowance allocation
  // The main job gets the full personal allowance, additional jobs typically use BR/0T codes
  const mainJob = jobs.find(j => j.kind === "main");
  const additionalJobs = jobs.filter(j => j.kind === "additional");
  
  // Calculate total gross for student loan calculation
  const totalGrossAnnual = jobs.reduce((sum, job) => sum + job.annualGross, 0);
  
  // Calculate per-job breakdowns
  const jobBreakdowns: JobBreakdown[] = jobs.map((job) => {
    // For each job, calculate tax/NI/pension using single-job logic
    // Note: In multi-job scenarios, personal allowance is typically allocated to main job only
    // Additional jobs usually use BR (20% flat) or 0T (no PA, banded) tax codes
    
    const jobBreakdown = calculateAnnualTax({
      grossAnnualIncome: job.annualGross,
      pensionEmployeeAnnual: job.pensionEmployeeAnnual ?? 0,
      studentLoanPlans: [], // Student loans calculated on combined gross, not per-job
      taxCode: job.taxCode,
      config,
    });
    
    // Calculate net for this job (gross - tax - NI - pension)
    // Student loans are not included in per-job breakdown
    const netAnnual = jobBreakdown.grossAnnualIncome 
      - jobBreakdown.annualPAYE 
      - jobBreakdown.annualNI 
      - (jobBreakdown.annualPensionEmployee ?? 0);
    
    return {
      id: job.id,
      label: job.label || (job.kind === "main" ? "Main job" : `Job ${job.id}`),
      kind: job.kind,
      grossAnnual: jobBreakdown.grossAnnualIncome,
      annualPAYE: jobBreakdown.annualPAYE,
      annualNI: jobBreakdown.annualNI,
      annualPensionEmployee: jobBreakdown.annualPensionEmployee ?? 0,
      annualStudentLoan: 0, // Student loans calculated on combined gross
      netAnnual,
    };
  });
  
  // Calculate combined breakdown
  // Sum all per-job values
  const combinedGrossAnnual = jobBreakdowns.reduce((sum, job) => sum + job.grossAnnual, 0);
  const combinedPAYE = jobBreakdowns.reduce((sum, job) => sum + job.annualPAYE, 0);
  const combinedNI = jobBreakdowns.reduce((sum, job) => sum + job.annualNI, 0);
  const combinedPension = jobBreakdowns.reduce((sum, job) => sum + job.annualPensionEmployee, 0);
  
  // Calculate student loans on combined gross income
  // Student loans are calculated on gross income (after salary sacrifice) above threshold
  // Each loan plan is calculated separately and added together
  let combinedStudentLoan = 0;
  const studentLoanBreakdown: Array<{ plan: LoanKey; label: string; amount: number }> = [];
  
  const planLabels: Record<LoanKey, string> = {
    plan1: "Plan 1",
    plan2: "Plan 2",
    plan4: "Plan 4",
    plan5: "Plan 5",
    postgrad: "Postgraduate loan",
  };
  
  for (const loanKey of studentLoan.plans) {
    const loan = UK_TAX_2025.studentLoans[loanKey];
    if (!loan) continue;
    const repayable = Math.max(0, totalGrossAnnual - loan.threshold);
    const amount = repayable * loan.rate;
    
    if (amount > 0) {
      studentLoanBreakdown.push({
        plan: loanKey,
        label: planLabels[loanKey] || loanKey,
        amount,
      });
      combinedStudentLoan += amount;
    }
  }
  
  // Calculate combined net (gross - all deductions)
  const combinedNetAnnual = combinedGrossAnnual 
    - combinedPAYE 
    - combinedNI 
    - combinedPension 
    - combinedStudentLoan;
  
  const combined: CombinedJobsBreakdown = {
    grossAnnual: combinedGrossAnnual,
    annualPAYE: combinedPAYE,
    annualNI: combinedNI,
    annualPensionEmployee: combinedPension,
    annualStudentLoan: combinedStudentLoan,
    studentLoanBreakdown,
    netAnnual: combinedNetAnnual,
  };
  
  return {
    jobs: jobBreakdowns,
    combined,
    taxYear,
  };
}

