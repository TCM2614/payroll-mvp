import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy — UK Take Home Calculator",
  description: "How UK Take Home Calculator handles your data. Client‑side calculations, no salary storage, privacy‑conscious analytics.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-4 py-10 dark:prose-invert">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }]} />
      <h1 className="text-3xl font-bold">Privacy</h1>
      <p>
        UK Take Home Calculator is designed to be private by default. Salary
        calculations run in your browser. We never require you to sign in, and
        we never persist your salary, tax code, employer, student loan balance
        or pension pot on our servers.
      </p>
      <h2 className="mt-6 text-2xl font-semibold">What we measure</h2>
      <p>
        To improve the product we collect coarse, anonymous analytics: which
        pages are viewed, whether a calculation completed, whether a result was
        shared. Salary values are always bucketed (e.g. “£40–50k”) before any
        analytics event leaves your browser. We never transmit your exact
        salary or personally identifying financial information.
      </p>
      <h2 className="mt-6 text-2xl font-semibold">Cookies</h2>
      <p>
        The core calculator does not set any tracking cookies. Optional
        analytics may set a single anonymous identifier for aggregate usage
        metrics.
      </p>
      <h2 className="mt-6 text-2xl font-semibold">Sharing</h2>
      <p>
        Shareable calculator URLs only encode the public inputs required to
        reproduce a calculation (gross pay, region, pension %, student loan
        plan). They never include your name, employer or tax code.
      </p>
      <p className="mt-6 text-sm text-zinc-500">
        Questions? Contact us via the address in the site footer.
      </p>
    </article>
  );
}
