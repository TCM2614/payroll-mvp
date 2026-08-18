# Analytics Spec — UK Take Home Calculator

Growth events emitted by the app. This document is the source of truth for
event names, when they fire, what properties travel with them, and the
privacy posture around each.

Analytics is dispatched through `lib/analytics/index.ts`. The dispatcher tries
`window.__ukthc_analytics__` first, then `window.plausible`, then `window.gtag`,
then silently no‑ops. Any property key containing `salary|gross|net|monthly|
weekly|annual` is renamed to `..._band` and bucketed before dispatch — the
raw £ figure never leaves the browser.

## Global rules

- No PII. Never dispatch: name, email, tax code, employer, exact loan balance,
  exact pension pot, precise salary, precise take‑home.
- Salary bands are the atomic unit of segmentation. See `SALARY_BANDS` in
  `lib/analytics/index.ts`.
- Events are additive — new events go here, never rename existing ones.

## Events

| Event | Trigger | Properties | Purpose |
|---|---|---|---|
| `calculator_started` | First interaction with a live calculator | `calculator_type`, `region`, `salary_band` | Baseline top‑of‑funnel engagement |
| `calculation_completed` | Any input change that produces a valid result | `calculator_type`, `region`, `salary_band`, `has_student_loan`, `has_pension_contribution` | Engagement depth |
| `calculator_type_selected` | User switches calculator variant | `calculator_type` | Track which acquisition surfaces resolve to which calculator |
| `salary_page_viewed` | `/salary/{n}-after-tax` viewed | `salary_band`, `region` | SEO landing performance |
| `guide_viewed` | `/methodology`, `/privacy` or guide viewed | `content_slug` | Trust content engagement |
| `comparison_started` | User lands on `/compare/…` or focuses comparison inputs | `comparison_a_band`, `comparison_b_band` | Discovery quality |
| `comparison_completed` | Comparison result rendered with both inputs valid | `comparison_a_band`, `comparison_b_band`, `region` | Discovery quality |
| `percentile_viewed` | Slider settles for ≥750ms on percentile page | `salary_band`, `percentile_bucket` | Virality proxy |
| `related_content_clicked` | Cross‑link on any acquisition surface clicked | `destination_url`, `content_slug` | Internal navigation graph |
| `share_clicked` | Share button pressed | `share_platform`, `share_surface`, `salary_band?` | Virality |
| `share_platform` | Same as `share_clicked` but split for older providers | Same as above | Compatibility |
| `newsletter_signup` | Newsletter form success | `newsletter_source` | Growth loop |
| `returning_user` | Visitor lands on any page after prior calculation (localStorage sentinel) | `salary_band?` | Return loop signal |
| `outbound_partner_clicked` | Any future partner/outbound link click | `destination_url` | Preserved for future — currently no partners |
| `ad_removal_interest` | Future £0.99 “remove ads” CTA clicked | `share_surface` | Reserved. Not yet emitted. |

## Property enums

- `calculator_type`: `paye`, `hourly`, `monthly`, `bonus`, `pay_rise`,
  `umbrella`, `ltd_outside_ir35`, `ltd_inside_ir35`.
- `region`: `england-wales-ni`, `scotland`.
- `salary_band`: `<£20k`, `£20–30k`, `£30–40k`, `£40–50k`, `£50–60k`,
  `£60–75k`, `£75–100k`, `£100–125k`, `£125–150k`, `£150k+`.
- `share_platform`: `copy`, `whatsapp`, `x`, `linkedin`, `facebook`, `email`,
  `native`.
- `share_surface`: `salary_page`, `100k_trap`, `pay_rise`, `comparison`,
  `percentile`, `calculator`.

## Privacy considerations

- All analytics runs client‑side. No server logs of user actions unless an
  operator explicitly wires an ESP endpoint.
- The newsletter endpoint (`app/api/newsletter/route.ts`) hashes email with
  SHA‑256 before writing a structured log; the raw email is not persisted by
  the application.
- Add a cookie/consent banner before switching on a real analytics provider in
  production. That is a manual action — see `docs/growth/manual-actions.md`.

## Verification

To dry‑run the dispatcher without a provider:

```js
window.__ukthc_analytics__ = {
  name: "console",
  track: (event, props) => console.info("[analytics]", event, props),
};
```

Any event fired should now appear in DevTools with salary values already
bucketed to bands.
