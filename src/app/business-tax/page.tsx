import { Metadata } from "next";

import BusinessTaxClient from "@/components/BusinessTaxClient";

export const metadata: Metadata = {
  title: "Business Tax Calculator UK 2024/25 | Sole Trader vs Ltd Company",
  description: "Compare taxes for Sole Traders vs Limited Companies. Calculate Corporation Tax, Dividends, and National Insurance instantly.",
  alternates: {
    canonical: "https://uktakehomecalculator.com/business-tax",
  },
};

export default function BusinessPage() {
  return <BusinessTaxClient />;
}
