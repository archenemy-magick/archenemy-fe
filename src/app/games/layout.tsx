import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game Log",
  description: "Your recorded Magic: The Gathering games.",
  robots: { index: false, follow: false },
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
