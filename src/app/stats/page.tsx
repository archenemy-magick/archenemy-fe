"use client";

import { useEffect, useState } from "react";
import { Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { StatsDashboard } from "~/components/StatsDashboard";
import { getRecordedGames } from "~/lib/api/recordedGames";
import { DEFAULT_STATS_FILTERS, type GameStatsFilters } from "~/lib/gameStats";
import type { RecordedGame } from "~/types/recordedGame";

export default function StatsPage() {
  const router = useRouter();
  const [games, setGames] = useState<RecordedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<GameStatsFilters>(
    DEFAULT_STATS_FILTERS
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getRecordedGames();
        if (!cancelled) setGames(data);
      } catch (error: unknown) {
        notifications.show({
          title: "Could not load stats",
          message: (error as Error).message || "Try again later.",
          color: "red",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Title order={1}>Your stats</Title>
            <Text c="dimmed">
              Win rate, commanders, and colors from games you recorded.
            </Text>
          </div>
          <Group>
            <Button variant="light" onClick={() => router.push("/games")}>
              Game log
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push("/games/record")}
            >
              Record game
            </Button>
          </Group>
        </Group>

        {loading ? (
          <Text c="dimmed">Loading stats…</Text>
        ) : (
          <StatsDashboard
            games={games}
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}
      </Stack>
    </Container>
  );
}
