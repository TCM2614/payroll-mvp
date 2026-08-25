import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "Cookie Policy — UK Take-Home Calculator",
  description:
    "Technical description of cookies, local storage, analytics and advertising scripts used by UK Take-Home Calculator.",
  alternates: { canonical: `${SITE_URL}/cookies` },
  robots: { index: true, follow: true },
};

/**
 * Factual technical cookie/storage page.
 * Legal sufficiency: REQUIRES OWNER/LEGAL REVIEW.
 */
export default function CookiesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-6 sm:p-8 shadow-soft-xl backdrop-blur space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
            Cookie &amp; storage policy
          </h1>
          <p className="mt-2 text-xs text-brand-textMuted">
            Technical description of current implementation. Legal wording
            requires owner review before relying on this page as a compliance
            artefact.
          </p>
        </div>

        <div className="space-y-5 text-sm text-brand-textMuted">
          <div>
            <h2 className="text-lg font-semibold text-brand-text mb-2">
              What we store in your browser
            </h2>
            <p>
              The calculator does not set essential first-party cookies for
              authentication or shopping carts. The only first-party storage
              key currently used is:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <code className="text-brand-text">ukpayroll_cookie_consent</code>{" "}
                in <strong className="font-medium text-brand-text">localStorage</strong>{" "}
                — records whether you accepted optional advertising scripts
                (value <code className="text-brand-text">accepted</code>).
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-brand-text mb-2">
              Analytics
            </h2>
            <p>
              Privacy-oriented analytics via{" "}
              <strong className="font-medium text-brand-text">Plausible</strong>{" "}
              may load on every page to measure aggregated traffic. Optional{" "}
              <strong className="font-medium text-brand-text">Umami</strong> may
              load if configured by the site operator. These tools are intended
              to avoid collecting personal salary inputs; calculator analytics
              events send salary <em>bands</em>, not exact figures, for
              user-entered calculations.
            </p>
            <p className="mt-2 text-xs">
              Whether analytics is “essential” under applicable law is a legal
              determination — <strong>REQUIRES OWNER/LEGAL REVIEW</strong>.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-brand-text mb-2">
              Advertising
            </h2>
            <p>
              If Google AdSense is configured (
              <code className="text-brand-text">NEXT_PUBLIC_ADSENSE_CLIENT_ID</code>
              ), its script loads only after you accept via the cookie banner.
              If browser storage cannot be read, advertising scripts do{" "}
              <strong className="font-medium text-brand-text">not</strong> load
              (fail-closed). AdSense may set its own cookies once loaded.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-brand-text mb-2">
              Managing preferences
            </h2>
            <p>
              Clearing site data for this domain removes the consent flag.
              There is currently no in-product “Reject” or “Revoke” control —
              adding one is tracked as a product improvement.
            </p>
            <p className="mt-2">
              See also the{" "}
              <Link href="/privacy" className="underline text-brand-text">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
