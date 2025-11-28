"use client";

import { UmbrellaCalculator } from "@/components/UmbrellaCalculator";
import type { CalculatorSummary } from "@/types/calculator";

type UmbrellaTabProps = {
  onSummaryChange?: (summary: CalculatorSummary) => void;
  onGrossChange?: (value: number) => void;
};

export function UmbrellaTab({ onSummaryChange, onGrossChange }: UmbrellaTabProps) {
  return (
    <UmbrellaCalculator
      onSummaryChange={onSummaryChange}
      onGrossChange={onGrossChange}
    />
  );
}

