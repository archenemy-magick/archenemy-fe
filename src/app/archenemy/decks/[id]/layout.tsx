import { ReactNode } from "react";
import { pageMetadata } from "~/config/metadata";

export const metadata = pageMetadata.deckDetail;

export default function DeckDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
