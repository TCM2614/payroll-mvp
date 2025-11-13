"use client";

import AppShell from "@/components/layout/AppShell";
import DashboardFeedbackForm from "@/components/DashboardFeedbackForm";

export default function DashboardPreviewPage() {
  return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <section className="w-full max-w-xl rounded-2xl border border-sea-jet-700/30 bg-sea-jet-900/60 p-8 shadow-xl shadow-navy-900/50 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-navy-50 sm:text-4xl">
            Dashboard coming soon
          </h1>
          <p className="text-sm text-navy-200">
            We&apos;re building a dashboard to let you compare scenarios, track your take-home
            over time and spot tax changes at a glance. Tell us what you&apos;d like to see and
            we&apos;ll use your feedback to shape the roadmap.
          </p>
          <p className="text-xs text-navy-300">
            You can already use the calculator tabs to explore Standard PAYE, Umbrella,
            Limited and Periodic analysis. The dashboard will bring these together into a
            single, visual view.
          </p>

          <DashboardFeedbackForm variant="dark" showLinkToCalculator={true} />
        </section>
      </div>
    </AppShell>
  );
}
