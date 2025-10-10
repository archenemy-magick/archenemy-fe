import { ReactNode } from "react";
import DecksSubHeader from "~/components/DecksSubHeader";

export default function DecksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DecksSubHeader />
      {children}
    </>
  );
}
