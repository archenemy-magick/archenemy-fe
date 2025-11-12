// components/DungeonGameSelector/DungeonGameSelector.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Stack,
  Card,
  Grid,
  Image,
  Text,
  Button,
  Group,
  Portal,
  Paper,
  Transition,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mantine/hooks"; // ADD THIS
import { getAllDungeons } from "~/lib/api/dungeons";
import { DungeonCard } from "~/types/dungeon";

export function DungeonGameSelector() {
  const router = useRouter();
  const [dungeons, setDungeons] = useState<DungeonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDungeon, setSelectedDungeon] = useState<string | null>(null);

  // NEW: Check if mobile
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    loadDungeons();
  }, []);

  const loadDungeons = async () => {
    try {
      const data = await getAllDungeons();
      setDungeons(data);
    } catch (error) {
      console.error("Failed to load dungeons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDungeon = () => {
    if (selectedDungeon) {
      router.push(`/game/dungeons/${selectedDungeon}`);
    }
  };

  // NEW: Get selected dungeon data
  const selectedDungeonData = dungeons.find((d) => d.id === selectedDungeon);

  if (loading) {
    return <Text>Loading dungeons...</Text>;
  }

  return (
    <>
      <Stack
        gap="xl"
        style={{
          touchAction: "auto",
          paddingBottom: isMobile && selectedDungeon ? 80 : 0,
        }}
      >
        <Text size="lg">Choose a dungeon to explore:</Text>

        <Grid>
          {dungeons.map((dungeon) => (
            <Grid.Col key={dungeon.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card
                shadow="sm"
                padding="lg"
                withBorder
                style={{
                  cursor: "pointer",
                  border:
                    selectedDungeon === dungeon.id
                      ? "2px solid var(--mantine-color-blue-6)"
                      : undefined,
                  touchAction: "auto",
                }}
                onClick={() => setSelectedDungeon(dungeon.id)}
              >
                <Card.Section>
                  <Image
                    src={dungeon.image_normal}
                    alt={dungeon.name}
                    height={300}
                    style={{ touchAction: "auto" }}
                  />
                </Card.Section>

                <Stack gap="xs" mt="md">
                  <Text fw={600}>{dungeon.name}</Text>
                  <Text size="xs" c="dimmed">
                    {dungeon.set_name}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {/* Desktop button - only show when not mobile */}
        {!isMobile && (
          <Group justify="center">
            <Button
              size="lg"
              disabled={!selectedDungeon}
              onClick={handleStartDungeon}
            >
              Start Dungeon
            </Button>
          </Group>
        )}
      </Stack>

      {/* NEW: Mobile sticky bottom popup */}
      {isMobile && (
        <Portal>
          <Transition
            mounted={!!selectedDungeon}
            transition="slide-up"
            duration={200}
            timingFunction="ease"
          >
            {(styles) => (
              <Paper
                style={{
                  ...styles,
                  position: "fixed",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  borderRadius: "16px 16px 0 0",
                  boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.15)",
                }}
                p="md"
                withBorder
              >
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <div style={{ flex: 1 }}>
                      <Text fw={600} size="sm">
                        {selectedDungeonData?.name}
                      </Text>
                    </div>
                    <Button size="md" onClick={handleStartDungeon}>
                      Start Game
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            )}
          </Transition>
        </Portal>
      )}
    </>
  );
}
