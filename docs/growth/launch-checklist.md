# 7-Day Owner Launch Plan

## Day 0 — Deploy

- Merge PR, deploy to production Vercel project.
- Set `NEXT_PUBLIC_SITE_URL` env var to `https://uktakehomecalculator.com`
  in production + preview environments.
- Smoke test:
  - `/`
  - `/calc` and each of `/calc/{paye,umbrella,limited-inside-ir35,limited-outside-ir35}`
  - `/salary` (index)
  - `/salary/30000-after-tax`, `/salary/50000-after-tax`, `/salary/100000-after-tax`
  - `/pay-rise?from=50000&to=60000`
  - `/100k-tax-trap`
  - `/salary-percentile?income=50000`
  - `/compare/500-a-day`
- Confirm `sitemap.xml` and `robots.txt` are served and both contain the
  new routes.

## Day 1 — Search visibility

- Verify site in Google Search Console + Bing Webmaster Tools.
- Submit `sitemap.xml` in both.
- Request indexing for the 8 highest-priority acquisition pages listed in
  `docs/growth/manual-actions.md`.

## Day 2 — Analytics verification

- Open the Plausible dashboard and confirm the existing `cta_click` event
  continues to fire from the landing hero.
- Verify page views for the new routes are recorded.
- (P1 backlog: wire `salary_page_viewed`, `pay_rise_viewed`,
  `tax_trap_viewed`, `percentile_viewed`.)

## Day 3 — Social presence

- Screenshot the OG cards for the top 5 salary pages
  (`/api/og-salary?salary=…`) as evergreen social assets.
- Post Day 1 of the 30-day marketing calendar
  (`content/marketing/30-day-launch-calendar.ts`) to X + LinkedIn.
- If TikTok / Reels / Instagram handles are ready, record Day 1's short-form
  video using the scripted beats.

## Day 4 — Marketing calendar activation

- Import the 30-day calendar into an editorial doc (Notion / Airtable /
  spreadsheet).
- Sanity-check that every £ figure in Day 1–7's copy matches the live salary
  page it links to. (They should — the calendar imports from the same tax
  engine — but do a spot check.)
- Approve Days 1–7 for scheduled posting.

## Day 5 — Share bar + analytics coverage

- (P1) Ship the shared `<ShareBar>` component on all four new acquisition
  pages (`/salary/[slug]`, `/pay-rise`, `/100k-tax-trap`,
  `/salary-percentile`).
- (P1) Wire `share_clicked`, `salary_page_viewed`, `pay_rise_viewed`,
  `tax_trap_viewed`, `percentile_viewed` via `trackEvent`.

## Day 6 — Content polish

- Review `/methodology` (in `/about`), `/privacy` and the "Not financial
  advice" copy on the new pages.
- If any percentile figures feel out of date, follow the "Percentile data
  verification" step in `docs/growth/manual-actions.md`.

## Day 7 — Measurement & iteration

- Pull first-week analytics. Focus on:
  - `salary_page_viewed` per band — which salaries have organic pull?
  - `share_clicked` by `share_surface` — which page shares best?
  - Search Console impressions — which queries?
- Pick the highest-performing acquisition page and draft one iteration for
  next week (stronger hook, additional comparison, or extra landing salary
  in the same band).

## Do not, during week 1

- Do not paywall any core calculator functionality.
- Do not add cookie-based analytics without a consent banner.
- Do not chase Lighthouse scores by removing content.
- Do not automate content publishing. The 30-day calendar is a deterministic
  dataset; a human still schedules each post.
