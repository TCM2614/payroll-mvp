export default function PrivacyPage() {
  const currentDate = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Privacy Policy Section */}
      <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-6 sm:p-8 shadow-soft-xl backdrop-blur space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
            🔐 Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-brand-textMuted">
            SEO &amp; GDPR-Compliant
          </p>
          <p className="mt-2 text-xs text-brand-textMuted">
            Last updated: {currentDate}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              Introduction
            </h2>
            <p className="text-sm text-brand-textMuted">
              At UK Take-Home Calculator (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;),
              we protect your privacy by design. We operate with a simple principle: we
              do not collect, store or profile your personal salary information.
            </p>
            <p className="mt-2 text-sm text-brand-textMuted">
              This policy explains how we process anonymous data, ensure secure
              calculations, and comply with GDPR and UK data protection laws.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              1. What Personal Data We Collect
            </h2>
            <p className="text-sm font-medium text-brand-text mb-2">
              We do NOT collect:
            </p>
            <ul className="space-y-1 text-sm text-brand-textMuted">
              <li>• Name</li>
              <li>• Email address</li>
              <li>• Salary or tax-related inputs</li>
              <li>• National Insurance number</li>
              <li>• IP address tied to personal identity</li>
              <li>• Marketing cookies or tracking identifiers</li>
            </ul>
            <p className="mt-3 text-sm text-brand-textMuted">
              Your inputs are processed locally in your browser or via secure stateless
              serverless functions. They are never persisted.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              2. Anonymous Analytics
            </h2>
            <p className="text-sm text-brand-textMuted">
              To monitor performance, uptime and feature usage, we use anonymised
              analytics tools such as Plausible or GA4 with full IP anonymisation.
            </p>
            <p className="mt-2 text-sm font-medium text-brand-text">
              These tools collect only aggregated, non-personal data, such as:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-brand-textMuted">
              <li>• Page views</li>
              <li>• Device type</li>
              <li>• Browser</li>
              <li>• Region (e.g., &quot;UK&quot;)</li>
            </ul>
            <p className="mt-3 text-sm text-brand-textMuted">
              We never send salary or tax inputs to analytics.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">3. Cookies</h2>
            <p className="text-sm text-brand-textMuted">
              We do not use advertising cookies or profiling technologies. If present,
              essential cookies are used strictly for:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-brand-textMuted">
              <li>• Security</li>
              <li>• Application performance</li>
            </ul>
            <p className="mt-3 text-sm text-brand-textMuted">
              None of these identify you or store personal data.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              4. How Calculations Work
            </h2>
            <p className="text-sm text-brand-textMuted">
              Your salary inputs (annual, monthly, daily rate, hourly rate, pension % etc.)
              are transmitted only for the purpose of the immediate calculation and are not
              stored anywhere.
            </p>
            <p className="mt-2 text-sm font-medium text-brand-text">
              All processing complies with:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-brand-textMuted">
              <li>• GDPR</li>
              <li>• UK Data Protection Act 2018</li>
              <li>• &quot;Privacy by Design&quot; principles</li>
            </ul>
            <p className="mt-3 text-sm text-brand-textMuted">
              Zero retention is our default.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              5. Third-Party Services
            </h2>
            <p className="text-sm text-brand-textMuted">We may use:</p>
            <ul className="mt-2 space-y-1 text-sm text-brand-textMuted">
              <li>• Vercel for hosting and serverless execution</li>
              <li>• Plausible or Google Analytics (anonymised analytics)</li>
            </ul>
            <p className="mt-3 text-sm text-brand-textMuted">
              These services do not receive personal data or salary calculation inputs.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              6. Your Rights
            </h2>
            <p className="text-sm text-brand-textMuted">
              Even though we do not store identifiable data, you retain all rights under
              GDPR, including the right to:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-brand-textMuted">
              <li>• Understand how data is processed</li>
              <li>
                • Request deletion of any logs containing technical or anonymised
                identifiers
              </li>
              <li>• Ask for clarity on how anonymous analytics works</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">
              7. Updates to This Policy
            </h2>
            <p className="text-sm text-brand-textMuted">
              We may update this Privacy Policy to reflect:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-brand-textMuted">
              <li>• New features</li>
              <li>• Infrastructure changes</li>
              <li>• Regulatory updates</li>
            </ul>
            <p className="mt-3 text-sm text-brand-textMuted">
              Any changes will be published on this page.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-brand-text mb-2">8. Contact Us</h2>
            <p className="text-sm text-brand-textMuted">
              For privacy-related questions, contact us at:
            </p>
            <p className="mt-2">
              <a
                href="mailto:privacy@takehomecalculator.uk"
                className="text-sm font-medium text-brand-primary hover:text-brand-primary/80 transition-colors"
              >
                privacy@takehomecalculator.uk
              </a>
            </p>
            <p className="mt-2 text-sm text-brand-textMuted">
              We typically respond within 3–5 working days.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

