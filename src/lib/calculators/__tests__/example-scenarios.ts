/**
 * Example calculation scenarios for testing the UK Payroll Calculator
 * 
 * These scenarios demonstrate real-world use cases for:
 * - PAYE (standard employment)
 * - Umbrella (contracting via umbrella company)
 * - Limited Company (director/shareholder route)
 */

import { calcPayeMonthly, calcPAYECombined } from "../paye";
import { calcUmbrella } from "../umbrella";
import { calcLimited } from "../limited";
import { formatGBP } from "@/lib/format";

// ============================================================================
// SCENARIO 1: Standard PAYE Employee
// ============================================================================
/**
 * Scenario: Full-time PAYE employee
 * - Monthly gross: £5,000
 * - Tax code: 1257L (standard)
 * - Student loan: Plan 2
 * - Pension: 5% salary sacrifice
 * 
 * Expected: Standard tax and NI deductions, with pension reducing taxable income
 */
export const scenario1_PAYE_Standard = () => {
  const result = calcPayeMonthly({
    grossMonthly: 5000,
    taxCode: "1257L",
    loans: ["plan2"],
    pensionPct: 5,
    sippPct: 0,
  });

  // Get detailed breakdown using calcPAYECombined
  const detailed = calcPAYECombined({
    streams: [{
      id: "primary",
      label: "Primary job",
      frequency: "monthly",
      amount: 5000,
      taxCode: "1257L",
      salarySacrificePct: 5,
    }],
    loans: ["plan2"],
  });

  console.log("=== SCENARIO 1: Standard PAYE Employee ===");
  console.log("Monthly Gross:", formatGBP(5000));
  console.log("Annual Gross:", formatGBP(detailed.totalGrossAnnual));
  console.log("Income Tax:", formatGBP(detailed.totalIncomeTax));
  console.log("Employee NI:", formatGBP(detailed.totalEmployeeNI));
  console.log("Student Loans:", formatGBP(detailed.totalStudentLoans));
  console.log("Monthly Take-Home:", formatGBP(result));
  console.log("Annual Take-Home:", formatGBP(result * 12));
  console.log("");

  return {
    description: "Full-time PAYE employee, £5k/month, Plan 2 loan, 5% pension",
    monthlyGross: 5000,
    monthlyTakeHome: result,
    annualTakeHome: result * 12,
  };
};

// ============================================================================
// SCENARIO 2: Umbrella Contractor
// ============================================================================
/**
 * Scenario: Contractor working via umbrella company
 * - Day rate: £500/day
 * - Days per week: 5
 * - Weeks per year: 46
 * - Tax code: 1257L
 * - Pension: 5% salary sacrifice
 * 
 * Expected: Umbrella margin and employer costs deducted, then PAYE applied
 */
export const scenario2_Umbrella_Contractor = () => {
  const result = calcUmbrella({
    dayRate: 500,
    daysPerWeek: 5,
    weeksPerYear: 46,
    taxCode: "1257L",
    salarySacrificePct: 5,
    umbrellaMarginPerWeek: 20,
    holidayPayPct: 12.07,
  });

  const monthlyTakeHome = result.netTakeHomeAnnual / 12;
  const monthlyGross = result.assignmentAnnual / 12;

  console.log("=== SCENARIO 2: Umbrella Contractor ===");
  console.log("Day Rate: £500");
  console.log("Annual Assignment Value:", formatGBP(result.assignmentAnnual));
  console.log("Umbrella Costs:", formatGBP(result.employmentCostAnnual));
  console.log("Gross to Employee:", formatGBP(result.grossToEmployeeAnnual));
  console.log("Income Tax:", formatGBP(result.paye.totalIncomeTax));
  console.log("Employee NI:", formatGBP(result.paye.totalEmployeeNI));
  console.log("Student Loans:", formatGBP(result.paye.totalStudentLoans));
  console.log("Monthly Gross (to employee):", formatGBP(monthlyGross));
  console.log("Monthly Take-Home:", formatGBP(monthlyTakeHome));
  console.log("Annual Take-Home:", formatGBP(result.netTakeHomeAnnual));
  console.log("");

  return {
    description: "Umbrella contractor, £500/day, 5 days/week, 46 weeks/year",
    dayRate: 500,
    annualAssignment: result.assignmentAnnual,
    annualTakeHome: result.netTakeHomeAnnual,
    monthlyTakeHome,
  };
};

