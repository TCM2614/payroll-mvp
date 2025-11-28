"use client";

import { LimitedCompanyCalculator } from "@/components/LimitedCompanyCalculator";
import type { CalculatorSummary } from "@/types/calculator";

type LimitedTabProps = {
  onSummaryChange?: (summary: CalculatorSummary) => void;
};

export function LimitedTab({ onSummaryChange }: LimitedTabProps) {
  return <LimitedCompanyCalculator onSummaryChange={onSummaryChange} />;
}

