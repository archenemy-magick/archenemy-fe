import { ReactNode } from "react";
import DecksSubHeader from "~/components/ArchenemyDecksSubHeader";
import { pageMetadata } from "~/config/metadata";

export const metadata = pageMetadata.myDecks;

export default function DecksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DecksSubHeader />
      {children}
    </>
  );
}
