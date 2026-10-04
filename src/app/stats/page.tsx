"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Anchor,
  Button,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCopy, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { loadDismissedPairs } from "~/lib/duplicateDismissals";
import { findDuplicateGroups } from "~/lib/gameDuplicates";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { StatsDashboard } from "~/components/StatsDashboard";
import { getRecordedGames } from "~/lib/api/recordedGames";
import { getFriends } from "~/lib/api/friends";
import { DEFAULT_STATS_FILTERS, type GameStatsFilters } from "~/lib/gameStats";
import type { RecordedGame } from "~/types/recordedGame";

export default function StatsPage() {
  const router = useRouter();
  const [games, setGames] = useState<RecordedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendUsernames, setFriendUsernames] = useState<
    ReadonlyMap<string, string>
  >(new Map());

  // Friends' names in Head-to-head link to their profiles.
  useEffect(() => {
    let cancelled = false;
    getFriends()
      .then((friends) => {
        if (cancelled) return;
        setFriendUsernames(new Map(friends.map((f) => [f.id, f.username])));
      })
      .catch(() => {
        // Without friends the names are plain text.
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const [filters, setFilters] = useState<GameStatsFilters>(
    DEFAULT_STATS_FILTERS
  );

  const duplicateCount = useMemo(
    () => findDuplicateGroups(games, loadDismissedPairs()).size,
    [games]
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

        {duplicateCount > 0 ? (
          <Alert color="yellow" icon={<IconCopy size={18} />}>
            {duplicateCount} games look like they were recorded more than once
            and may be counted twice.{" "}
            <Anchor component={Link} href="/games" size="sm">
              Review them in your game log
            </Anchor>
            .
          </Alert>
        ) : null}

        {loading ? (
          <Text c="dimmed">Loading stats…</Text>
        ) : (
          <StatsDashboard
            games={games}
            filters={filters}
            onFiltersChange={setFilters}
            profileUsernames={friendUsernames}
          />
        )}
      </Stack>
    </Container>
  );
}
