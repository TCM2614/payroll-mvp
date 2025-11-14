"use client";

import AppShell from "@/components/layout/AppShell";
import { DashboardComingSoon } from "@/components/DashboardComingSoon";

export default function DashboardPreviewPage() {
  return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl">
          <DashboardComingSoon />
        </div>
      </div>
    </AppShell>
  );
}
