# Manual Actions Required

Items the site owner completes outside the codebase. Ordered by priority.

## Deployment / DNS

- [ ] Confirm the Vercel project deploys this branch to a preview URL and validate all new routes render correctly.
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://uktakehomecalculator.com` in the Vercel project (production and preview environments). Every URL builder in the codebase falls back to `yourdomain.com` when this env var is missing — production must set it.
- [ ] Ensure `uktakehomecalculator.com` and `www.uktakehomecalculator.com` both serve and redirect to canonical `https://uktakehomecalculator.com`.

## Search visibility

- [ ] Verify domain in Google Search Console and submit `https://uktakehomecalculator.com/sitemap.xml`.
- [ ] Verify domain in Bing Webmaster Tools and submit the same sitemap.
- [ ] Request indexing for the highest-priority new pages:
  - `/salary/30000-after-tax`
  - `/salary/40000-after-tax`
  - `/salary/50000-after-tax`
  - `/salary/70000-after-tax`
  - `/salary/100000-after-tax`
  - `/100k-tax-trap`
  - `/pay-rise`
  - `/salary-percentile`

## Analytics

- Plausible is already loaded on all pages via `layout.tsx`.
- [ ] Verify the new events in the Plausible dashboard once the P1 backlog wires them: `salary_page_viewed`, `pay_rise_viewed`, `tax_trap_viewed`, `percentile_viewed`, `share_clicked`.

## OG images

- The `/api/og-salary?salary=…` route works at the edge with `Response`
  caching. Optionally warm the cache for the top 20 salaries after the first
  deploy so social bots always hit a warm image:

  ```bash
  for s in 25000 30000 35000 40000 45000 50000 55000 60000 65000 70000 75000 80000 90000 100000 110000 125000 130000 140000 150000; do
    curl -sSI "https://uktakehomecalculator.com/api/og-salary?salary=$s" > /dev/null
  done
  ```

## Percentile data verification

- [ ] Confirm `src/data/incomePercentilesByAge.ts` still aligns with the most
  recent HMRC Survey of Personal Incomes and ONS ASHE releases.
- [ ] Update the source year in `docs/growth/analytics-spec.md` and on the
  `/salary-percentile` methodology block if the dataset refreshes.

## Legal / compliance

- [ ] Confirm no new page presents deterministic tax calculations as regulated
  financial advice. The pages carry a "Not financial advice" line.

## When re-introducing the newsletter

- [ ] Choose an ESP (Resend / Loops / MailerLite).
- [ ] Add secret to Vercel.
- [ ] Add `/api/newsletter` route (POST) that hashes email server-side before
  forwarding to the ESP.
- [ ] Add double-opt-in copy where required by jurisdiction.

## When shipping the £0.99 “Remove ads” proposition

- [ ] Do not exceed £0.99 per the product constraint.
- [ ] Enable `ad_removal_interest` event handling and wire to a lightweight
  Stripe Payment Element or similar.
