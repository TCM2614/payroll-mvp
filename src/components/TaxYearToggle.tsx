"use client";

import { TAX_YEAR_OPTIONS, type TaxYearLabel } from "@/lib/taxYear";

interface Props {
  value: TaxYearLabel;
  onChange: (value: TaxYearLabel) => void;
}

export function TaxYearToggle({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm">
      <span className="text-brand-textMuted">Tax year</span>
      <div className="inline-flex items-center gap-1 rounded-full border border-brand-border/60 bg-brand-surface/60 px-1 py-0.5 shadow-soft-xl">
        {TAX_YEAR_OPTIONS.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => onChange(year)}
            className={`px-2 py-1 rounded-full text-xs sm:text-sm transition-colors ${
              value === year
                ? "bg-brand-primary/20 text-brand-text font-medium shadow-soft-xl"
                : "text-brand-textMuted hover:text-brand-text hover:bg-brand-border/40"
            }`}
          >
            {year.replace("-", "/")}
          </button>
        ))}
      </div>
    </div>
  );
}


