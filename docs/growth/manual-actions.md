# Manual Actions Required

Items that require the website owner (not the codebase) to complete. Ordered
roughly by priority.

## Deployment / DNS

- [ ] Deploy the branch to the production Vercel project.
- [ ] Ensure `uktakehomecalculator.com` and `www.uktakehomecalculator.com` both
  serve the app and redirect to the canonical (`https://uktakehomecalculator.com`).
- [ ] Confirm HTTPS is enforced and HSTS is set at the edge.

## Search visibility

- [ ] Verify domain in **Google Search Console** and submit
  `https://uktakehomecalculator.com/sitemap.xml`.
- [ ] Verify domain in **Bing Webmaster Tools** and submit the same sitemap.
- [ ] After first index pass, request indexing for the key acquisition pages:
  - `/`
  - `/calculator`
  - `/salary/50000-after-tax`
  - `/salary/70000-after-tax`
  - `/salary/100000-after-tax`
  - `/100k-tax-trap`
  - `/salary-percentile`
  - `/pay-rise`

## Analytics

- [ ] Choose an analytics provider. Recommended: **Plausible** (privacy‑
  friendly, GDPR‑compliant, no cookie banner required) or **PostHog** (deeper
  funnels).
- [ ] Add the provider script to `app/layout.tsx` (before `<body>`) so
  `window.plausible` / `window.gtag` becomes available. `lib/analytics/index.ts`
  will automatically pick it up.
- [ ] If a cookie‑based provider is used (e.g. GA4), add a consent banner and
  gate the script behind consent.

## Social

- [ ] Register `@uktakehomecalc` on X / LinkedIn / TikTok / Instagram (or
  chosen handles) and update `lib/seo/site.ts::SITE_TWITTER`.
- [ ] Populate profiles with a static hero image (source: OG card at
  `/opengraph-image` in production).

## Email

- [ ] Choose an ESP: **Resend**, **Loops**, **MailerLite** or similar.
- [ ] Add the provider secret (`RESEND_API_KEY` / `LOOPS_API_KEY` / etc.) to
  the Vercel project.
- [ ] Update `app/api/newsletter/route.ts` to forward `email` and `source` to
  the ESP. Retain the SHA‑256 audit log.
- [ ] Add double‑opt‑in confirmation copy to the signup UI when required by
  jurisdiction.

## Percentile data verification

- [ ] Confirm the percentile table in `lib/content/percentile-data.ts` against
  the most recent HMRC **Survey of Personal Incomes** and ONS **ASHE**
  releases. Update `SOURCE_YEAR` on the percentile page when refreshed.

## Legal / compliance

- [ ] Have the `/methodology` and `/privacy` pages reviewed for compliance
  (ICO, financial‑promotion posture).
- [ ] Confirm no page presents deterministic tax calculations as regulated
  financial advice.
- [ ] Add a contact address to the footer once available.

## Optional performance polish

- [ ] Remove the unused `next.svg`, `vercel.svg`, `file.svg`, `globe.svg`,
  `window.svg` files from `public/` if not repurposed.
- [ ] If `recharts` remains unused after the next sprint, remove from
  `package.json`.

## When the £0.99 “remove ads” proposition ships

- [ ] Enable `ad_removal_interest` event handling and wire it to a lightweight
  payment provider (Stripe Payment Element or similar).
- [ ] Do not exceed £0.99 per the product constraint.
