"use client";

import { UmbrellaCalculator } from "@/components/UmbrellaCalculator";
import type { CalculatorSummary } from "@/types/calculator";

type UmbrellaTabProps = {
  onSummaryChange?: (summary: CalculatorSummary) => void;
};

export function UmbrellaTab({ onSummaryChange }: UmbrellaTabProps) {
  return <UmbrellaCalculator onSummaryChange={onSummaryChange} />;
}

