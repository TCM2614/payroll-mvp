"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { formatGBP } from "@/lib/format";

export default function DashboardPreviewPage() {
  // Mock data
  const mockUser = {
    name: "Alex",
    lastCalculation: {
      grossAnnual: 60000,
      takeHomeAnnual: 45320,
      date: "2024-01-15",
    },
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-white">
            UK Take-Home Dashboard – Compare Your Salary Scenarios
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Compare UK take-home pay scenarios for the 2024/25 tax year. Explore different salaries, pension rates and student loan plans to see how they affect your take-home pay. The Periodic tax check feature uses real payslips to highlight potential over-taxation or underpayments during the tax year.
          </p>
        </div>

        {/* Mock user card */}
        <div className="relative rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl">
          {/* Lock overlay */}
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Sign up to unlock analytics and trend tracking
              </h3>
              <p className="text-sm text-white/70 mb-4">
                Get early access to track your take-home, compare roles, and see trends over time.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
              >
                Get Early Access
              </Link>
            </div>
          </div>

          {/* Preview content (blurred behind overlay) */}
          <div className="opacity-30 blur-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">
                Welcome back, {mockUser.name}!
              </h2>
              <p className="text-sm text-white/70">
                Last calculation: {mockUser.lastCalculation.date}
              </p>
            </div>

            {/* Last calculation summary */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6">
              <h3 className="text-sm font-semibold text-white mb-3">
                Last Calculation Summary
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="text-xs text-white/70">Gross Annual</div>
                  <div className="text-lg font-semibold text-white">
                    {formatGBP(mockUser.lastCalculation.grossAnnual)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/70">Take-Home Annual</div>
                  <div className="text-lg font-semibold text-emerald-400">
                    {formatGBP(mockUser.lastCalculation.takeHomeAnnual)}
                  </div>
                </div>
              </div>
            </div>

            {/* Mock chart placeholder */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-6">
              <h3 className="text-sm font-semibold text-white mb-4">
                Take-Home Trend (Last 6 Months)
              </h3>
              <div className="h-48 flex items-end justify-between gap-2">
                {[65, 70, 68, 72, 75, 78].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-500/50 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Mock features */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="text-sm font-semibold text-white mb-1">Analytics</h4>
                <p className="text-xs text-white/70">
                  Track your take-home over time and see trends
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-2xl mb-2">🔄</div>
                <h4 className="text-sm font-semibold text-white mb-1">Compare Roles</h4>
                <p className="text-xs text-white/70">
                  Compare PAYE, Umbrella, and Limited side-by-side
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-2xl mb-2">💾</div>
                <h4 className="text-sm font-semibold text-white mb-1">Save Calculations</h4>
                <p className="text-xs text-white/70">
                  Save and revisit your calculations anytime
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
          >
            Get Early Access
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

