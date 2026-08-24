# Current-State Audit — UK Take Home Calculator (July branch continuation)

Audit performed on Aug 19, 2026 against `cursor/tax-year-2025-26-cc6d` (tip `c58529d`, dated July 15 2026), which is the most recent production-track branch. This branch has 35 commits beyond `main` and is the correct base for the growth-phase sprint — it already contains most of the calculator, testing and SEO fundamentals the brief mentions.

## TL;DR

The application is real and mature. It has a deterministic tax engine, four calculators (PAYE, Umbrella, Limited Inside IR35, Limited Outside IR35), 151 passing vitest regression tests, per-scenario `/calc/[scenario]` SEO landing pages, `/compare/[slug]` shareable comparison URLs, a dynamic OG image API, a sitemap, JSON-LD, an income-percentile module by age, Plausible analytics with UTM auto-attach, an AdSense integration and consent posture, and a landing comparison strip. Most of what the growth brief lists is already shipped.

The gaps are targeted acquisition surfaces:

1. `/salary/[slug]-after-tax` programmatic salary landing pages — the site currently indexes day-rate scenarios (`/compare/500-a-day`) and IR35 regimes (`/calc/paye`) but does **not** index annual-salary landings which is a very large search-intent bucket.
2. `/100k-tax-trap` — the flagship shareable acquisition asset from the brief, currently missing.
3. `/pay-rise` — natural social hook page, currently missing.
4. Standalone `/salary-percentile` URL — the `WealthPercentileTab` exists inside the calculator, but there is no first-class URL for SEO/sharing.
5. Growth documentation set.
6. 30-day marketing calendar dataset.
7. `robots.ts` + a `SITE_URL`-aware `robots.txt` (the file in `public/` still contains `yourdomain.com`).

## Already Implemented (do not rebuild)

### Tax engine

- `src/domain/tax/`
  - `periodTax.ts` — pay-period income tax + NI with correct £100k+ PA taper.
  - `taxCode.ts` — full parser: `1257L`, `K…`, `S…`, `BR/D0/D1/D2`, `NT`, `0T`, `M`/`N` marriage allowance, `X`, `T`, Welsh `C…`.
  - `contracting.ts` — annual contractor engine reused by comparison strip.
  - `outsideIR35.ts` — director salary + dividends + corporation-tax marginal relief.
  - `multiJob.ts` — combined PAYE across streams with per-stream tax codes.
  - `periodActuals.ts` — reconciles cumulative vs non-cumulative period tax.
- `src/lib/tax/uk2025.ts` — Scottish bands (starter/basic/intermediate/higher/advanced/top) + SBR/SD0/SD1/SD2 flat overrides.
- `src/lib/calculators/{paye,umbrella,limited}.ts` — the calculator-facing entry points.
- `src/lib/student-loans.ts` — Plan 1/2/4/5 + Postgraduate with correct stacking.
- `app/lib/taxYear.ts` = `2026/27`.
- 151 vitest tests pass across 10 files (`paTaper.spec`, `taxCode.spec`, `periodTax.spec`, `contracting.spec`, `periodActuals.spec`, `example-scenarios`, `getIncomePercentileForAge.ageBands.spec`, `getIncomePercentileForAge.test`, `incomePercentile.test`, `periodTaxCodeOverride.test`, `landingComparison.spec`, `compareSlug.spec`, `deriveComparisonInputs.spec`).

### Calculators

- `src/components/take-home-calculator.tsx` — 5-tab shell with `initialTab` prop for per-scenario landings.
- `src/components/tabs/{PayeTab,UmbrellaTab,LimitedTab,LimitedOutsideIR35Tab,WealthPercentileTab,CombinedIncomeTab,AdditionalJobsTab}.tsx`
- `src/components/{PayeMultiIncome,UmbrellaCalculator,LimitedCompanyCalculator,OutsideIR35Calculator,IR35Badge,TaxCodeHelper,SIPPAndSalarySacrifice,StudentLoanMultiSelect,StudentLoanSelector,LoansMultiSelect,DeductionsChart,ContractorComparisonTabs,CalculatorSummary}.tsx`

### Growth / acquisition surface

- `/calc/[scenario]` for `paye`, `umbrella`, `limited-inside-ir35`, `limited-outside-ir35` with unique H1, meta title/description, keywords, FAQPage + SoftwareApplication JSON-LD, and cross-links between regimes.
- `/compare/[slug]` share URLs: `500-a-day`, `600-a-day`, `50-per-hour`, `6000-a-month`, `120000-a-year`, plus a validated parser with guardrails.
- `src/lib/marketing/`
  - `calcScenarios.ts` — landing configs.
  - `compareSlug.ts` — slug parsing/formatting with min/max guardrails.
  - `landingComparison.ts` — deterministic 4-scenario comparison used everywhere.
  - `deriveComparisonInputs.ts` — comparison strip inputs.
