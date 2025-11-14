import { ReactNode } from "react";

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

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 sm:px-4 md:px-6 py-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} UK Payroll Take-Home Calculator.</p>
          <div className="flex flex-wrap gap-4">
            <a href="/privacy" className="hover:text-slate-900">
              Privacy Policy
            </a>
            <a href="/cookies" className="hover:text-slate-900">
              Cookie Policy
            </a>
            <a href="/terms" className="hover:text-slate-900">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

