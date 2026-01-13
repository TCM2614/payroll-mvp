import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About UK Take-Home Calculator · High-Accuracy Salary After Tax Tool",
  description:
    "Learn about UK Take-Home Calculator - a high-accuracy salary after-tax tool for UK employees, contractors and freelancers. Fast, trustworthy and transparent take-home pay calculations.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About UK Take-Home Calculator · High-Accuracy Salary After Tax Tool",
    description:
      "Learn about UK Take-Home Calculator - a high-accuracy salary after-tax tool for UK employees, contractors and freelancers.",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

