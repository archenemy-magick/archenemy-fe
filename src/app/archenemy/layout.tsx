import { ReactNode } from "react";
import { pageMetadata } from "~/config/metadata";

export const metadata = pageMetadata.archenemy;

export default function ArchenemyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
