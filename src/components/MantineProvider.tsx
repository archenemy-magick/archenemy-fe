"use client";

import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  // Define your theme here
});

export default function CustomMantineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
