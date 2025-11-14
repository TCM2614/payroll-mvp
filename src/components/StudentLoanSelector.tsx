"use client";

import * as React from "react";
import type { StudentLoanSelection, UndergraduatePlan } from "@/lib/student-loans";

interface StudentLoanSelectorProps {
  selection: StudentLoanSelection;
  onChange: (selection: StudentLoanSelection) => void;
}

const undergraduatePlans: { id: UndergraduatePlan; label: string }[] = [
  { id: "none", label: "No undergraduate loan" },
  { id: "plan1", label: "Plan 1" },
  { id: "plan2", label: "Plan 2" },
  { id: "plan4", label: "Plan 4" },
  { id: "plan5", label: "Plan 5" },
];

export function StudentLoanSelector({
  selection,
  onChange,
}: StudentLoanSelectorProps) {
  const handleUndergraduateChange = (plan: UndergraduatePlan) => {
    onChange({
      ...selection,
      undergraduatePlan: plan,
    });
  };

  const handlePostgraduateToggle = () => {
    onChange({
      ...selection,
      hasPostgraduateLoan: !selection.hasPostgraduateLoan,
    });
  };

  return (
    <div className="space-y-4">
      {/* Undergraduate Plan Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-brand-text">
          Undergraduate student loan plan
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {undergraduatePlans.map((plan) => {
            const isSelected = selection.undergraduatePlan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => handleUndergraduateChange(plan.id)}
                className={
                  "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/70 " +
                  (isSelected
                    ? "border-brand-primary bg-brand-primary/20 text-brand-text shadow-soft-xl"
                    : "border-brand-border/60 bg-brand-surface/60 text-brand-textMuted hover:bg-brand-border/40 hover:text-brand-text")
                }
              >
                {plan.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Postgraduate Loan Toggle */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selection.hasPostgraduateLoan}
            onChange={handlePostgraduateToggle}
            className="h-4 w-4 rounded border-brand-border/60 bg-brand-surface/60 text-brand-primary focus:ring-2 focus:ring-brand-primary/70"
          />
          <span className="text-sm font-medium text-brand-text">
            Postgraduate loan
          </span>
        </label>
        <p className="text-xs text-brand-textMuted pl-7">
          You can have both an undergraduate plan and a postgraduate loan at the same time.
          Both will be deducted from your take-home pay.
        </p>
      </div>

      {/* Summary */}
      {(selection.undergraduatePlan !== "none" || selection.hasPostgraduateLoan) && (
        <div className="rounded-xl border border-brand-border/60 bg-brand-surface/40 p-3">
          <p className="text-xs text-brand-textMuted">
            <strong className="text-brand-text">Selected:</strong>{" "}
            {selection.undergraduatePlan !== "none" && (
              <span>
                {undergraduatePlans.find((p) => p.id === selection.undergraduatePlan)?.label}
              </span>
            )}
            {selection.undergraduatePlan !== "none" && selection.hasPostgraduateLoan && (
              <span> + </span>
            )}
            {selection.hasPostgraduateLoan && <span>Postgraduate loan</span>}
            {selection.undergraduatePlan === "none" && !selection.hasPostgraduateLoan && (
              <span>No student loans</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

