/**
 * Tests for contractor calculation engine
 */

import {
  deriveGrossAnnualFromContractorInputs,
  calculateContractorAnnual,
  type ContractorInputs,
  type ContractorEngineDeps,
} from "../contracting";
import {
  createUK2025Config,
  calculateAnnualTax,
  type AnnualTaxBreakdown,
  type TaxYearConfig,
} from "../periodTax";

describe("deriveGrossAnnualFromContractorInputs", () => {
  const baseInput: ContractorInputs = {
    engagementType: "umbrella",
    ir35Status: "inside",
    taxYear: "2024-25",
    taxCode: "1257L",
  };

  it("should calculate annual from monthly rate", () => {
    const input = { ...baseInput, monthlyRate: 5000 };
    const result = deriveGrossAnnualFromContractorInputs(input);
    expect(result).toBe(60000); // 5000 * 12
  });

  it("should calculate annual from day rate with default 5 days/week", () => {
    const input = { ...baseInput, dayRate: 500 };
    const result = deriveGrossAnnualFromContractorInputs(input);
    expect(result).toBe(130000); // 500 * 5 * 52
  });

  it("should calculate annual from day rate with custom daysPerWeek", () => {
    const input = { ...baseInput, dayRate: 500, daysPerWeek: 3 };
    const result = deriveGrossAnnualFromContractorInputs(input);
    expect(result).toBe(78000); // 500 * 3 * 52
  });

  it("should calculate annual from hourly rate with required fields", () => {
    const input = {
      ...baseInput,
      hourlyRate: 50,
      hoursPerDay: 7.5,
      daysPerWeek: 5,
    };
    const result = deriveGrossAnnualFromContractorInputs(input);
    expect(result).toBe(97500); // 50 * 7.5 * 5 * 52
  });

  it("should throw error if hourlyRate provided without hoursPerDay", () => {
    const input = {
      ...baseInput,
      hourlyRate: 50,
      daysPerWeek: 5,
      // hoursPerDay missing
    };
    expect(() => deriveGrossAnnualFromContractorInputs(input)).toThrow(
      "hoursPerDay is required when hourlyRate is provided"
    );
  });

  it("should throw error if hourlyRate provided without daysPerWeek", () => {
    const input = {
      ...baseInput,
      hourlyRate: 50,
      hoursPerDay: 7.5,
      // daysPerWeek missing
    };
    expect(() => deriveGrossAnnualFromContractorInputs(input)).toThrow(
      "daysPerWeek is required when hourlyRate is provided"
    );
  });

  it("should prioritize monthly over day rate", () => {
    const input = {
      ...baseInput,
      monthlyRate: 5000,
      dayRate: 500,
    };
    const result = deriveGrossAnnualFromContractorInputs(input);
    expect(result).toBe(60000); // Should use monthly, not day
  });

  it("should prioritize day over hourly rate", () => {
    const input = {
      ...baseInput,
      dayRate: 500,
      hourlyRate: 50,
      hoursPerDay: 7.5,
      daysPerWeek: 5,
    };
    const result = deriveGrossAnnualFromContractorInputs(input);
    expect(result).toBe(130000); // Should use day, not hourly
  });

  it("should throw error for negative numbers", () => {
    const input = { ...baseInput, monthlyRate: -1000 };
    expect(() => deriveGrossAnnualFromContractorInputs(input)).toThrow(
      "monthlyRate must be >= 0"
    );
  });

  it("should throw error for non-finite numbers", () => {
    const input = { ...baseInput, monthlyRate: Infinity };
    expect(() => deriveGrossAnnualFromContractorInputs(input)).toThrow(
      "monthlyRate must be a finite number"
    );
  });

  it("should return 0 if no rate provided", () => {
    const result = deriveGrossAnnualFromContractorInputs(baseInput);
    expect(result).toBe(0);
  });
});

describe("calculateContractorAnnual", () => {
  const createMockDeps = (): ContractorEngineDeps => {
    return {
      createConfigForYear: (taxYear: "2024-25"): TaxYearConfig => {
        return createUK2025Config();
      },
      calculateAnnual: (input: {
        grossAnnualIncome: number;
        taxCode: string;
        pensionEmployeePercent?: number;
        studentLoanPlan?: ContractorInputs["studentLoanPlan"];
        config: TaxYearConfig;
      }): AnnualTaxBreakdown => {
        // Convert pension percent to annual amount
        const pensionEmployeeAnnual =
          (input.grossAnnualIncome * (input.pensionEmployeePercent || 0)) / 100;

        return calculateAnnualTax({
          grossAnnualIncome: input.grossAnnualIncome,
          pensionEmployeeAnnual,
          studentLoanPlan:
            input.studentLoanPlan === "none" ? undefined : input.studentLoanPlan,
          taxCode: input.taxCode,
          config: input.config,
        });
      },
    };
  };

  it("should return supported=true for inside IR35 umbrella", () => {
    const input: ContractorInputs = {
      engagementType: "umbrella",
      ir35Status: "inside",
      dayRate: 500,
      daysPerWeek: 5,
      taxYear: "2024-25",
      taxCode: "1257L",
      pensionEmployeePercent: 5,
      studentLoanPlan: "plan2",
    };

    const result = calculateContractorAnnual(input, createMockDeps());

    expect(result.supported).toBe(true);
    expect(result.grossAnnualIncome).toBeGreaterThan(0);
    expect(result.annual).toBeDefined();
    expect(result.annual?.paye).toBeGreaterThanOrEqual(0);
    expect(result.annual?.ni).toBeGreaterThanOrEqual(0);
    expect(result.annual?.net).toBeGreaterThan(0);
  });

  it("should return supported=true for inside IR35 limited company", () => {
    const input: ContractorInputs = {
      engagementType: "limited",
      ir35Status: "inside",
      monthlyRate: 5000,
      taxYear: "2024-25",
      taxCode: "1257L",
      pensionEmployeePercent: 5,
    };

    const result = calculateContractorAnnual(input, createMockDeps());

    expect(result.supported).toBe(true);
    expect(result.grossAnnualIncome).toBe(60000);
    expect(result.annual).toBeDefined();
  });

  it("should return supported=false for outside IR35 limited company", () => {
    const input: ContractorInputs = {
      engagementType: "limited",
      ir35Status: "outside",
      dayRate: 500,
      daysPerWeek: 5,
      taxYear: "2024-25",
      taxCode: "1257L",
    };

    const result = calculateContractorAnnual(input, createMockDeps());

    expect(result.supported).toBe(false);
    expect(result.reasonIfUnsupported).toContain("Outside IR35");
    expect(result.grossAnnualIncome).toBeGreaterThan(0); // Still populated
  });

  it("should return supported=false when no rate provided", () => {
    const input: ContractorInputs = {
      engagementType: "umbrella",
      ir35Status: "inside",
      taxYear: "2024-25",
      taxCode: "1257L",
    };

    const result = calculateContractorAnnual(input, createMockDeps());

    expect(result.supported).toBe(false);
    expect(result.reasonIfUnsupported).toContain("No valid rate");
    expect(result.grossAnnualIncome).toBe(0);
  });

  it("should handle invalid rate input gracefully", () => {
    const input: ContractorInputs = {
      engagementType: "umbrella",
      ir35Status: "inside",
      hourlyRate: 50,
      // Missing required hoursPerDay and daysPerWeek
      taxYear: "2024-25",
      taxCode: "1257L",
    };

    const result = calculateContractorAnnual(input, createMockDeps());

    expect(result.supported).toBe(false);
    expect(result.reasonIfUnsupported).toBeDefined();
  });
});


