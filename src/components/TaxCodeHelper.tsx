"use client";

/**
 * Small helper component that sits under a tax-code input and shows a
 * live one-line explanation of what the code the user typed will
 * actually do (extracted via the shared taxCode parser). Also nudges
 * the user with a warning when the code is unrecognised or when they've
 * asked for a Scottish code without the calculator having a Scottish
 * rates config available.
 */

import { useMemo } from "react";
import { parseTaxCode } from "@/domain/tax/taxCode";
import { getPayeTaxConfig } from "@/lib/tax/uk2025";
import type { TaxYearLabel } from "@/lib/taxYear";

interface Props {
  code: string;
  taxYear?: TaxYearLabel;
}

const SUPPORTED_HINT =
  "Supports every current UK tax code: L / M / N / T (with digits), K, BR, D0, D1, 0T, NT, plus Scottish (S…), Welsh (C…) and emergency non-cumulative suffixes (W1 / M1 / X).";

export function TaxCodeHelper({ code, taxYear = "2026-27" }: Props) {
  const parsed = useMemo(() => {
    if (!code || !code.trim()) return null;
    const config = getPayeTaxConfig(taxYear);
    return parseTaxCode(code, config.personalAllowance);
  }, [code, taxYear]);

  if (!parsed) {
    return (
      <p className="text-xs text-navy-300">{SUPPORTED_HINT}</p>
    );
  }

  if (parsed.unrecognised) {
    return (
      <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-2 text-xs text-amber-200">
        <p className="font-semibold">Tax code not recognised.</p>
        <p className="mt-1 text-amber-100/90">
          We&apos;re falling back to the standard personal allowance so you
          still get an estimate. Double-check the code on your P60 / P45 or
          the HMRC app.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 text-xs text-navy-300">
      <p>{parsed.description}</p>
      {parsed.regime === "scotland" && (
        <p className="text-emerald-200/80">
          Scottish taxpayer — the six-band Scottish schedule (Starter 19% /
          Basic 20% / Intermediate 21% / Higher 42% / Advanced 45% / Top
          48%) is applied on income tax. NI and student loans stay UK-wide.
        </p>
      )}
      {parsed.regime === "wales" && (
        <p className="text-navy-200/80">
          Welsh taxpayer — rates currently mirror the rest of the UK for
          this tax year.
        </p>
      )}
      {parsed.nonCumulative && (
        <p className="text-amber-200/80">
          Emergency / non-cumulative code (W1 / M1 / X). The annual total
          you owe is unchanged — but individual payslips may over- or
          under-deduct until HMRC issues a cumulative code.
        </p>
      )}
    </div>
  );
}
