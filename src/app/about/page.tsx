export default function AboutPage() {
  return (
    <div className="space-y-6">
      {/* About Section */}
      <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-6 sm:p-8 shadow-soft-xl backdrop-blur space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          About UK Take-Home Calculator
        </h1>
        <p className="text-sm leading-relaxed text-brand-textMuted">
          UK Take-Home Calculator is a high-accuracy salary after-tax tool built for UK
          employees, contractors and freelancers. Our mission is simple: give everyone a
          fast, trustworthy and transparent understanding of their real take-home pay —
          across PAYE, National Insurance, pensions, student loans and all UK tax-year
          rules.
        </p>
        <p className="text-sm leading-relaxed text-brand-textMuted">
          Whether you&apos;re an employee, umbrella worker or limited company contractor,
          our calculation engine models your income with HMRC-aligned accuracy and instant
          results.
        </p>
      </section>

      {/* Value Proposition */}
      <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-6 sm:p-8 shadow-soft-xl backdrop-blur space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
          Our Value Proposition
        </h2>
        <p className="text-sm leading-relaxed text-brand-textMuted">
          UK Take-Home Calculator delivers fast, accurate and transparent salary insights
          across every pay period you care about. The engine converts any salary, daily
          rate, or hourly rate into annual, monthly, weekly, daily and hourly take-home —
          with all deductions applied automatically.
        </p>
      </section>

      {/* Full Multi-Period Take-Home Output */}
      <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-6 sm:p-8 shadow-soft-xl backdrop-blur space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
          Full Multi-Period Take-Home Output
        </h2>
        <p className="text-sm leading-relaxed text-brand-textMuted">
          We generate real-time breakdowns for:
        </p>
        <ul className="space-y-3 text-sm text-brand-textMuted">
          <li className="flex items-start gap-3">
            <span className="text-brand-primary mt-0.5">•</span>
            <div>
              <strong className="text-brand-text">Annual take-home</strong>
              <p className="mt-1">
                After PAYE, NI, pensions and student loans.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-primary mt-0.5">•</span>
            <div>
              <strong className="text-brand-text">Monthly take-home</strong>
              <p className="mt-1">Ideal for budgeting and comparing offers.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-primary mt-0.5">•</span>
            <div>
              <strong className="text-brand-text">Weekly take-home</strong>
              <p className="mt-1">
                Helpful for part-time work, shift roles and umbrella contracting.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-primary mt-0.5">•</span>
            <div>
              <strong className="text-brand-text">Daily rate → take-home</strong>
              <p className="mt-1">
                Contractor-friendly daily modelling using annualised tax rules.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-primary mt-0.5">•</span>
            <div>
              <strong className="text-brand-text">Hourly take-home</strong>
              <p className="mt-1">
                Useful for flexible workers, zero-hours contracts and hourly-rate
                comparisons.
              </p>
            </div>
          </li>
        </ul>
        <p className="text-xs text-brand-textMuted">
          These calculations use versioned HMRC datasets to ensure reliable,
          tax-year-over-tax-year consistency.
        </p>
      </section>

      {/* Why Period Calculations Matter */}
      <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-6 sm:p-8 shadow-soft-xl backdrop-blur space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
          Why Period Calculations Matter
        </h2>
        <p className="text-sm leading-relaxed text-brand-textMuted">
          Understanding income at different periods gives you immediate clarity and
          decision-making power when:
        </p>
        <ul className="space-y-2 text-sm text-brand-textMuted">
          <li className="flex items-start gap-3">
            <span className="text-brand-accent mt-0.5">✓</span>
            <span>Comparing PAYE vs Umbrella vs Limited</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-accent mt-0.5">✓</span>
            <span>Evaluating job offers</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-accent mt-0.5">✓</span>
            <span>Budgeting weekly or monthly</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-accent mt-0.5">✓</span>
            <span>Forecasting contracting income</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-accent mt-0.5">✓</span>
            <span>Estimating short-term contract profitability</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand-accent mt-0.5">✓</span>
            <span>Managing multiple income sources</span>
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-brand-textMuted">
          This makes UK Take-Home Calculator more than a payroll tool — it&apos;s a
          financial decision engine.
        </p>
      </section>

      {/* What Makes Us Different */}
      <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-6 sm:p-8 shadow-soft-xl backdrop-blur space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
          What Makes Us Different
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-brand-text mb-2">
              1. Precision Based on HMRC Rules
            </h3>
            <p className="text-sm text-brand-textMuted">
              Every calculation is tested against golden-record datasets and aligned with
              official tax-year specifications.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-brand-text mb-2">
              2. Designed for Speed
            </h3>
            <p className="text-sm text-brand-textMuted">
              The entire platform is built on a modern, serverless, high-performance stack
              for &lt;30ms calculations.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-brand-text mb-2">
              3. No Tracking, No Storage, No Accounts
            </h3>
            <p className="text-sm text-brand-textMuted">
              Your inputs are calculated instantly and anonymously. We do not store any
              salary, tax, or personal data.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-brand-text mb-2">
              4. Works for All Employment Types
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-brand-textMuted">
              <li>• Employees (full-time &amp; part-time)</li>
              <li>• Umbrella workers</li>
              <li>• Limited company contractors</li>
              <li>• Daily-rate and hourly-rate freelancers</li>
              <li>• Multi-role or multi-income scenarios</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-6 sm:p-8 shadow-soft-xl backdrop-blur space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
          Our Vision
        </h2>
        <p className="text-sm leading-relaxed text-brand-textMuted">
          We aim to be the UK&apos;s most accurate and transparent take-home pay platform —
          supporting everything from simple PAYE checks to multi-scenario comparisons and
          long-term income forecasting.
        </p>
      </section>

      {/* Privacy Policy Link */}
      <section className="rounded-3xl border border-brand-border/60 bg-brand-surface/80 p-6 sm:p-8 shadow-soft-xl backdrop-blur space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
          Privacy Policy
        </h2>
        <p className="text-sm leading-relaxed text-brand-textMuted">
          We protect your privacy by design. Our GDPR-compliant privacy policy explains
          how we process anonymous data, ensure secure calculations, and comply with GDPR
          and UK data protection laws.
        </p>
        <p className="text-sm text-brand-textMuted">
          <a
            href="/privacy"
            className="font-medium text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            Read our full Privacy Policy →
          </a>
        </p>
      </section>
    </div>
  );
}

