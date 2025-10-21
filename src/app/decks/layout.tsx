import { ReactNode } from "react";
import DecksSubHeader from "~/components/DecksSubHeader";
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