- `app/api/og-comparison/route.tsx` — dynamic 1200×630 OG image.
- `app/sitemap.ts` — Next-generated, includes core + scenarios + compare URLs.
- `src/components/SEO/SchemaMarkup.tsx` — reusable JSON-LD.
- `src/components/landing/TakeHomeComparisonStrip.tsx` — live comparison strip embedded in every calculator page.
- `src/components/landing/CookieBanner.tsx`.

### Chrome, analytics, ads

- `src/components/{Header,SiteFooter,layout/AppShell,theme-provider,theme-toggle}.tsx`.
- `src/components/ads/{AdSenseScript,AdSenseAd,consent}.{tsx,ts}` + `public/ads.txt`.
- Plausible auto-loaded with UTM auto-attach; `plausible("cta_click", …)` fired on landing CTA.
- `public/robots.txt` (needs env-var fix — see below).

### Content pages

- `/`, `/calc`, `/about`, `/contracting`, `/privacy`.

## Partially Implemented

| Item | Gap |
|---|---|
| `robots.txt` | Hard-codes `yourdomain.com`; also no Next-generated `app/robots.ts` |
| Percentile | Exists as a *tab* in the calculator (`WealthPercentileTab`); no first-class `/salary-percentile` URL for SEO/sharing |
| Salary-specific SEO | Day-rate slugs at `/compare/[slug]` and regime scenarios at `/calc/[scenario]` are excellent — but annual-salary intent (`£50k after tax`, `£100k salary UK`) is not covered |
| Newsletter | Was intentionally removed (`chore: remove all email / signup / feedback surfaces (revisit later)`); no boundary exists yet |

## Missing (this sprint adds)

1. **Programmatic annual-salary landing pages** `/salary/[slug]-after-tax` for ~60 curated salaries (£18k–£150k). Uses the existing `calcPayeMonthly` engine — no new engine is added.
2. **`/100k-tax-trap`** — flagship educational + shareable experience. Uses existing engine.
3. **`/pay-rise`** — pay-rise breakdown with query-param inputs. Uses existing engine.
4. **`/salary-percentile`** — SEO-friendly URL that renders the existing percentile module directly (not just as a tab).
5. **`app/robots.ts`** — env-aware.
6. **`app/sitemap.ts`** — extended to include the new salary + percentile + 100k-trap + pay-rise routes.
7. **Per-salary dynamic OG images** for the new salary pages.
8. **`docs/growth/`** — `current-state-audit.md` (this file), `seo-audit.md`, `analytics-spec.md`, `growth-backlog.md`, `manual-actions.md`, `launch-checklist.md`.
9. **`content/marketing/30-day-launch-calendar.ts`** — deterministic dataset that consumes existing insights.
10. **Newsletter boundary stub** — clean API boundary + component; no ESP wiring (deferred as before).

## Technical Debt Affecting Growth

| Item | Impact | Note |
|---|---|---|
| `public/robots.txt` contains literal `yourdomain.com` | Medium | Replaced by env-aware `app/robots.ts`; the static file will be removed to avoid a duplicate. |
| `NEXT_PUBLIC_SITE_URL` fallback is `yourdomain.com` everywhere | Medium | Every URL builder must fall back to a real URL in production; documented in `manual-actions.md`. |
| `tsconfig.paths` maps `@/*` to `src/*`, but `app/` uses relative imports (e.g. `../../lib/taxYear`) | Low | Left as-is; matches existing conventions. |

## SEO Risks

- Sitemap contains 6 canonical `/compare/[slug]` entries but the URL parser accepts many more shapes. Currently self-limited, low risk.
- No IndexNow ping on deploy; low risk for launch.

## Analytics Gaps

- Plausible fires `cta_click` at the landing hero but no coverage for `share_clicked`, `comparison_completed`, `percentile_viewed`, or salary-page navigations. This sprint adds analytics dispatch inside the new pages via the same Plausible surface.

## Growth Opportunities (highest leverage first)

1. Programmatic annual-salary pages (this sprint).
2. Flagship `/100k-tax-trap` (this sprint).
3. `/pay-rise` acquisition page (this sprint).
4. Standalone percentile URL (this sprint).
5. 30-day marketing calendar consuming the existing landing-comparison + PAYE engines (this sprint).
6. Umbrella / IR35 per-day-rate landings extension (already scaffolded — future sprint).

## Recommended Execution Order

1. `app/robots.ts` + retire hardcoded `public/robots.txt`.
2. `/salary/[slug]-after-tax` route, catalog, per-salary OG image, cross-links from `/calc` scenarios.
3. `/100k-tax-trap` + share bar.
4. `/pay-rise` + share bar.
5. `/salary-percentile` (renders `WealthPercentileTab` in standalone SEO wrapper).
6. Extend `app/sitemap.ts`.
7. `content/marketing/30-day-launch-calendar.ts` (deterministic).
8. Growth documentation.
9. Newsletter boundary (stub only — no ESP creds).
