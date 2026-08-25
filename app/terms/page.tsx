import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/siteUrl";
import { TAX_YEAR } from "../lib/taxYear";

export const metadata: Metadata = {
  title: "Terms of Use — UK Take-Home Calculator",
  description:
    "Terms of use for the free UK take-home pay calculator. Estimates only — not tax advice.",
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
};

/**
 * Factual baseline terms.
 * Legal sufficiency: REQUIRES OWNER/LEGAL REVIEW.
 */
export default function TermsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-6 sm:p-8 shadow-soft-xl backdrop-blur space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
            Terms of use
          </h1>
          <p className="mt-2 text-xs text-brand-textMuted">
            Baseline technical terms describing how the free calculator works.
            This page is not a substitute for solicitor-drafted terms —{" "}
            <strong>REQUIRES OWNER/LEGAL REVIEW</strong>.
          </p>
        </div>

        <div className="space-y-5 text-sm text-brand-textMuted">
          <div>
            <h2 className="text-lg font-semibold text-brand-text mb-2">
              1. Service
            </h2>
            <p>
              UK Take-Home Calculator provides free, automated estimates of UK
              take-home pay for the {TAX_YEAR} tax year (and related educational
              pages). Calculations are produced by deterministic software rules
              in your browser or on our servers for shared preview images. They
              are <strong className="font-medium text-brand-text">estimates</strong>,
              not personalised tax, accounting, or legal advice.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-brand-text mb-2">
              2. No professional advice
            </h2>
            <p>
              Do not rely solely on this site for filing, payroll decisions,
              IR35 status, company structuring, or student-loan repayment
              planning. Confirm figures with HMRC guidance or a qualified
              adviser where accuracy matters.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-brand-text mb-2">
              3. Acceptable use
            </h2>
            <p>
              You may use the public pages and calculators for personal or
              internal business evaluation. You must not attempt to disrupt the
              service, overload edge image endpoints, scrape in a way that
              degrades availability, or misuse advertising inventory.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-brand-text mb-2">
              4. Availability &amp; changes
            </h2>
            <p>
              The service is provided as-is without uptime guarantees. Features,
              tax-year assumptions, and pages may change without notice as UK
              rules and the product evolve.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-brand-text mb-2">
              5. Privacy
            </h2>
            <p>
              See the{" "}
              <Link href="/privacy" className="underline text-brand-text">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/cookies" className="underline text-brand-text">
                Cookie &amp; storage policy
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-brand-text mb-2">
              6. Contact
            </h2>
            <p>
              A public contact channel is not currently published. When one is
              added, these terms will be updated.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
