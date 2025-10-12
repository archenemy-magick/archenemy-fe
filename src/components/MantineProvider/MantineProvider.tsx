"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import AppShellLayout from "../AppShellLayout";

export default function CustomMantineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider
      theme={{
        primaryColor: "violet",
        colors: {
          // Custom violet shades for Archenemy theme
          violet: [
            "#f3f0ff",
            "#e5dbff",
            "#d0bfff",
            "#b197fc",
            "#9775fa",
            "#845ef7", // Primary
            "#7950f2",
            "#7048e8",
            "#6741d9",
            "#5f3dc4",
          ],
          // Custom dark grays
          dark: [
            "#C9C9C9",
            "#b8b8b8",
            "#828282",
            "#696969",
            "#424242",
            "#3b3b3b", // Card backgrounds
            "#2e2e2e",
            "#242424",
            "#1f1f1f",
            "#141414", // Darkest background
          ],
        },
        defaultRadius: "md",
        fontFamily: "Poppins, sans-serif",
        fontFamilyMonospace: "Roboto Mono, monospace",
        headings: {
          fontFamily: "Poppins, sans-serif",
          fontWeight: "600",
          sizes: {
            h1: {
              fontSize: "2.025rem",
              lineHeight: "1.3",
              fontWeight: "400",
            },
            h2: {
              fontSize: "1.625rem",
              lineHeight: "1.35",
              fontWeight: "500",
            },
            h3: {
              fontSize: "1.375rem",
              lineHeight: "1.4",
              fontWeight: "400",
            },
            h4: {
              fontSize: "1.125rem",
              lineHeight: "1.45",
              fontWeight: "500",
            },
            h5: {
              fontSize: "1rem",
              lineHeight: "1.5",
              fontWeight: "400",
            },
            h6: {
              fontSize: "0.875rem",
              lineHeight: "1.5",
              fontWeight: "400",
            },
          },
        },
        components: {
          Button: {
            defaultProps: {
              radius: "md",
            },
            styles: {
              root: {
                fontWeight: 600,
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                },
              },
            },
          },
          Card: {
            defaultProps: {
              radius: "lg",
              shadow: "sm",
            },
          },
          Paper: {
            defaultProps: {
              radius: "md",
            },
          },
          Modal: {
            defaultProps: {
              radius: "lg",
              overlayProps: {
                blur: 3,
              },
            },
          },
        },
      }}
      defaultColorScheme="dark"
    >
      <Notifications />

      <AppShellLayout>{children}</AppShellLayout>
    </MantineProvider>
  );
}
