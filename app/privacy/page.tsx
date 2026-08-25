import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "Privacy Policy — UK Take-Home Calculator",
  description:
    "How UK Take-Home Calculator handles calculator inputs, analytics, advertising consent and third-party scripts.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

/**
 * Privacy policy — factual technical description of current behaviour.
 * Several statements remain marked REQUIRES OWNER/LEGAL REVIEW.
 */
export default function PrivacyPage() {
  const currentDate = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-6 sm:p-8 shadow-soft-xl backdrop-blur space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-brand-textMuted">
            Last updated: {currentDate}
          </p>
          <p className="mt-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            This page describes implemented technical behaviour. Formal GDPR /
            PECR compliance wording{" "}
            <strong>REQUIRES OWNER/LEGAL REVIEW</strong> before treating this
            as a final legal document.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              Introduction
            </h2>
            <p className="text-sm text-brand-textMuted">
              UK Take-Home Calculator (&quot;we&quot;, &quot;our&quot;,
              &quot;us&quot;) provides a free UK take-home pay estimator. We
              design the product so that salary and tax inputs are processed for
              the immediate calculation and are not stored in an application
              database. We do not operate user accounts.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              1. What we do not collect
            </h2>
            <ul className="space-y-1 text-sm text-brand-textMuted">
              <li>• Name or account profile</li>
              <li>• Email address (no newsletter or signup is currently wired)</li>
              <li>• National Insurance number</li>
              <li>• A server-side database of your salary calculations</li>
            </ul>
            <p className="mt-3 text-sm text-brand-textMuted">
              Interactive calculator inputs are processed in your browser. Some
              public marketing pages and share-image endpoints compute figures
              from URL parameters or curated catalogues using the same
              deterministic engines — those parameters are not retained as user
              profiles.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              2. Analytics
            </h2>
            <p className="text-sm text-brand-textMuted">
              We use <strong className="font-medium text-brand-text">Plausible</strong>{" "}
              (privacy-oriented analytics). The site operator may optionally
              enable <strong className="font-medium text-brand-text">Umami</strong>.
              We do <strong className="font-medium text-brand-text">not</strong>{" "}
              currently load Google Analytics 4.
            </p>
            <p className="mt-2 text-sm text-brand-textMuted">
              Custom events are designed to send coarse salary{" "}
              <em>bands</em> (for example &lt;30k, 30–60k) rather than exact
              user-entered salaries. Public SEO pages already expose salary
              figures in the URL (for example{" "}
              <code className="text-brand-text">/salary/50000-after-tax</code>
              ); analytics may record the page path.
            </p>
            <p className="mt-2 text-xs text-brand-textMuted">
              Classification of analytics as essential vs optional under PECR —{" "}
              <strong>REQUIRES OWNER/LEGAL REVIEW</strong>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              3. Advertising
            </h2>
            <p className="text-sm text-brand-textMuted">
              When configured, <strong className="font-medium text-brand-text">Google AdSense</strong>{" "}
              may display ads. The AdSense script loads only after you accept
              via the on-site consent banner (stored in localStorage). If
              storage cannot be read, advertising scripts do not load.
            </p>
            <p className="mt-2 text-sm text-brand-textMuted">
              Once loaded, Google may set advertising cookies according to
              Google&apos;s policies. See also our{" "}
              <Link href="/cookies" className="underline text-brand-text">
                Cookie &amp; storage policy
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              4. Shareable URLs
            </h2>
            <p className="text-sm text-brand-textMuted">
              Tools such as{" "}
              <code className="text-brand-text">/pay-rise?from=&amp;to=</code>{" "}
              put salary figures in the address bar so results can be shared.
              Anyone with the link can see those numbers. Prefer not to share
              links that reveal salaries you consider private.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              5. Hosting
            </h2>
            <p className="text-sm text-brand-textMuted">
              The site is typically hosted on Vercel (or equivalent). Hosting
              providers process standard technical request logs (for example IP
              addresses, user-agent) under their own terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              6. Your rights
            </h2>
            <p className="text-sm text-brand-textMuted">
              Depending on applicable law you may have rights to access,
              erasure, and objection. Because we do not operate user accounts or
              a salary database, many requests will have limited material to
              act on beyond browser storage you control and third-party
              provider processes.
            </p>
            <p className="mt-2 text-xs text-brand-textMuted">
              Rights wording — <strong>REQUIRES OWNER/LEGAL REVIEW</strong>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              7. Contact
            </h2>
            <p className="text-sm text-brand-textMuted">
              We do not currently publish a contact email. When available, it
              will be listed here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
