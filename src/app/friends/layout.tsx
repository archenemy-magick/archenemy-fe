import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Friends",
  description: "Find friends by username and share recorded game stats.",
  robots: { index: false, follow: false },
};

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