// ============================================================================
// SCENARIO 3: Limited Company Director
// ============================================================================
/**
 * Scenario: Limited company director/shareholder
 * - Day rate: £500/day
 * - Days per week: 5
 * - Weeks per year: 46
 * - Director salary: £12,570/year (optimal tax-free allowance)
 * - Employer pension: 5% of revenue
 * 
 * Expected: Corporation tax on profit, then dividend tax on distributions
 */
export const scenario3_Limited_Company = () => {
  const result = calcLimited({
    dayRate: 500,
    daysPerWeek: 5,
    weeksPerYear: 46,
    salaryAnnual: 12570,
    employerPension: (500 * 5 * 46 * 0.05), // 5% of revenue
    allowableExpensesAnnual: 0,
  });

  const monthlyTakeHome = result.netToDirector / 12;
  const monthlyRevenue = result.revenueAnnual / 12;

  console.log("=== SCENARIO 3: Limited Company Director ===");
  console.log("Day Rate: £500");
  console.log("Annual Revenue:", formatGBP(result.revenueAnnual));
  console.log("Director Salary (gross):", formatGBP(result.salary));
  console.log("Income Tax on Salary:", formatGBP(result.paye.totalIncomeTax));
  console.log("Employee NI on Salary:", formatGBP(result.paye.totalEmployeeNI));
  console.log("Net Salary (after PAYE/NI):", formatGBP(result.netSalary));
  console.log("Corporation Tax:", formatGBP(result.corpTax));
  console.log("Dividend Tax:", formatGBP(result.dividendTax));
  console.log("Net Dividends:", formatGBP(result.netDividends));
  console.log("Monthly Revenue:", formatGBP(monthlyRevenue));
  console.log("Monthly Take-Home (salary + dividends):", formatGBP(monthlyTakeHome));
  console.log("Annual Take-Home:", formatGBP(result.netToDirector));
  console.log("");

  return {
    description: "Limited company, £500/day, optimal salary, 5% employer pension",
    dayRate: 500,
    annualRevenue: result.revenueAnnual,
    annualTakeHome: result.netToDirector,
    monthlyTakeHome,
  };
};

// ============================================================================
// SCENARIO 4: Multi-Job PAYE (Combined)
// ============================================================================
/**
 * Scenario: Multiple PAYE jobs
 * - Primary job: £4,000/month, 1257L
 * - Second job: £1,500/month, BR (basic rate)
 * - Pension: 5% on primary only
 * 
 * Expected: Personal allowance allocated to primary, BR on second job
 */
export const scenario4_MultiJob_PAYE = () => {
  const result = calcPAYECombined({
    streams: [
      {
        id: "primary",
        label: "Primary Job",
        frequency: "monthly",
        amount: 4000,
        taxCode: "1257L",
        salarySacrificePct: 5,
      },
      {
        id: "secondary",
        label: "Second Job",
        frequency: "monthly",
        amount: 1500,
        taxCode: "BR",
      },
    ],
    sippPersonal: 0,
  });

  const monthlyTakeHome = result.totalTakeHomeAnnual / 12;

  console.log("=== SCENARIO 4: Multi-Job PAYE ===");
  console.log("Primary Job: £4,000/month (1257L, 5% pension)");
  console.log("Second Job: £1,500/month (BR)");
  console.log("Total Annual Gross:", formatGBP(result.totalGrossAnnual));
  console.log("Total Income Tax:", formatGBP(result.totalIncomeTax));
  console.log("Total Employee NI:", formatGBP(result.totalEmployeeNI));
  console.log("Total Student Loans:", formatGBP(result.totalStudentLoans));
  console.log("Monthly Take-Home:", formatGBP(monthlyTakeHome));
  console.log("Annual Take-Home:", formatGBP(result.totalTakeHomeAnnual));
  console.log("");

  return {
    description: "Two PAYE jobs: £4k primary (1257L), £1.5k secondary (BR)",
    totalAnnualGross: result.totalGrossAnnual,
    annualTakeHome: result.totalTakeHomeAnnual,
    monthlyTakeHome,
  };
};

// ============================================================================
// Run all scenarios
// ============================================================================
export const runAllScenarios = () => {
  console.log("🧮 UK Payroll Calculator - Test Scenarios\n");
  console.log("=".repeat(60));
  console.log("");

  const results = [
    scenario1_PAYE_Standard(),
    scenario2_Umbrella_Contractor(),
    scenario3_Limited_Company(),
    scenario4_MultiJob_PAYE(),
  ];

  console.log("=".repeat(60));
  console.log("\n📊 Summary:");
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.description}`);
    console.log(`   Annual Take-Home: ${formatGBP(r.annualTakeHome)}`);
  });

  return results;
};

// Uncomment to run scenarios:
// runAllScenarios();

