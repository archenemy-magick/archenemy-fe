import {
  Container,
  Title,
  Accordion,
  Text,
  Box,
  Stack,
  Paper,
  ThemeIcon,
  Group,
  List,
} from "@mantine/core";
import FAQClientPage from "~/components/FAQClientPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions",
  description:
    "Find answers to common questions about MagicSAK, including how to build Archenemy decks, play games, and learn about upcoming features like Planechase support.",
  openGraph: {
    title: "FAQ | MagicSAK",
    description:
      "Find answers to common questions about MagicSAK and learn about upcoming features.",
  },
};

export default function FAQPage() {
  return <FAQClientPage />;
}
