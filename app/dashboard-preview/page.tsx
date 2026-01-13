"use client";

import AppShell from "@/components/layout/AppShell";
import { DashboardComingSoon } from "@/components/DashboardComingSoon";

export default function DashboardPreviewPage() {
  return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-start px-4 pt-20 md:pt-28 pb-8">
        <div className="w-full max-w-5xl">
          <DashboardComingSoon />
        </div>
      </div>
    </AppShell>
  );
}
