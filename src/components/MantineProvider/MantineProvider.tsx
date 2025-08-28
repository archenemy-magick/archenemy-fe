"use client";

import { MantineProvider } from "@mantine/core";
import AppShellLayout from "../AppShellLayout";
import theme from "./theme";

export default function CustomMantineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider theme={theme}>
      <AppShellLayout>{children}</AppShellLayout>
    </MantineProvider>
  );
}
