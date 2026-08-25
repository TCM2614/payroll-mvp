# Privacy Implementation vs Public Statements

Technical comparison only — not legal advice.

| Privacy statement (pre-fix / claim) | Actual code behaviour | Match? | Required action |
|---|---|---|---|
| Do not collect email / no signup | No signup routes or ESP in current app | Yes | Keep |
| Do not store salary in a database | No application DB; client-side calc | Yes | Keep |
| No marketing cookies / tracking identifiers | AdSense can load after consent; `ads.txt` present | **No** (was) | Privacy page updated to describe AdSense; **OWNER/LEGAL REVIEW** |
| No advertising cookies | Same as above | **No** (was) | Cookie page + privacy updated |
| Analytics: Plausible or GA4 | Plausible hardcoded; GA4 **not** implemented; optional Umami | Partial | Privacy updated — removed GA4 claim |
| Analytics never receive salary | Events use bands; SEO URLs expose salary; Plausible sees page paths | Partial | Documented trade-off on `/pay-rise` and salary pages |
| Essential cookies only for security/performance | Consent key is localStorage, not a cookie; Plausible loads without accept | Partial | Cookie policy updated; analytics legal basis **OWNER/LEGAL REVIEW** |
| Contact channel | None published | Yes | Stated honestly |

## Storage keys

| Key | Mechanism | Contents |
|---|---|---|
| `ukpayroll_cookie_consent` | `localStorage` | `"accepted"` after banner Accept |

No sessionStorage / IndexedDB / first-party cookie usage found for calculator inputs.

## Consent behaviour (post-fix)

- AdSense script: loads only if `hasAcceptedCookieConsent()` is true  
- Storage errors: **fail-closed** (ads do not load)  
- Banner: home page; Accept persists flag; no Reject/Revoke UI yet  
- Plausible: still loads without consent (product/legal decision)

## Shareable salary URLs

`/pay-rise?from=&to=` and `/salary/{n}-after-tax` intentionally expose figures. Acceptable product state for virality/SEO; users should avoid sharing private salaries. Referrer-Policy mitigates some third-party leakage.
