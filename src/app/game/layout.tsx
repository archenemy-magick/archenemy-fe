import { Stack, Title } from "@mantine/core";
import { ReactNode } from "react";
import { pageMetadata } from "~/config/metadata";

export const metadata = pageMetadata.gameUtilities;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Stack gap="sm" m="sm">
      <main>{children}</main>
    </Stack>
  );
}
