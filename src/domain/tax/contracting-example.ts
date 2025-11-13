/**
 * Example usage of the contractor calculation engine
 * 
 * This file demonstrates how to use the calculateContractor function
 * for different contractor scenarios.
 */

import { calculateContractor, type ContractorInputs } from "./contracting";

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

const umbrellaResult = calculateContractor(umbrellaExample);
console.log("Umbrella contractor result:", umbrellaResult);
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

const limitedInsideResult = calculateContractor(limitedInsideIR35);
console.log("Limited company inside IR35 result:", limitedInsideResult);
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

const limitedOutsideResult = calculateContractor(limitedOutsideIR35);
console.log("Limited company outside IR35 result:", limitedOutsideResult);
// Expected: supported: false, with reasonIfUnsupported explaining why

// Example 4: Invalid input (no rate provided)
const invalidInput: ContractorInputs = {
  engagementType: "umbrella",
  ir35Status: "inside",
  taxYear: "2024-25",
  taxCode: "1257L",
};

const invalidResult = calculateContractor(invalidInput);
console.log("Invalid input result:", invalidResult);
// Expected: supported: false, with reasonIfUnsupported

