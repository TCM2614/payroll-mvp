/**
 * EXAMPLE CODE ONLY - NOT USED BY THE APPLICATION
 * 
 * This file contains example usage of the contractor calculation engine
 * for documentation purposes. All code is commented out to prevent build errors.
 * 
 * To use the contractor calculation engine, import from "./contracting":
 * 
 * ```ts
 * import { 
 *   calculateContractorAnnual, 
 *   type ContractorInputs,
 *   type ContractorEngagementType,
 *   type Ir35Status
 * } from "./contracting";
 * import { createUK2025Config, calculateAnnualTax } from "./periodTax";
 * 
 * const contractorInputs: ContractorInputs = {
 *   engagementType: "umbrella",
 *   ir35Status: "inside",
 *   dayRate: 500,
 *   daysPerWeek: 5,
 *   taxYear: "2024-25",
 *   taxCode: "1257L",
 *   pensionEmployeePercent: 5,
 *   studentLoanPlan: "plan2",
 * };
 * 
 * const result = calculateContractorAnnual(contractorInputs, {
 *   createConfigForYear: () => createUK2025Config(),
 *   calculateAnnual: (input) => calculateAnnualTax(input),
 * });
 * ```
 */

/*
Example usage of the contractor engine (for reference only):

// Example 1: Umbrella contractor (always inside IR35)
const umbrellaExample: ContractorInputs = {
  engagementType: "umbrella",
  ir35Status: "inside", // Umbrella is always inside, but we still need to specify
  dayRate: 500,
  daysPerWeek: 5,
  taxYear: "2024-25",
  taxCode: "1257L",
  pensionEmployeePercent: 5,
  studentLoanPlan: "plan2",
};

// const result = calculateContractorAnnual(umbrellaExample, deps);
// Expected: supported: true, with annual breakdown

// Example 2: Limited company inside IR35
const limitedInsideIR35: ContractorInputs = {
  engagementType: "limited",
  ir35Status: "inside",
  hourlyRate: 50,
  hoursPerDay: 7.5,
  daysPerWeek: 5,
  taxYear: "2024-25",
  taxCode: "1257L",
  pensionEmployeePercent: 5,
  studentLoanPlan: "none",
};

// const limitedInsideResult = calculateContractorAnnual(limitedInsideIR35, deps);
// Expected: supported: true, with annual breakdown (PAYE-like)

// Example 3: Limited company outside IR35 (not supported)
const limitedOutsideIR35: ContractorInputs = {
  engagementType: "limited",
  ir35Status: "outside",
  monthlyRate: 10000,
  taxYear: "2024-25",
  taxCode: "1257L",
  pensionEmployeePercent: 0,
  studentLoanPlan: "none",
};

// const limitedOutsideResult = calculateContractorAnnual(limitedOutsideIR35, deps);
// Expected: supported: false, with reasonIfUnsupported explaining why

// Example 4: Invalid input (no rate provided)
const invalidInput: ContractorInputs = {
  engagementType: "umbrella",
  ir35Status: "inside",
  taxYear: "2024-25",
  taxCode: "1257L",
};

// const invalidResult = calculateContractorAnnual(invalidInput, deps);
// Expected: supported: false, with reasonIfUnsupported
*/

export {};
