import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Record Game",
  description: "Record a finished Magic: The Gathering game for your stats.",
  robots: { index: false, follow: false },
};

export default function RecordGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
