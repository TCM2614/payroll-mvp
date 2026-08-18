# Growth Backlog

Items sequenced by priority. P0 = launch‑blocking, P3 = later strategic.

## P0 — Ship this sprint (done)

- [x] Deterministic UK tax engine (Income Tax, NI, student loans, pension
  sacrifice, dividends, Umbrella, LtdCo outside IR35).
- [x] Regression tests around the 2025/26 constants and PA taper cliff.
- [x] Programmatic `/salary/[slug]-after-tax` pages with ~85 curated salaries.
- [x] `/100k-tax-trap`, `/pay-rise`, `/compare/[a-vs-b]`, `/salary-percentile`.
- [x] Site metadata, canonicals, structured data, sitemap, robots.
- [x] Dynamic OG image cards per salary page + site level.
- [x] Privacy‑conscious analytics abstraction with salary banding.
- [x] Newsletter capture stub + hashed audit logging.
- [x] 30‑day marketing calendar dataset consuming deterministic insights.
- [x] Methodology + Privacy pages.

## P1 — Next sprint

- [ ] **Umbrella / IR35 calculator surface.** Engine already supports the
  math; needs a dedicated `/contractor/umbrella-vs-ltd` page with side‑by‑
  side comparison and share cards.
- [ ] **Hourly / bonus / month‑to‑annual calculators** as intent‑specific
  landing surfaces (same engine, distinct SEO copy):
  - `/hourly-salary-calculator`
  - `/monthly-salary-calculator`
  - `/bonus-tax-calculator`
- [ ] **Pension salary sacrifice explainer** — long‑tail keyword hit; already
  supported by engine, needs an educational page pointing at calculator.
- [ ] **Region‑specific pages** (Scotland vs rUK, potentially Wales when WRIT
  diverges). `Region` is already first‑class in the engine.
- [ ] **Interactive chart** on `/100k-tax-trap` using `recharts` (already in
  deps) — marginal‑rate curve overlaid on take‑home curve.
- [ ] **Shareable calculation URLs**: expose the `encodeShareState` output as
  a copy‑link button on the main calculator.

## P2 — After acquisition traction

- [ ] **Guides hub** `/guides/…` — evergreen, non‑time‑sensitive UK personal
  income explainers, linked from salary pages.
- [ ] **Percentile refresh script** that regenerates
  `lib/content/percentile-data.ts` from a checked‑in CSV of ONS/HMRC data,
  so future data refreshes are a one‑line PR.
- [ ] **A/B test harness** for CTA copy on salary pages (e.g. “See any
  raise” vs “Compare against contracting”).
- [ ] **Sitemap segmentation** by section once the URL count exceeds 5k
  (currently 200+ URLs).
- [ ] **Sitewide search** across salary catalogue.

## P3 — Monetisation & later strategic

- [ ] **£0.99 “Remove ads”** proposition — wire `ad_removal_interest` event,
  lightweight Stripe Payment Element. Maximum consumer price £0.99.
- [ ] **Employer‑branded landing surfaces** (only if organic revenue exists
  to justify it).
- [ ] **Newsletter → drip** using deterministic insights (e.g. day‑7 email
  auto‑renders a personalised salary card from the reader’s original band).
- [ ] **Public API** for the calculator, once we can support it.

## Architectural bets we protected

- The tax engine is a pure function. Every acquisition surface, share card
  and marketing asset consumes its output. Do not create parallel calculators.
- Salary bucketing is the only allowed transmission of financial data.
- Static generation is preferred for all indexable pages. Dynamic routes are
  used only for shareable inputs.
