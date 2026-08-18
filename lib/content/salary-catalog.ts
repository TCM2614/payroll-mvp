/**
 * Canonical list of salaries that are worth building a first‑class landing
 * page for.
 *
 * Rules of thumb:
 *  - Round‑number salaries at £1k intervals £18k–£60k (highest UK search volume).
 *  - £5k intervals £60k–£100k.
 *  - Anchor points at £100k / £110k / £120k / £125k / £130k / £150k for the
 *    £100k tax trap discussion.
 *  - `landmark: true` marks salaries used as anchors in the internal salary
 *    graph and marketing calendar.
 *
 * Extending this list is safe: `app/salary/[slug]-after-tax/page.tsx` uses
 * this catalog to pre‑generate pages at build time.
 */

export interface SalaryCatalogEntry {
  salary: number;
  landmark?: boolean;
  /** Optional intent copy used on the landing page hero. */
  intent?: string;
}

const oneKStep = (from: number, to: number, step = 1_000): number[] => {
  const out: number[] = [];
  for (let s = from; s <= to; s += step) out.push(s);
  return out;
};

export const SALARY_CATALOG: SalaryCatalogEntry[] = [
  ...oneKStep(18_000, 60_000).map((salary) => ({ salary })),
  ...oneKStep(65_000, 100_000, 5_000).map((salary) => ({ salary })),
  { salary: 110_000 },
  { salary: 120_000 },
  { salary: 125_000 },
  { salary: 130_000 },
  { salary: 140_000 },
  { salary: 150_000 },
]
  .map((entry) => {
    const landmark = [
      18_000, 20_000, 25_000, 30_000, 35_000, 40_000, 45_000, 50_000, 55_000, 60_000,
      70_000, 75_000, 80_000, 90_000, 100_000, 125_000, 150_000,
    ].includes(entry.salary);
    return { ...entry, landmark };
  })
  // Deduplicate salaries in case of overlap (defensive).
  .filter((entry, i, arr) => arr.findIndex((e) => e.salary === entry.salary) === i)
  .sort((a, b) => a.salary - b.salary);

/**
 * Landmark salaries used for the internal salary graph and cross‑linking.
 * These are the salaries most likely to be searched independently and also
 * the salaries most useful for pay‑rise comparisons.
 */
export const LANDMARK_SALARIES = SALARY_CATALOG.filter((e) => e.landmark).map(
  (e) => e.salary,
);

/**
 * Slug format used throughout the site: `/salary/{n}-after-tax`.
 */
export function salarySlug(salary: number): string {
  return `${salary}-after-tax`;
}

export function salaryPath(salary: number): string {
  return `/salary/${salarySlug(salary)}`;
}

/**
 * Parse a slug back to a numeric salary. Returns `null` on any malformed
 * input to avoid generating pages for hostile URLs.
 */
export function parseSalarySlug(slug: string): number | null {
  const match = /^(\d{4,7})-after-tax$/.exec(slug);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n < 1_000 || n > 10_000_000) return null;
  return n;
}

/**
 * Neighbouring salaries used for the on‑page salary graph navigation.
 * Returns a curated window: previous 3, next 3, plus landmark jumps.
 */
export function neighbourSalaries(current: number): {
  prev: number[];
  next: number[];
  jumps: number[];
} {
  const sorted = SALARY_CATALOG.map((e) => e.salary);
  const idx = sorted.indexOf(current);
  const prev = idx > 0 ? sorted.slice(Math.max(0, idx - 3), idx) : [];
  const next = idx >= 0 ? sorted.slice(idx + 1, idx + 4) : [];
  const jumps = LANDMARK_SALARIES.filter(
    (s) => Math.abs(s - current) >= 10_000,
  );
  return { prev, next, jumps };
}
