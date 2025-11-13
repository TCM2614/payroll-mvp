"use client";

import DashboardFeedbackForm from "@/components/DashboardFeedbackForm";

export default function DashboardPreviewPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 relative overflow-hidden">
      {/* Background blur / gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-indigo-500/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
      </div>

      {/* Content wrapper */}
      <div className="flex items-center justify-center px-3 py-10 sm:px-4 md:px-6">
        <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md shadow-xl space-y-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-50">
            Dashboard coming soon
          </h1>
          <p className="text-sm text-slate-200/80">
            We&apos;re building a dashboard to let you compare scenarios, track your take-home
            over time and spot tax changes at a glance. Tell us what you&apos;d like to see and
            we&apos;ll use your feedback to shape the roadmap.
          </p>
          <p className="text-[11px] text-slate-400">
            You can already use the calculator tabs to explore Standard PAYE, Umbrella,
            Limited and Periodic analysis. The dashboard will bring these together into a
            single, visual view.
          </p>

          <DashboardFeedbackForm variant="dark" showLinkToCalculator={true} />
        </section>
      </div>
    </main>
  );
}
