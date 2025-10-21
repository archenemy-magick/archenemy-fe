"use client";

import { MantineProvider, type MantineTheme } from "@mantine/core";
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
        primaryColor: "magenta",
        colors: {
          // Vibrant Magenta - Primary brand color
          magenta: [
            "#ffe0f7", // Lightest
            "#ffb3e6",
            "#ff80d5",
            "#ff4dc4",
            "#ff1ab3",
            "#e91e8c", // Primary magenta
            "#d11a7d",
            "#b8166e",
            "#9e135e",
            "#85104f", // Darkest
          ],
          // Deep Violet - Secondary/complementary
          violet: [
            "#f3f0ff",
            "#e5dbff",
            "#d0bfff",
            "#b197fc",
            "#9775fa",
            "#845ef7", // Secondary violet
            "#7950f2",
            "#7048e8",
            "#6741d9",
            "#5f3dc4",
          ],
          // Rich Gold - Accent color
          gold: [
            "#fff8e1",
            "#ffecb3",
            "#ffe082",
            "#ffd54f",
            "#ffca28",
            "#ffc107", // Primary gold
            "#ffb300",
            "#ffa000",
            "#ff8f00",
            "#ff6f00",
          ],
          // Deep Red - For warnings/danger states
          crimson: [
            "#ffe9e9",
            "#ffd1d1",
            "#ffb3b3",
            "#ff8a8a",
            "#ff6b6b",
            "#e63946", // Danger/warning red
            "#d62839",
            "#c1121f",
            "#a4161a",
            "#780000",
          ],
          // Enhanced dark grays with slight purple tint
          dark: [
            "#d4d4d8",
            "#b8b8c0",
            "#8a8a95",
            "#6b6b75",
            "#4a4a52",
            "#3d3d45", // Card backgrounds
            "#2f2f37",
            "#26262e", // Slightly purple-tinted dark
            "#1c1c22",
            "#0f0f14", // Darkest background
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
              fontWeight: "700",
            },
            h2: {
              fontSize: "1.625rem",
              lineHeight: "1.35",
              fontWeight: "600",
            },
            h3: {
              fontSize: "1.375rem",
              lineHeight: "1.4",
              fontWeight: "500",
            },
            h4: {
              fontSize: "1.125rem",
              lineHeight: "1.45",
              fontWeight: "500",
            },
            h5: {
              fontSize: "1rem",
              lineHeight: "1.5",
              fontWeight: "500",
            },
            h6: {
              fontSize: "0.875rem",
              lineHeight: "1.5",
              fontWeight: "500",
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
                  boxShadow: "0 4px 16px rgba(233, 30, 140, 0.4)",
                },
              },
            },
          },
          Card: {
            defaultProps: {
              radius: "lg",
              shadow: "sm",
            },
            styles: (theme: MantineTheme) => ({
              root: {
                borderLeft: "3px solid transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderLeftColor: "#e91e8c",
                  boxShadow: "0 8px 24px rgba(233, 30, 140, 0.15)",
                },
              },
            }),
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
            styles: {
              header: {
                background: "linear-gradient(90deg, #e91e8c 0%, #845ef7 100%)",
                paddingBottom: "1rem",
                marginBottom: "1rem",
              },
              title: {
                color: "#fff",
                fontWeight: 700,
              },
            },
          },
          Badge: {
            styles: {
              root: {
                textTransform: "uppercase",
                fontWeight: 700,
                letterSpacing: "0.5px",
              },
            },
          },
          ActionIcon: {
            styles: {
              root: {
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                },
              },
            },
          },
        },
        other: {
          // Custom gradient utilities you can use in your components
          gradients: {
            primary: "linear-gradient(135deg, #e91e8c 0%, #845ef7 100%)",
            secondary: "linear-gradient(135deg, #845ef7 0%, #ffc107 100%)",
            danger: "linear-gradient(135deg, #e63946 0%, #e91e8c 100%)",
            gold: "linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)",
          },
        },
      }}
      defaultColorScheme="dark"
    >
      <Notifications position="top-right" />

      <AppShellLayout>{children}</AppShellLayout>
    </MantineProvider>
  );
}
