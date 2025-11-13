import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UK Take-Home Dashboard – Compare Salary and Tax Scenarios",
  description: "Compare UK take-home pay scenarios for the 2024/25 tax year, including PAYE, National Insurance, pension and student loan changes.",
};

export default function DashboardPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

