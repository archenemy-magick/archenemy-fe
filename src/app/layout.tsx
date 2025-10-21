import "./globals.css";

import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";

import { Providers } from "~/components/Providers";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#228be6",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://magicsak.com"),
  title: {
    default: "MagicSAK - The Swiss Army Knife for Magic: The Gathering",
    template: "%s | MagicSAK",
  },
  description:
    "Build and play Magic: The Gathering Archenemy scheme decks and use other MTG tools. Create powerful decks, play with friends, and join a growing community.",
  keywords: [
    "Magic The Gathering",
    "MTG",
    "Archenemy",
    "Scheme Decks",
    "Deck Builder",
    "MTG Tools",
    "Magic Tools",
  ],
  authors: [{ name: "MagicSAK" }],
  creator: "MagicSAK",
  publisher: "MagicSAK",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MagicSAK",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://magicsak.com",
    siteName: "MagicSAK",
    title: "MagicSAK - The Swiss Army Knife for Magic: The Gathering",
    description:
      "Build and play Magic: The Gathering Archenemy scheme decks and use other MTG tools.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MagicSAK - MTG Tools Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MagicSAK - The Swiss Army Knife for Magic: The Gathering",
    description:
      "Build and play Magic: The Gathering Archenemy scheme decks and use other MTG tools.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
