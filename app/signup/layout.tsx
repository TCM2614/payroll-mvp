import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

export const metadata: Metadata = {
  title: "Get Updates – UK Take-Home Calculator",
  description: "Sign up for updates to the UK take-home pay calculator, including new features and future tax years.",
  alternates: {
    canonical: `${siteUrl}/signup`,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

