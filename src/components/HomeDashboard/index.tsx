"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconChartBar,
  IconClipboardList,
  IconCoin,
  IconHeart,
  IconHistory,
  IconMapSearch,
  IconPlayerPlay,
  IconSword,
  IconUser,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { ColorPips } from "~/components/ColorIdentityPicker";
import { getFriendLists } from "~/lib/api/friends";
import { getRecordedGames } from "~/lib/api/recordedGames";
import { gameUtilityHref } from "~/lib/gameLinks";
import {
  computeUserGameStats,
  DEFAULT_STATS_FILTERS,
  gameResultFor,
  type GameResult,
} from "~/lib/gameStats";
import { profileHref } from "~/lib/profileLinks";
import type { RootState } from "~/store";
import type { RecordedGame } from "~/types/recordedGame";

const RESULT_BADGE: Record<GameResult, { label: string; color: string }> = {
  W: { label: "Win", color: "green" },
  L: { label: "Loss", color: "red" },
  D: { label: "Draw", color: "gray" },
};

const UTILITIES: {
  icon: Icon;
  title: string;
  description: string;
  color: string;
  href: string;
}[] = [
  {
    icon: IconHeart,
    title: "Life Tracker",
    description: "Life totals for the pod",
    color: "pink",
    href: gameUtilityHref("life-tracker"),
  },
  {
    icon: IconSword,
    title: "Archenemy",
    description: "Play a scheme deck",
    color: "magenta",
    href: gameUtilityHref("archenemy"),
  },
  {
    icon: IconMapSearch,
    title: "Dungeons",
    description: "Venture room by room",
    color: "grape",
    href: gameUtilityHref("dungeons"),
  },
  {
    icon: IconCoin,
    title: "Coin Flipper",
    description: "Heads or tails, fast",
    color: "yellow",
    href: gameUtilityHref("coin-flipper"),
  },
];

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text fw={700} size="sm" tt="uppercase" c="dimmed">
      {children}
    </Text>
  );
}

function LinkTile({
  icon: TileIcon,
  title,
  description,
  href,
  color = "grape",
  badge,
}: {
  icon: Icon;
  title: string;
  description: string;
  href: string;
  color?: string;
  badge?: React.ReactNode;
}) {
  return (
    <Card
      component={Link}
      href={href}
      withBorder
      padding="md"
      className="card-hover"
    >
      <Group wrap="nowrap" gap="md">
        <ThemeIcon size={44} radius="md" variant="light" color={color}>
          <TileIcon size={24} />
        </ThemeIcon>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" wrap="nowrap">
            <Text fw={600} truncate>
              {title}
            </Text>
            {badge}
          </Group>
          <Text size="sm" c="dimmed" truncate>
            {description}
          </Text>
        </div>
      </Group>
    </Card>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        {label}
      </Text>
      <Text fw={800} size="xl" truncate>
        {value}
      </Text>
    </div>
  );
}

