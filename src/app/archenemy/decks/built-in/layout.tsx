import { pageMetadata } from "~/config/metadata";

export const metadata = pageMetadata.builtInDecks;

export default function BuiltInDecksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
