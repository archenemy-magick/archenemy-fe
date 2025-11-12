// app/game/page.tsx
"use client";

import {
  Container,
  Title,
  Stack,
  Card,
  Text,
  Button,
  Grid,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { IconCards, IconCast } from "@tabler/icons-react";

export default function GamePage() {
  const router = useRouter();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl" align="center">
        <Title order={1}>Choose Your Adventure</Title>

        <Grid w="100%" gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              shadow="sm"
              padding="xl"
              withBorder
              style={{ height: "100%", cursor: "pointer" }}
              onClick={() => router.push("/game/archenemy")}
            >
              <Stack align="center" gap="lg">
                <IconCards size={80} stroke={1.5} />
                <Title order={2}>Archenemy</Title>
                <Text ta="center" c="dimmed">
                  Play as the villain with powerful scheme cards against a team
                  of heroes
                </Text>
                <Button fullWidth size="lg">
                  Play Archenemy
                </Button>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              shadow="sm"
              padding="xl"
              withBorder
              style={{ height: "100%", cursor: "pointer" }}
              onClick={() => router.push("/game/dungeon")}
            >
              <Stack align="center" gap="lg">
                <IconCast size={80} stroke={1.5} />
                <Title order={2}>Dungeons</Title>
                <Text ta="center" c="dimmed">
                  Navigate through treacherous dungeons and unlock powerful
                  rewards
                </Text>
                <Button fullWidth size="lg">
                  Explore Dungeons
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
