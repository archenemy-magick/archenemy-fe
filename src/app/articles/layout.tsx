import { ReactNode } from "react";
import { pageMetadata } from "~/config/metadata";

export const metadata = pageMetadata.articles;

export default function ArticlesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
