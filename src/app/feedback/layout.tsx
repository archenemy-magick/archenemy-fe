import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Report a bug, suggest a feature, or tell us what you think of MagicSAK.",
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
