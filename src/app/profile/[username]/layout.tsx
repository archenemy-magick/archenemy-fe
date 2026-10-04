import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Player Profile",
  robots: { index: false, follow: false },
};

export default function PlayerProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
