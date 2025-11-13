"use client";

import * as React from "react";

export type StudentLoanPlan = "none" | "plan1" | "plan2" | "plan4" | "plan5" | "postgrad";

interface StudentLoanMultiSelectProps {
  selectedPlans: StudentLoanPlan[];
  onChange: (plans: StudentLoanPlan[]) => void;
}

const allPlans: { id: StudentLoanPlan; label: string }[] = [
  { id: "none", label: "No student loan" },
  { id: "plan1", label: "Plan 1" },
  { id: "plan2", label: "Plan 2" },
  { id: "plan4", label: "Plan 4" },
  { id: "plan5", label: "Plan 5" },
  { id: "postgrad", label: "Postgraduate loan" },
];

export function StudentLoanMultiSelect({
  selectedPlans,
  onChange,
}: StudentLoanMultiSelectProps) {
  const handleToggle = (planId: StudentLoanPlan) => {
    if (planId === "none") {
      onChange(["none"]);
      return;
    }

    const withoutNone = selectedPlans.filter((p) => p !== "none");
    const checked = selectedPlans.includes(planId);

    if (checked) {
      const newPlans = withoutNone.filter((p) => p !== planId);
      onChange(newPlans.length > 0 ? newPlans : ["none"]);
    } else {
      onChange([...withoutNone, planId]);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">
        Student loan plan(s)
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {allPlans.map((plan) => {
          const checked = selectedPlans.includes(plan.id);
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => handleToggle(plan.id)}
              className={
                "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs sm:text-sm transition-colors " +
                (checked
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50")
              }
            >
              {plan.label}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500">
        You can compare multiple student loan plans side by side. We run a separate
        scenario for each selected plan.
      </p>
    </div>
  );
}

