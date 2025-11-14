import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Contracting Tools – Compare Structures & Multiple Jobs",
  description: "Compare PAYE, Umbrella and Limited company structures side by side, and model multiple income sources for UK contractors.",
};

export default function ContractingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


