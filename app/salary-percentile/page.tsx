import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import PercentileClient from "./PercentileClient";

export const metadata: Metadata = buildMetadata({
  title: "How Rich Are You? UK Salary Percentile Calculator",
  description:
    "See where your UK salary ranks against adult income tax payers. Free UK salary percentile calculator with methodology and source.",
  path: "/salary-percentile",
  keywords: ["UK salary percentile", "how rich am I", "UK income distribution", "salary ranking UK"],
});

export default function Page() {
  return <PercentileClient />;
}
