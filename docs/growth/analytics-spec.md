# Analytics Spec — UK Take Home Calculator

The July branch already ships **Plausible** with an `analytics.ts` module and
auto-attaches UTM params. This document catalogues the events that surround
the growth-phase pages and confirms the privacy posture.

## Provider

- **Plausible** — auto-loaded from `layout.tsx`.
- `window.plausible("event_name", { props: { … } })` is the dispatch mechanism.
- `src/lib/analytics.ts` wraps it with `trackEvent(name, props)`.

## Global privacy rules

1. Never dispatch: name, email, tax code, employer, exact loan balance, exact
   pension pot, precise take-home £, precise salary £.
2. Where salary bucketing is valuable, dispatch a band label (e.g. `£50–60k`),
   never a raw number.
3. Client-side only — nothing salary-shaped leaves the browser via server logs.

## Growth events

| Event | Trigger | Properties | Purpose |
|---|---|---|---|
| `cta_click` | Landing CTA + salary/pay-rise/percentile hero CTAs | `cta`, `location` | Top-of-funnel |
| `calculator_started` | User makes the first meaningful input in `TakeHomeCalculator` | `calculator_type`, `region` (band-only) | Baseline engagement |
| `calculation_completed` | Result renders with valid inputs | `calculator_type`, `region`, `salary_band`, `has_student_loan`, `has_pension_contribution` | Engagement depth |
| `salary_page_viewed` | `/salary/{n}-after-tax` viewed | `salary_band` | SEO landing performance |
| `pay_rise_viewed` | `/pay-rise?from&to` viewed | `from_band`, `to_band`, `retained_band` | Discovery quality |
| `tax_trap_viewed` | `/100k-tax-trap` viewed | (none — universal page) | Flagship engagement |
| `percentile_viewed` | `/salary-percentile` or the `WealthPercentileTab` slider settles | `salary_band`, `age_band`, `percentile_bucket` | Virality proxy |
| `share_clicked` | Any Share button pressed (comparison strip / new salary pages) | `share_platform`, `share_surface` | Virality |
| `related_content_clicked` | Cross-links between salary pages, pay-rise and percentile | `destination_slug` | Internal navigation graph |
| `outbound_partner_clicked` | Reserved — currently no partner links | — | Reserved |
| `ad_removal_interest` | Reserved for future £0.99 CTA | `share_surface` | Reserved |

## Salary bands

| Band | Range |
|---|---|
| `<£20k` | 0–19,999 |
| `£20–30k` | 20,000–29,999 |
| `£30–40k` | 30,000–39,999 |
| `£40–50k` | 40,000–49,999 |
| `£50–60k` | 50,000–59,999 |
| `£60–75k` | 60,000–74,999 |
| `£75–100k` | 75,000–99,999 |
| `£100–125k` | 100,000–124,999 |
| `£125–150k` | 125,000–149,999 |
| `£150k+` | ≥150,000 |

## Verification

Load any page with `?debug_analytics=1` (client-side helper — implement if
missing) or open DevTools and set:

```js
window.plausible = (event, opts) => console.info("[plausible]", event, opts?.props);
```

Every event above should appear when the corresponding action fires, with
salary values already bucketed to bands.
