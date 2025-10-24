import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how MagicSAK collects, uses, and protects your personal information. Read our privacy policy for details on data handling and your rights.",
  openGraph: {
    title: "Privacy Policy | MagicSAK",
    description:
      "Learn how MagicSAK protects your privacy and handles your data.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
