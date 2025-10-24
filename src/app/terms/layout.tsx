import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms and conditions for using MagicSAK. Learn about your rights, responsibilities, and our policies.",
  openGraph: {
    title: "Terms of Service | MagicSAK",
    description: "Terms and conditions for using MagicSAK.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
