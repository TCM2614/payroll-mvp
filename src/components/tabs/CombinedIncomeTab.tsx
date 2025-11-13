"use client";



import ContractorComparisonTabs from "@/components/ContractorComparisonTabs";



export function CombinedIncomeTab() {

  return (

    <div className="space-y-4">

      <p className="text-xs text-zinc-500">

        Model different structures (PAYE vs Umbrella vs Limited) and combined incomes

        using a single view. Adjust day rates, salaries and assumptions to see which

        gives you the highest net position.

      </p>

      <ContractorComparisonTabs />

    </div>

  );

}

