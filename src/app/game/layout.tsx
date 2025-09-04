import { Stack, Title } from "@mantine/core";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Stack gap="sm" m="sm">
      <Title order={1}>Archenemy</Title>

      <main>{children}</main>
    </Stack>
  );
}
