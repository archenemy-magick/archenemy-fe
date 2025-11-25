// app/game/dungeon/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Container, Stack, Button, Group } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { getDungeonById } from "~/lib/api/dungeons";
import { DungeonCard } from "~/types/dungeon";
import { DungeonTracker } from "~/components/DungeonTracker";
import { notifications } from "@mantine/notifications";

export default function DungeonGameInstancePage({
  dungeonId,
  handleBackToDungeonSelection,
}: {
  dungeonId: string;
  handleBackToDungeonSelection: () => void;
}) {
  const [dungeon, setDungeon] = useState<DungeonCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDungeon();
  }, [dungeonId]);

  const loadDungeon = async () => {
    try {
      const data = await getDungeonById(dungeonId);
      setDungeon(data);
    } catch (error) {
      console.error("Failed to load dungeon:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load dungeon",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div>Loading dungeon...</div>
      </Container>
    );
  }

  if (!dungeon) {
    return (
      <Container>
        <div>Dungeon not found</div>
      </Container>
    );
  }

  return (
    // <Container size="lg" py="xl">
    <Stack gap="xl">
      <Group>
        <Button
          leftSection={<IconArrowLeft size={16} />}
          variant="subtle"
          onClick={() => handleBackToDungeonSelection()}
        >
          Back to Dungeon Selection
        </Button>
      </Group>

      <DungeonTracker
        dungeon={dungeon}
        // onComplete={handleComplete}
      />
    </Stack>
    // </Container>
  );
}
