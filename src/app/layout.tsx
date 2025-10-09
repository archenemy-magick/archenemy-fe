import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";

import { Providers } from "~/components/Providers";

export const metadata = {
  title: "Archenemy - Build and Play Scheme Decks",
  description: "Build and play with Archenemy scheme decks",
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
