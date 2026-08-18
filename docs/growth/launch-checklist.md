# 7‑Day Owner Launch Plan

A concrete, ordered checklist for the seven days following deployment. Every
item is a *thing the owner does*, not code work.

## Day 0 — Deploy

- Merge PR, deploy to production.
- Smoke test: `/`, `/calculator`, `/salary/50000-after-tax`,
  `/100k-tax-trap`, `/salary-percentile`, `/pay-rise?from=50000&to=60000`,
  `/compare/50000-vs-70000`.
- Confirm `sitemap.xml` and `robots.txt` are served.
- Confirm a fetched `/salary/50000-after-tax` HTML contains the numbers
  before JavaScript executes (view page source).

## Day 1 — Search visibility

- Verify site in **Google Search Console** and **Bing Webmaster Tools**.
- Submit `sitemap.xml` in both.
- Request indexing for the 8 acquisition anchor pages listed in
  `docs/growth/manual-actions.md`.

## Day 2 — Analytics

- Add chosen provider script (Plausible recommended) to `app/layout.tsx`.
- Verify events flow: open `/calculator`, change the salary, confirm
  `calculator_started` and `calculation_completed` appear in the provider
  dashboard.
- Verify shares flow: click Share → LinkedIn on a salary page, confirm
  `share_clicked` appears with `share_platform=linkedin`.

## Day 3 — Social presence

- Register handles: X, LinkedIn, TikTok, Instagram.
- Update `lib/seo/site.ts::SITE_TWITTER` and redeploy.
- Post Day 1 of the marketing calendar
  (`content/marketing/30-day-launch-calendar.ts`) to primary channels.
- Screenshot the OG card of `/salary/50000-after-tax` as evergreen social art.

## Day 4 — Marketing calendar activation

- Import the marketing calendar into an editorial doc (Notion / Airtable /
  a spreadsheet).
- Sanity‑check the top 5 salary pages listed in the calendar. Confirm every
  number quoted in the social scripts matches the live page.
- Approve Days 1–7 for scheduled posting.

## Day 5 — Email capture

- Choose ESP (Resend / Loops / MailerLite).
- Add API key to Vercel env; update `app/api/newsletter/route.ts` to forward
  to the ESP.
- Send test signup from a salary page; confirm delivery and consent posture.

## Day 6 — Guides & content polish

- Review `/methodology` and `/privacy` pages.
- Confirm no page implies regulated financial advice.
- If any percentile figures feel out of date, follow the "Percentile data
  verification" step in `docs/growth/manual-actions.md`.

## Day 7 — Measurement & iteration

- Pull the first week of analytics. Focus on:
  - `salary_page_viewed` per band (which salaries have organic pull?)
  - `share_clicked` by `share_surface` (which page shares best?)
  - `comparison_completed` (are users continuing after their answer?)
  - Search Console impressions (which queries?)
- Pick the highest‑performing acquisition page. Draft one iteration for
  next week — usually a stronger hook, a new comparison, or an additional
  landing salary within the same band.
- File any issues surfaced by real traffic against the P1 backlog.

## Do not, during week 1

- Do not paywall any core calculator functionality.
- Do not chase Lighthouse scores by removing content.
- Do not automate content publishing. The 30‑day calendar is deterministic
  copy; a human still schedules each post.
- Do not add cookie‑based analytics without a consent banner.
- Do not update HMRC constants without a matching entry in
  `lib/tax/constants.ts::changelog`.
