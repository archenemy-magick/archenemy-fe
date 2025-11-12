// app/game/dungeon/page.tsx
"use client";

import { Container, Title, Stack } from "@mantine/core";
import { DungeonGameSelector } from "~/components/DungeonGameSelector";

export default function DungeonGamePage() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Title order={1}>Dungeon Explorer</Title>
        <DungeonGameSelector />
      </Stack>
    </Container>
  );
}
