"use client";

import React from "react";
import { LoanKey, UK_TAX_2025 } from "@/lib/tax/uk2025";

type Props = {
  value: LoanKey[];
  onChange: (next: LoanKey[]) => void;
};

const LOAN_OPTIONS: { id: LoanKey; label: string }[] = [
  { id: "plan1", label: "Plan 1" },
  { id: "plan2", label: "Plan 2" },
  { id: "plan4", label: "Plan 4 (Scotland)" },
  { id: "plan5", label: "Plan 5" },
  { id: "postgrad", label: "Postgraduate Loan (PGL)" },
];

export default function LoansMultiSelect({ value, onChange }: Props) {
  const toggle = (id: LoanKey) => {
    if (value.includes(id)) {
      onChange(value.filter((loan) => loan !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="grid gap-2 rounded-2xl border p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Student & Postgraduate Loans</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {LOAN_OPTIONS.map((option) => (
          <label
            key={option.id}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
          >
            <input
              type="checkbox"
              checked={value.includes(option.id)}
              onChange={() => toggle(option.id)}
            />
            <span>
              {option.label} — threshold £
              {UK_TAX_2025.studentLoans[option.id].threshold.toLocaleString("en-GB")}
            </span>
          </label>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Select the undergraduate and postgraduate plans that apply. Multiple plans will
        accrue simultaneously.
      </p>
    </div>
  );
}
