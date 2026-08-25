/**
 * Curated catalog of contractor annual-gross figures.
 *
 * Each entry becomes `/contractor/{n}-take-home`. Pages compute all four
 * engagement types (PAYE, Umbrella Inside IR35, Ltd Inside IR35, Ltd
 * Outside IR35) for the same annualised income so a visitor can see the
 * gap between "£70k gross as an employee" and "£70k gross as a
 * contractor".
 *
 * Kept curated (not every £1 step) — the day-rate slugs at
 * `/compare/[slug]` cover contractor-native intent; these pages cover
 * "I know my target annual number, what does it look like across the
 * four regimes?".
 */

export interface ContractorCatalogEntry {
  salary: number;
  landmark?: boolean;
}

export const CONTRACTOR_CATALOG: ContractorCatalogEntry[] = [
  { salary: 40_000 },
  { salary: 50_000, landmark: true },
  { salary: 60_000, landmark: true },
  { salary: 70_000, landmark: true },
  { salary: 80_000, landmark: true },
  { salary: 90_000 },
  { salary: 100_000, landmark: true },
  { salary: 110_000 },
  { salary: 120_000 },
  { salary: 125_000, landmark: true },
  { salary: 130_000 },
  { salary: 150_000, landmark: true },
  { salary: 175_000 },
  { salary: 200_000, landmark: true },
];

export function contractorSlug(salary: number): string {
  return `${salary}-take-home`;
}

export function contractorPath(salary: number): string {
  return `/contractor/${contractorSlug(salary)}`;
}

export function parseContractorSlug(slug: string): number | null {
  const m = /^(\d{4,7})-take-home$/.exec(slug);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 20_000 || n > 5_000_000) return null;
  return n;
}

export const CONTRACTOR_LANDMARK_SALARIES = CONTRACTOR_CATALOG.filter(
  (e) => e.landmark,
).map((e) => e.salary);

/**
 * Working assumption used to convert annual gross into the day-rate the
 * existing `computeLandingComparison` needs: 5 working days × 46 billable
 * weeks per year = 230 days. Matches the existing contractor-comparison
 * default in `landingComparison.ts`.
 */
export const CONTRACTOR_DAYS_PER_YEAR = 5 * 46;

export function annualToDayRate(annualGross: number): number {
  return annualGross / CONTRACTOR_DAYS_PER_YEAR;
}
