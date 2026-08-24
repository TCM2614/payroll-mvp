import { ReactNode } from "react";

import { SiteFooter } from "@/components/SiteFooter";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      {/* Header is now rendered in root layout, so we don't duplicate it here */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-6">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}