export function HomeDashboard() {
  const username = useSelector((state: RootState) => state.user.username);
  const [games, setGames] = useState<RecordedGame[] | null>(null);
  const [incomingRequests, setIncomingRequests] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getRecordedGames()
      .then((data) => {
        if (!cancelled) setGames(data);
      })
      .catch(() => {
        if (!cancelled) setGames([]);
      });
    getFriendLists()
      .then((lists) => {
        if (!cancelled) setIncomingRequests(lists.incoming.length);
      })
      .catch(() => {
        // The badge is optional.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () => (games ? computeUserGameStats(games, DEFAULT_STATS_FILTERS) : null),
    [games]
  );
  const topDeck = stats?.winningestDecks[0];
  const recentGames = (games ?? []).slice(0, 3);

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <div>
          <Title order={1}>
            {username ? `Welcome back, ${username}` : "Welcome back"}
          </Title>
          <Text c="dimmed">Ready for the next game?</Text>
        </div>
        <Group gap="sm">
          <Button
            component={Link}
            href={gameUtilityHref()}
            leftSection={<IconPlayerPlay size={18} />}
          >
            Open Game Utilities
          </Button>
          <Button
            component={Link}
            href="/games/record"
            variant="light"
            leftSection={<IconClipboardList size={18} />}
          >
            Record a game
          </Button>
        </Group>
      </Group>

      {/* Stats at a glance */}
      <Stack gap="sm">
        <SectionTitle>At a glance</SectionTitle>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Card withBorder padding="lg">
            {stats === null ? (
              <Stack gap="sm">
                <Skeleton h={18} w="40%" />
                <Skeleton h={48} />
              </Stack>
            ) : stats.gamesPlayed === 0 ? (
              <Stack gap="sm" align="flex-start">
                <Text fw={600}>No games recorded yet</Text>
                <Text size="sm" c="dimmed">
                  Record a finished game to start tracking your win rate, decks,
                  and colors.
                </Text>
                <Button
                  component={Link}
                  href="/games/record"
                  size="xs"
                  variant="light"
                >
                  Record your first game
                </Button>
              </Stack>
            ) : (
              <Stack gap="md">
                <SimpleGrid cols={3} spacing="sm">
                  <StatTile label="Games" value={String(stats.gamesPlayed)} />
                  <StatTile label="Win rate" value={percent(stats.winRate)} />
                  <StatTile
                    label="Streak"
                    value={
                      stats.streaks.current
                        ? `${stats.streaks.current.result}${stats.streaks.current.length}`
                        : "—"
                    }
                  />
                </SimpleGrid>
                {topDeck ? (
                  <Group gap="xs" wrap="nowrap">
                    <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
                      Top deck:
                    </Text>
                    <ColorPips colors={topDeck.colors} size={16} />
                    <Text size="sm" fw={600} truncate>
                      {topDeck.commanderName}
                    </Text>
                    <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
                      {topDeck.wins}W · {percent(topDeck.winRate)}
                    </Text>
                  </Group>
                ) : null}
                <Button
                  component={Link}
                  href="/stats"
                  variant="subtle"
                  size="xs"
                  rightSection={<IconArrowRight size={14} />}
                  style={{ alignSelf: "flex-start" }}
                >
                  View all stats
                </Button>
              </Stack>
            )}
          </Card>

          <Card withBorder padding="lg">
            <Group justify="space-between" mb="sm">
              <Text fw={600}>Recent games</Text>
              <Button
                component={Link}
                href="/games"
                variant="subtle"
                size="xs"
                rightSection={<IconArrowRight size={14} />}
              >
                Game log
              </Button>
            </Group>
            {games === null ? (
              <Stack gap="xs">
                <Skeleton h={20} />
                <Skeleton h={20} />
                <Skeleton h={20} />
              </Stack>
            ) : recentGames.length === 0 ? (
              <Text size="sm" c="dimmed">
                Your last few games will show up here.
              </Text>
            ) : (
              <Stack gap="xs">
                {recentGames.map((game) => {
                  const me =
                    game.players.find((p) => p.is_viewer) ??
                    game.players.find((p) => p.is_recorder);
                  const result = gameResultFor(game) ?? "D";
                  return (
                    <Group key={game.id} gap="xs" wrap="nowrap">
                      <Badge
                        color={RESULT_BADGE[result].color}
                        variant="light"
                        w={52}
                        style={{ flexShrink: 0 }}
                      >
                        {RESULT_BADGE[result].label}
                      </Badge>
                      {me ? <ColorPips colors={me.colors} size={16} /> : null}
                      <Text size="sm" truncate style={{ flex: 1 }}>
                        {me?.commander_name || me?.display_name || "You"}
                      </Text>
                      <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                        {new Date(game.played_at).toLocaleDateString()}
                      </Text>
                    </Group>
                  );
                })}
              </Stack>
            )}
          </Card>
        </SimpleGrid>
      </Stack>

      {/* Utilities */}
      <Stack gap="sm">
        <SectionTitle>Game Utilities</SectionTitle>
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
          {UTILITIES.map((utility) => (
            <LinkTile key={utility.title} {...utility} />
          ))}
        </SimpleGrid>
      </Stack>

      {/* Everything else */}
      <Stack gap="sm">
        <SectionTitle>More</SectionTitle>
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="md">
          <LinkTile
            icon={IconChartBar}
            title="Stats"
            description="Win rate, decks, colors, rivals"
            href="/stats"
          />
          <LinkTile
            icon={IconHistory}
            title="Game Log"
            description="Every game you've played"
            href="/games"
          />
          <LinkTile
            icon={IconUsers}
            title="Friends"
            description="Share games and stats"
            href="/friends"
            badge={
              incomingRequests > 0 ? (
                <Badge size="sm" color="magenta" circle>
                  {incomingRequests}
                </Badge>
              ) : null
            }
          />
          <LinkTile
            icon={IconSword}
            title="Archenemy"
            description="Decks, popular cards, community"
            href="/archenemy"
            color="magenta"
          />
          <LinkTile
            icon={IconUser}
            title="My Profile"
            description="How friends see you"
            href={username ? profileHref(username) : "/profile"}
          />
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
