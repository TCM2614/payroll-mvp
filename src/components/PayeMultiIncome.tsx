"use client";

import React from "react";
import {
  Frequency,
  PayeIncomeStream,
} from "@/lib/calculators/paye";

type Props = {
  streams: PayeIncomeStream[];
  onChange: (next: PayeIncomeStream[]) => void;
};

const freqOptions: Frequency[] = ["hourly", "daily", "monthly", "annual"];

export default function PayeMultiIncome({ streams, onChange }: Props) {
  const update = (id: string, patch: Partial<PayeIncomeStream>) => {
    onChange(streams.map((stream) => (stream.id === id ? { ...stream, ...patch } : stream)));
  };

  const addStream = () => {
    if (streams.length >= 3) return;
    const idx = streams.length === 1 ? "secondary" : "tertiary";
    onChange([
      ...streams,
      {
        id: idx,
        label: idx[0].toUpperCase() + idx.slice(1),
        frequency: "monthly",
        amount: 0,
        taxCode: "BR",
      },
    ]);
  };

  const remove = (id: string) => onChange(streams.filter((s) => s.id !== id));

  return (
    <div className="grid gap-4 rounded-2xl border p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">
          PAYE Multi-Income (Primary + Secondary + Tertiary)
        </h3>
        <button
          type="button"
          className="rounded-lg border px-3 py-1 text-sm font-medium"
          onClick={addStream}
          disabled={streams.length >= 3}
        >
          + Add stream
        </button>
      </div>

      <div className="grid gap-4">
        {streams.map((stream) => (
          <div
            key={stream.id}
            className="grid gap-3 rounded-xl border p-3 md:grid-cols-6"
          >
            <div className="md:col-span-1">
              <label className="text-sm font-medium">Label</label>
              <input
                className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
                value={stream.label}
                onChange={(event) => update(stream.id, { label: event.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Frequency</label>
              <select
                className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
                value={stream.frequency}
                onChange={(event) =>
                  update(stream.id, { frequency: event.target.value as Frequency })
                }
              >
                {freqOptions.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Gross ({stream.frequency})
              </label>
              <input
                type="number"
                className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
                value={stream.amount}
                onChange={(event) =>
                  update(stream.id, { amount: Number(event.target.value || 0) })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tax code</label>
              <input
                className="mt-1 w-full rounded-lg border px-2 py-2 text-sm uppercase"
                value={stream.taxCode}
                onChange={(event) => update(stream.id, { taxCode: event.target.value })}
              />
            </div>

            {stream.id === "primary" ? (
              <>
                <div>
                  <label className="text-sm font-medium">Salary sacrifice (%)</label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
                    value={stream.salarySacrificePct ?? 0}
                    onChange={(event) =>
                      update(stream.id, {
                        salarySacrificePct: Number(event.target.value || 0),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Salary sacrifice (£)</label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
                    value={stream.salarySacrificeFixed ?? 0}
                    onChange={(event) =>
                      update(stream.id, {
                        salarySacrificeFixed: Number(event.target.value || 0),
                      })
                    }
                  />
                </div>
              </>
            ) : (
              <div className="md:col-span-1 flex items-end">
                <button
                  type="button"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  onClick={() => remove(stream.id)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Input amounts stay in their original frequency. Behind the scenes we annualise
        for PAYE / NI math and show the combined annual totals per stream.
      </p>
    </div>
  );
}



