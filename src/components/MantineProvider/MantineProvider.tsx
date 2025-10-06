"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import AppShellLayout from "../AppShellLayout";
import theme from "./theme";

export default function CustomMantineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider theme={theme}>
      <Notifications />

      <AppShellLayout>{children}</AppShellLayout>
    </MantineProvider>
  );
}
