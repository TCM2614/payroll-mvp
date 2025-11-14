import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · UK Take-Home Calculator · GDPR-Compliant",
  description:
    "UK Take-Home Calculator Privacy Policy - GDPR-compliant privacy policy. We do not collect, store or profile your personal salary information. Your data is processed anonymously.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy · UK Take-Home Calculator",
    description:
      "GDPR-compliant privacy policy. We do not collect, store or profile your personal salary information.",
    type: "website",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

