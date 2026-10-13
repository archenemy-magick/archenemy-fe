import FAQClientPage from "~/components/FAQClientPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions",
  description:
    "Answers to common questions about MagicSAK: the game utilities, recording games and stats, friends, Archenemy decks, and what's coming next.",
  openGraph: {
    title: "FAQ | MagicSAK",
    description:
      "Answers to common questions about MagicSAK's game utilities, stats, friends, and Archenemy decks.",
  },
};

export default function FAQPage() {
  return <FAQClientPage />;
}
