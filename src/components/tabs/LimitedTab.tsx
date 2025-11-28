"use client";

import { LimitedCompanyCalculator } from "@/components/LimitedCompanyCalculator";
import type { CalculatorSummary } from "@/types/calculator";

type LimitedTabProps = {
  onSummaryChange?: (summary: CalculatorSummary) => void;
  onGrossChange?: (value: number) => void;
};

export function LimitedTab({ onSummaryChange, onGrossChange }: LimitedTabProps) {
  return (
    <LimitedCompanyCalculator
      onSummaryChange={onSummaryChange}
      onGrossChange={onGrossChange}
    />
  );
}

