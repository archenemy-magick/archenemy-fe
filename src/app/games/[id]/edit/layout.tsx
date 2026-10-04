import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Game",
  robots: { index: false, follow: false },
};

export default function EditGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
