import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Contracting Tools – Compare Structures & Multiple Jobs",
  description:
    "Compare PAYE, Umbrella and Limited company structures side by side, and model multiple income sources for UK contractors.",
};

export default function ContractingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.20),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(34,197,94,0.18),_transparent_55%)]"
      />
      {children}
    </div>
  );
}


