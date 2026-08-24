import type { Metadata } from "next";
import { TAX_YEAR } from "../lib/taxYear";
import { SITE_URL } from "@/lib/siteUrl";


export const metadata: Metadata = {
  title: `UK Salary Calculator ${TAX_YEAR} – Instant Take-Home Pay`,
  description: `Calculate your UK salary after tax, National Insurance, pension and student loan deductions for the ${TAX_YEAR} tax year.`,
  alternates: {
    canonical: `${SITE_URL}/calc`,
  },
};

export default function CalcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

