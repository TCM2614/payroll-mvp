"use client";

import React from "react";

type Props = {
  salarySacrificePct: number;
  setSalarySacrificePct: (value: number) => void;
  salarySacrificeFixed: number;
  setSalarySacrificeFixed: (value: number) => void;
  sippPersonal: number;
  setSippPersonal: (value: number) => void;
};

export default function SIPPAndSalarySacrifice({
  salarySacrificePct,
  setSalarySacrificePct,
  salarySacrificeFixed,
  setSalarySacrificeFixed,
  sippPersonal,
  setSippPersonal,
}: Props) {
  return (
    <div className="grid gap-3 rounded-2xl border p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Pensions & SIPP</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm">
          <span>Salary sacrifice (%)</span>
          <input
            type="number"
            className="rounded-lg border px-3 py-2 text-sm"
            value={salarySacrificePct}
            onChange={(event) => setSalarySacrificePct(Number(event.target.value || 0))}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Salary sacrifice (£)</span>
          <input
            type="number"
            className="rounded-lg border px-3 py-2 text-sm"
            value={salarySacrificeFixed}
            onChange={(event) => setSalarySacrificeFixed(Number(event.target.value || 0))}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>SIPP personal (net)</span>
          <input
            type="number"
            className="rounded-lg border px-3 py-2 text-sm"
            value={sippPersonal}
            onChange={(event) => setSippPersonal(Number(event.target.value || 0))}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        SIPP amounts are assumed to be paid personally (net of basic-rate relief). Extra
        relief is estimated based on your combined marginal band.
      </p>
    </div>
  );
}
