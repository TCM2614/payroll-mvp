# Indexing Priority — First 12 URLs

Use this list to request indexing in Google Search Console and Bing
Webmaster Tools *before* running any paid or organic acquisition. Each
URL is chosen to seed a distinct search-intent cluster; internal
cross-linking from every page then does the heavy lifting.

All URLs are absolute against `https://uktakehomecalculator.com`.

## Priority Order

### 1. `/`

- **Intent**: brand + "UK take home calculator" + landing traffic.
- **Reason**: primary domain entry. Google needs to fetch this first for
  site-wide EAT signals.
- **Internal links to it**: every page's header logo, footer.

### 2. `/calc`

- **Intent**: "salary calculator UK", "UK take-home pay calculator".
- **Reason**: main calculator hub with all four regime tabs; strong
  bounce-rate signal.
- **Internal links to it**: header nav, landing hero CTA.

### 3. `/salary`

- **Intent**: "UK salary after tax", "UK salary explorer".
- **Reason**: index page that funnels crawlers into all 57 salary
  landings; large amount of internal linking.
- **Internal links to it**: landing "Explore common UK salaries" strip,
  every salary page breadcrumb.

### 4. `/salary/30000-after-tax`

- **Intent**: "£30k after tax", "30000 salary UK".
- **Reason**: highest-volume UK salary-after-tax query segment. Near the
  UK median for younger workers.
- **Internal links**: `/salary`, `/pay-rise` popular-scenario chip,
  `/salary/35000-after-tax` (neighbour).

### 5. `/salary/40000-after-tax`

- **Intent**: "£40k after tax UK".
- **Reason**: high-volume salary-band search; anchor for the £40k → £50k
  raise scenario.
- **Internal links**: `/salary`, `/pay-rise?from=40000&to=50000`.

### 6. `/salary/50000-after-tax`

- **Intent**: "£50k salary UK take home", "£50,000 after tax".
- **Reason**: the highest-volume single UK salary search. Also the
  approximate top of the basic-rate band, which makes it psychologically
  sticky. **This is the flagship salary page.**
- **Internal links**: landing hero example, every neighbouring salary
  page, `/pay-rise?from=50000&to=60000`.

### 7. `/salary/60000-after-tax`

- **Intent**: "£60k UK salary after tax".
- **Reason**: entry into higher-rate territory; strong pair with £50k
  for comparison.
- **Internal links**: `/salary/50000-after-tax`, `/pay-rise?from=50000&to=60000`.

### 8. `/salary/70000-after-tax`

- **Intent**: "£70k salary UK", tech/finance salary target.
- **Reason**: high-earning cluster; feeds into the £100k trap narrative.
- **Internal links**: `/salary/60000-after-tax`, `/salary/100000-after-tax`.

### 9. `/salary/100000-after-tax`

- **Intent**: "£100k salary UK take home", "£100k after tax".
- **Reason**: anchor for the £100k tax trap; heavy sharing surface.
- **Internal links**: `/100k-tax-trap`, `/pay-rise?from=100000&to=110000`,
  `/salary/125000-after-tax`.

### 10. `/100k-tax-trap`

- **Intent**: "£100k tax trap", "personal allowance taper", "60% tax UK".
- **Reason**: flagship shareable acquisition asset. Interactive chart.
- **Internal links**: `/salary/100000-after-tax`, `/salary/125000-after-tax`,
  `/pay-rise?from=100000&to=110000`.

### 11. `/pay-rise`

- **Intent**: "pay rise calculator UK", "how much of my raise do I keep".
- **Reason**: natural social hook (share-friendly, high emotional
  salience). URL persists the scenario for shareability.
- **Internal links**: every salary page's pay-rise widget, `/100k-tax-trap`,
  every raise scenario chip on `/pay-rise`.

### 12. `/salary-percentile`

- **Intent**: "UK salary percentile", "how rich am I UK", "top 10% UK
  salary".
- **Reason**: virality asset; leaderboard-style content that people
  compare with peers.
- **Internal links**: every salary page's percentile snippet, `/salary`
  index.

## Submission Notes

- Submit as a single batch in Google Search Console via URL Inspection
  → Request Indexing. Google enforces a per-day quota (~10 URLs) so
  spread across two days if necessary.
- In Bing Webmaster Tools use the URL Submission tool (quotas are more
  generous).
- Do **not** submit any `/compare/[slug]` URLs yet — those already
  cover the day-rate search cluster and will be discovered via the
  sitemap.
- Verify each URL returns a 200 and contains its deterministic figures
  in the initial HTML (view page source) before submitting.
