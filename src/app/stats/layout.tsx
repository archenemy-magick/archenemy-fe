import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game Stats",
  description:
    "Track Magic: The Gathering win rate, winningest commander decks, and most used colors.",
  openGraph: {
    title: "Game Stats | MagicSAK",
    description:
      "Interactive statistics for recorded Commander and other MTG games.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
