# UTM Conventions

The site already **reads** UTM parameters into Plausible custom props via
`readUtmParams()` in `src/lib/analytics.ts`. Every event fired through
`trackEvent(...)` is automatically enriched with `utm_source`,
`utm_medium`, `utm_campaign`, `utm_content` and `utm_term` when present
in the URL. **You don't need to add UTM plumbing to any component** —
you only need to construct the outbound links correctly.

This document defines the naming rules so that content pillars, days
and platforms can be compared consistently in Plausible.

---

## Parameter reference

| Parameter | Rule | Example |
|---|---|---|
| `utm_source` | Distribution platform, lowercase, one word | `tiktok`, `instagram`, `youtube`, `linkedin`, `x`, `threads`, `reddit`, `email` |
| `utm_medium` | Broad channel bucket | `social`, `email`, `paid_social`, `referral` |
| `utm_campaign` | Content pillar, `snake_case` | `launch_salary_reality`, `launch_pay_rise`, `launch_tax_trap`, `launch_percentile`, `launch_contractor` |
| `utm_content` | Specific asset / day slug | `50k_day1`, `100k_trap_day4`, `50_to_60_day3` |
| `utm_term` | Optional — reserved for paid keyword campaigns only | `uk+salary+calculator` |

Rules:

1. **Lowercase everything.** Plausible treats `X` and `x` as different
   values — that fragments the report.
2. **No spaces, no punctuation.** Use `_` inside a single parameter
   (`launch_pay_rise`), never spaces or hyphens.
3. **Consistent day numbering.** Day slugs use `dayN` (`day1`, `day7`).
4. **One campaign per pillar.** Do not mint per-post campaigns — that
   makes rollups impossible. Distinguish posts with `utm_content`.
5. **Never encode PII** (name, email, salary number).

---

## Canonical values

### `utm_source`

- `tiktok`
- `instagram`
- `reels` (Instagram Reels sub-source, used only when we want to split
  from feed posts)
- `youtube`
- `youtube_short`
- `linkedin`
- `x`
- `threads`
- `reddit`
- `email`
- `newsletter` (once the newsletter is re-introduced)

### `utm_medium`

- `social` — organic post on a social platform.
- `paid_social` — paid post / boost.
- `email` — outbound email.
- `referral` — inbound from another site (rare; usually organic).

### `utm_campaign`

Match one of the five content pillars from
`content/marketing/30-day-launch-calendar.ts`:

- `launch_salary_reality` — deterministic salary breakdown pages.
- `launch_pay_rise` — pay-rise / raise-retention content.
- `launch_tax_trap` — £100k trap content.
- `launch_percentile` — percentile / "where do I rank" content.
- `launch_contractor` — contractor / IR35 / umbrella content.
- `launch_comparison` — side-by-side comparison-strip content.

### `utm_content`

Free-form but constrained. Use the pattern `{salary_or_slug}_{dayN}`:

- `50k_day1`
- `30k_vs_50k_day2`
- `50_to_60_day3`
- `100k_trap_day4`
- `70k_day5`
- `500_a_day_day6`
- `percentile_day7`

---

## Examples

- LinkedIn post about Day 1's £50k breakdown:

  `https://uktakehomecalculator.com/salary/50000-after-tax?utm_source=linkedin&utm_medium=social&utm_campaign=launch_salary_reality&utm_content=50k_day1`

- TikTok reel about the £100k tax trap:

  `https://uktakehomecalculator.com/100k-tax-trap?utm_source=tiktok&utm_medium=social&utm_campaign=launch_tax_trap&utm_content=100k_trap_day4`

- X thread about the salary percentile:

  `https://uktakehomecalculator.com/salary-percentile?utm_source=x&utm_medium=social&utm_campaign=launch_percentile&utm_content=percentile_day7`

- YouTube Short about £500/day contractor comparison:

  `https://uktakehomecalculator.com/compare/500-a-day?utm_source=youtube_short&utm_medium=social&utm_campaign=launch_contractor&utm_content=500_a_day_day6`

- Boosted Instagram post about £70k:

  `https://uktakehomecalculator.com/salary/70000-after-tax?utm_source=instagram&utm_medium=paid_social&utm_campaign=launch_salary_reality&utm_content=70k_day5`

---

## Reporting in Plausible

Plausible ingests these as custom properties automatically. In the
dashboard, filter by `utm_campaign` for a pillar-level view, then break
out by `utm_source` to see which platforms convert. Cross-tab against
the growth events (`salary_page_viewed`, `pay_rise_viewed`,
`tax_trap_viewed`, `percentile_viewed`, `share_clicked`) to see which
combinations move the funnel deepest.

If you find yourself wanting a value not on the canonical lists above,
add it to this file first — the point of the convention is
consistency, not creativity.
