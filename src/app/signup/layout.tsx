import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Updates – UK Take-Home Calculator",
  description: "Sign up for updates to the UK take-home pay calculator, including new features and future tax years.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

