import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

export const metadata: Metadata = {
  title: "UK Salary Calculator 2024/25 – Instant Take-Home Pay",
  description: "Calculate your UK salary after tax, National Insurance, pension and student loan deductions for the 2024/25 tax year.",
  alternates: {
    canonical: `${siteUrl}/calc`,
  },
};

export default function CalcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

