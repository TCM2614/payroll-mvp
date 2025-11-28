import { Metadata } from "next";

import CapitalGainsClient from "@/components/CapitalGainsClient";

export const metadata: Metadata = {
  title: "Capital Gains Tax Calculator UK 2024/25 | Property & Shares",
  description: "Calculate your Capital Gains Tax (CGT) on residential property and shares. Updated for the £3,000 allowance and 2024 rates. Instant & Free.",
  alternates: {
    canonical: "https://uktakehomecalculator.com/capital-gains-tax",
  },
};

export default function CGTPage() {
  return <CapitalGainsClient />;
}
