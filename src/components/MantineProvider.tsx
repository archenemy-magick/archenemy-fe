"use client";

import {
  MantineColorsTuple,
  MantineProvider,
  createTheme,
} from "@mantine/core";
import AppShellLayout from "./AppShellLayout";

const brandRed: MantineColorsTuple = [
  "#fdedf1",
  "#f4d7de",
  "#ecabba",
  "#e57c94",
  "#df5674",
  "#dc3f60",
  "#dc3355",
  "#c32746",
  "#ae203e",
  "#520b1c",
];

const theme = createTheme({
  colors: {
    brandRed,
  },
  primaryColor: "brandRed",
});
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
