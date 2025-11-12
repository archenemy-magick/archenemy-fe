import { Stack, Title } from "@mantine/core";
import { ReactNode } from "react";

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
