import { ReactNode } from "react";

import MainHeader from "./MainHeader";



interface AppShellProps {

  children: ReactNode;

}



export default function AppShell({ children }: AppShellProps) {

  return (

    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-zinc-900 text-white">

      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.12),_transparent_55%)]" />



      <MainHeader />



      <main className="mx-auto max-w-6xl px-4 pt-12 pb-24">

        {children}

      </main>



      {/* Footer */}

      <footer className="border-t border-white/10 bg-black/60">

        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">

          <p>© {new Date().getFullYear()} UK Payroll Take-Home Calculator.</p>

          <div className="flex flex-wrap gap-4">

            <a href="/privacy" className="hover:text-white">

              Privacy Policy

            </a>

            <a href="/cookies" className="hover:text-white">

              Cookie Policy

            </a>

            <a href="/terms" className="hover:text-white">

              Terms

            </a>

          </div>

        </div>

      </footer>

    </div>

  );

}

