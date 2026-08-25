import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-brand-text">
        Page not found
      </h1>
      <p className="text-sm text-brand-textMuted">
        That URL is not part of the UK Take-Home Calculator. Check the address
        or return to the calculator.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2 text-sm">
        <Link
          href="/"
          className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black hover:bg-emerald-400"
        >
          Home
        </Link>
        <Link
          href="/calc"
          className="rounded-xl border border-brand-border/60 px-4 py-2 text-brand-text hover:bg-brand-surface/60"
        >
          Calculator
        </Link>
      </div>
    </div>
  );
}
