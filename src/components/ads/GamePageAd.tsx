"use client";

import { GoogleAd } from "./GoogleAd";
import { Box, Paper } from "@mantine/core";

interface GamePageAdProps {
  slot: string;
  position?: "top" | "sidebar" | "bottom";
}

export function GamePageAd({ slot, position = "sidebar" }: GamePageAdProps) {
  const styles = {
    top: {
      marginBottom: "1rem",
      width: "100%",
    },
    sidebar: {
      position: "sticky" as const,
      top: 80,
      marginLeft: "1rem",
    },
    bottom: {
      marginTop: "2rem",
      width: "100%",
    },
  };

  return (
    <Paper
      p="xs"
      withBorder
      style={styles[position]}
      bg="var(--mantine-color-dark-6)"
    >
      <Box ta="center" fz="xs" c="dimmed" mb="xs">
        Advertisement
      </Box>
      <GoogleAd
        slot={slot}
        format={position === "sidebar" ? "vertical" : "horizontal"}
        responsive={position !== "sidebar"}
      />
    </Paper>
  );
}
