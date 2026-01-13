import type { Metadata } from "next";
import { TAX_YEAR } from "../lib/taxYear";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

export const metadata: Metadata = {
  title: "UK Take-Home Dashboard – Compare Salary and Tax Scenarios",
  description: `Compare UK take-home pay scenarios for the ${TAX_YEAR} tax year, including PAYE, National Insurance, pension and student loan changes.`,
  alternates: {
    canonical: `${siteUrl}/dashboard-preview`,
  },
};

export default function DashboardPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

