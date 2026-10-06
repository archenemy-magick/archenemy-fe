import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Built-in Archenemy Decks",
  description:
    "Ready-to-play Archenemy scheme decks, including Archenemy: Nicol Bolas. No account needed.",
};

export default function BuiltInDecksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
