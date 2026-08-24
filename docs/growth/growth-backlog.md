# Growth Backlog

## P0 — Shipped this sprint

- [x] `/salary/[slug]-after-tax` programmatic landing pages (57 pages, £18k–£150k).
- [x] `/100k-tax-trap` flagship shareable experience.
- [x] `/pay-rise?from=X&to=Y` acquisition surface.
- [x] `/salary-percentile` first-class SEO URL for the existing `WealthPercentileTab`.
- [x] `/api/og-salary` dynamic per-salary OG cards.
- [x] `app/robots.ts` env-aware (replaces `public/robots.txt`).
- [x] `app/sitemap.ts` extended with new routes.
- [x] `src/lib/marketing/{salaryCatalog,salaryInsight}.ts` — deterministic wrappers over the *existing* `calcPAYECombined` engine.
- [x] 7 new vitest specs for the salary-insight helper.
- [x] `content/marketing/30-day-launch-calendar.ts` — 30 days × ~7 platform assets each, all values sourced from the tax engine.
- [x] Growth documentation set.

## P1 — Next sprint

- [ ] **Analytics coverage** — wire `salary_page_viewed`, `pay_rise_viewed`, `tax_trap_viewed`, `percentile_viewed`, `share_clicked` on the new pages via the existing `trackEvent` from `@/lib/analytics`. (The July branch already exposes the helper; the new pages don't fire events yet.)
- [ ] **Share bar on new acquisition pages** — the July branch already has share links elsewhere; wire a shared `<ShareBar>` onto `/salary/[slug]`, `/pay-rise`, `/100k-tax-trap`, `/salary-percentile`.
- [ ] **Interactive £100k trap chart** — recharts is already in `deps` and used in `DeductionsChart` and `WealthPercentileTab`. Overlay the marginal-rate curve on the take-home curve.
- [ ] **Salary-scoped analytics events** — extend `trackEvent` calls inside `TakeHomeCalculator` when it's rendered inside a `/salary/[slug]` page to attach a `salary_page` surface.
- [ ] **Pension-sacrifice explainer page** — the engine supports it; needs an educational landing surface.
- [ ] **Region-specific salary pages** — the engine already supports Scottish rates via tax code; `/salary/[slug]-after-tax/scotland` could be a future variant.
- [ ] **Extend `CANONICAL_COMPARE_SLUGS`** — currently 12 canonical day-rate slugs; add £700/day, £800/day, £70/hour, £100/hour, £10,000/month.

## P2 — After acquisition traction

- [ ] **Guides hub** `/guides/…` — evergreen UK personal-income explainers, linked from salary pages.
- [ ] **Percentile refresh script** that regenerates `src/data/incomePercentilesByAge.ts` from a CSV of ONS/HMRC data.
- [ ] **A/B test harness** for CTA copy on salary pages.
- [ ] **Sitemap segmentation** by section once URL count exceeds 5k.
- [ ] **Sitewide search** across salary catalog and scenarios.

## P3 — Monetisation & later strategic

- [ ] **£0.99 “Remove ads”** proposition — wire `ad_removal_interest` event, lightweight Stripe Payment Element. Maximum consumer price £0.99.
- [ ] **Newsletter re-introduction** — email surfaces were removed on the July branch with an explicit "revisit later" note. When reintroduced, keep the boundary at `/api/newsletter` (ESP-agnostic) and hash email server-side.
- [ ] **Employer-branded landing surfaces**.
- [ ] **Public API** for the calculator.

## Architectural bets we protected

- All new acquisition pages consume `calcPAYECombined` via `buildSalaryInsight` — no parallel tax engine.
- Salary bucketing is the only allowed transmission of financial data.
- Static generation is preferred for all indexable pages.
