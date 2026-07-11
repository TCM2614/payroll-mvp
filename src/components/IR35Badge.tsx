"use client";

/**
 * Visual label for a calculator's IR35 status. Rendered at the top of every
 * contracting calculator so the user is never in any doubt about which
 * regime the estimator is modelling.
 */

export type IR35Status = "inside" | "outside";

interface Props {
  status: IR35Status;
  className?: string;
}

const CLASSES: Record<IR35Status, string> = {
  inside:
    "inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-xxs font-semibold uppercase tracking-wide text-amber-200",
  outside:
    "inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-xxs font-semibold uppercase tracking-wide text-emerald-200",
};

const DOT_CLASSES: Record<IR35Status, string> = {
  inside: "h-1.5 w-1.5 rounded-full bg-amber-300",
  outside: "h-1.5 w-1.5 rounded-full bg-emerald-300",
};

export function IR35Badge({ status, className }: Props) {
  const label = status === "inside" ? "Inside IR35" : "Outside IR35";
  return (
    <span
      className={`${CLASSES[status]} ${className ?? ""}`}
      aria-label={`This calculator models ${label} engagements`}
    >
      <span className={DOT_CLASSES[status]} aria-hidden="true" />
      {label}
    </span>
  );
}
