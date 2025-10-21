import { ReactNode } from "react";
import { pageMetadata } from "~/config/metadata";

interface LayoutProps {
  children: ReactNode;
}

export const metadata = pageMetadata.signUp;

export default function Layout({ children }: LayoutProps) {
  return <main>{children}</main>;
}
