import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import SeoContent from "@/components/SeoContent";

export const metadata: Metadata = {
  title: "UK Salary Calculator 2024/25 – Take Home Pay After Tax",
  description:
    "Interactive UK take-home pay calculator with PAYE, Umbrella, Limited Company and Periodic tax checks. Includes student loan, pension and IR35 support.",
  keywords: ["UK Salary Calculator 2024", "Take home pay after tax", "Wage calculator"],
};

export default function Page() {
  return (
    <>
      <HomeClient />
      <SeoContent />
    </>
  );
}
