"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Progress,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import {
  ColorIdentityPicker,
  ColorPips,
} from "~/components/ColorIdentityPicker";
import { COLOR_META, COLORLESS_META } from "~/lib/mtgColors";
import {
  computeUserGameStats,
  DEFAULT_STATS_FILTERS,
  type DeckStat,
  type GameResult,
  type GameStatsFilters,
  type StatsDatePreset,
} from "~/lib/gameStats";
import {
  FORMAT_LABELS,
  GAME_FORMATS,
  WIN_CONDITION_LABELS,
  type RecordedGame,
} from "~/types/recordedGame";

const DATE_PRESETS: { value: StatsDatePreset; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "365d", label: "Year" },
];

const RESULT_COLORS: Record<GameResult, string> = {
  W: "green",
  L: "red",
  D: "gray",
};

type DeckSortKey = "commander" | "games" | "wins" | "winRate";

const DECK_SORTERS: Record<DeckSortKey, (a: DeckStat, b: DeckStat) => number> =
  {
    commander: (a, b) => a.commanderName.localeCompare(b.commanderName),
    games: (a, b) => a.games - b.games,
    wins: (a, b) => a.wins - b.wins || a.winRate - b.winRate,
    winRate: (a, b) => a.winRate - b.winRate || a.games - b.games,
  };

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card withBorder padding="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        {label}
      </Text>
      <Text fw={800} size="xl">
        {value}
      </Text>
      {hint ? (
        <Text size="xs" c="dimmed">
          {hint}
        </Text>
      ) : null}
    </Card>
  );
}

function BarRow({
  label,
  value,
  max,
  color,
  onClick,
  active,
  right,
  tooltip,
}: {
  label: ReactNode;
  value: number;
  max: number;
  color: string;
  onClick?: () => void;
  active?: boolean;
  right?: string;
  tooltip?: string;
}) {
  const width = max === 0 ? 0 : Math.max(6, (value / max) * 100);
  const row = (
    <UnstyledButton
      onClick={onClick}
      disabled={!onClick}
      style={{ width: "100%", cursor: onClick ? "pointer" : "default" }}
    >
      <Stack gap={4}>
        <Group justify="space-between">
          <Box>{label}</Box>
          {right ? (
            <Text
              size="sm"
              c={active ? undefined : "dimmed"}
              fw={active ? 600 : 400}
            >
              {right}
            </Text>
          ) : null}
        </Group>
        <Box
          style={{
            height: 10,
            borderRadius: 4,
            background: "var(--mantine-color-default-border)",
            overflow: "hidden",
            outline: active
              ? "2px solid var(--mantine-color-yellow-5)"
              : "none",
          }}
        >
          <Box
            style={{
              width: `${width}%`,
              height: "100%",
              borderRadius: 4,
              background: color,
            }}
          />
        </Box>
      </Stack>
    </UnstyledButton>
  );
  return tooltip ? (
    <Tooltip label={tooltip} withArrow position="top-end" openDelay={150}>
      {row}
    </Tooltip>
  ) : (
    row
  );
}

function SortableTh({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: DeckSortKey;
  sort: { key: DeckSortKey; desc: boolean };
  onSort: (key: DeckSortKey) => void;
}) {
  const active = sort.key === sortKey;
  const Icon = sort.desc ? IconChevronDown : IconChevronUp;
  return (
    <Table.Th>
      <UnstyledButton
        onClick={() => onSort(sortKey)}
        aria-label={`Sort by ${label}`}
      >
        <Group gap={4} wrap="nowrap">
          <Text size="sm" fw={700}>
            {label}
          </Text>
          {active ? <Icon size={14} /> : null}
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

type StatsDashboardProps = {
  games: RecordedGame[];
  filters: GameStatsFilters;
  onFiltersChange: (filters: GameStatsFilters) => void;
};

export function StatsDashboard({
  games,
  filters,
  onFiltersChange,
}: StatsDashboardProps) {
  const stats = useMemo(
    () => computeUserGameStats(games, filters),
    [games, filters]
  );
  const [deckSort, setDeckSort] = useState<{
    key: DeckSortKey;
    desc: boolean;
  }>({ key: "wins", desc: true });

  const sortedDecks = useMemo(() => {
    const sorter = DECK_SORTERS[deckSort.key];
    return [...stats.winningestDecks].sort((a, b) =>
      deckSort.desc ? sorter(b, a) : sorter(a, b)
    );
  }, [stats.winningestDecks, deckSort]);

  const handleDeckSort = (key: DeckSortKey) =>
    setDeckSort((current) =>
      current.key === key
        ? { key, desc: !current.desc }
        : { key, desc: key !== "commander" }
    );

  const playerCounts = useMemo(() => {
    const counts = new Set(games.map((game) => game.players.length));
    return Array.from(counts).sort((a, b) => a - b);
  }, [games]);

  const maxColorGames = Math.max(
    1,
    ...stats.mostUsedColors.map((entry) => entry.games)
  );
  const maxMonthGames = Math.max(
    1,
    ...stats.monthly.map((entry) => entry.games)
  );
  const maxConditionGames = Math.max(
    1,
    ...stats.winConditions.map((entry) => entry.games)
  );
  const streak = stats.streaks.current;

  if (games.length === 0) {
    return (
      <Card withBorder padding="xl" ta="center">
        <Title order={3} mb="xs">
          No games yet
        </Title>
        <Text c="dimmed" mb="md">
          Record a finished match to unlock win rate, deck, and color stats.
        </Text>
        <Button component="a" href="/games/record">
          Record a game
        </Button>
      </Card>
    );
  }

  return (
    <Stack gap="lg">
      <Card withBorder padding="md">
        <Stack gap="md">
          <Group justify="space-between" wrap="wrap">
            <Title order={4}>Filters</Title>
            <Button
              size="xs"
              variant="subtle"
              onClick={() => onFiltersChange(DEFAULT_STATS_FILTERS)}
            >
              Reset
            </Button>
          </Group>
          <SegmentedControl
            value={filters.datePreset}
            onChange={(value) =>
              onFiltersChange({
                ...filters,
                datePreset: value as StatsDatePreset,
              })
            }
            data={DATE_PRESETS}
          />
          <SimpleGrid cols={{ base: 1, xs: 2 }}>
            <Select
              label="Format"
              data={[
                { value: "all", label: "All formats" },
                ...GAME_FORMATS.map((format) => ({
                  value: format,
                  label: FORMAT_LABELS[format],
                })),
              ]}
              value={filters.format}
              onChange={(value) =>
                onFiltersChange({ ...filters, format: value || "all" })
              }
            />
            <Select
              label="Pod size"
              data={[
                { value: "all", label: "Any size" },
                ...playerCounts.map((count) => ({
                  value: String(count),
                  label: `${count} players`,
                })),
              ]}
              value={String(filters.playerCount)}
              onChange={(value) =>
                onFiltersChange({
                  ...filters,
                  playerCount:
                    !value || value === "all" ? "all" : Number(value),
                })
              }
            />
          </SimpleGrid>
          <Stack gap={6}>
            <Text size="sm" fw={500}>
              Your colors (must include)
            </Text>
            <ColorIdentityPicker
              value={filters.colors}
              onChange={(colors) =>
                onFiltersChange({ ...filters, colors, colorless: false })
              }
              colorless={{
                selected: filters.colorless,
                onSelect: () =>
                  onFiltersChange({
                    ...filters,
                    colors: [],
                    colorless: !filters.colorless,
                  }),
              }}
            />
          </Stack>
          {filters.deckKey ? (
            <Badge
              variant="light"
              color="grape"
              rightSection={
                <UnstyledButton
                  aria-label="Clear deck filter"
                  onClick={() => onFiltersChange({ ...filters, deckKey: null })}
                >
                  ×
                </UnstyledButton>
              }
            >
              Filtered to one deck
            </Badge>
          ) : null}
        </Stack>
      </Card>

      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <StatCard
          label="Games"
          value={String(stats.gamesPlayed)}
          hint={
            stats.gamesPlayed === games.length
              ? "All recorded games"
              : `of ${games.length} recorded`
          }
        />
        <StatCard
          label="Win rate"
          value={percent(stats.winRate)}
          hint={`${stats.wins}W / ${stats.losses}L / ${stats.draws}D`}
        />
        <StatCard
          label="Current streak"
          value={streak ? `${streak.result}${streak.length}` : "—"}
          hint={`Longest win streak: ${stats.streaks.longestWin}`}
        />
        <StatCard
          label="Avg. ending turn"
          value={
            stats.averageEndingTurn == null
              ? "—"
              : stats.averageEndingTurn.toFixed(1)
          }
        />
      </SimpleGrid>

      {stats.streaks.recent.length > 0 ? (
        <Group gap="xs" wrap="wrap">
          <Text size="sm" c="dimmed">
            Last {stats.streaks.recent.length}, newest first:
          </Text>
          {stats.streaks.recent.map((result, index) => (
            <Badge
              key={index}
              color={RESULT_COLORS[result]}
              variant="light"
              size="sm"
            >
              {result}
            </Badge>
          ))}
        </Group>
      ) : null}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card withBorder padding="md">
          <Title order={4} mb="md">
            Most used colors
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            Tap a color to filter. Bars are games you played with that color in
            your deck; colorless counts decks with no colors.
          </Text>
          <Stack gap="sm">
            {stats.mostUsedColors.map((entry) => {
              const color = entry.color;
              const meta = color === "C" ? COLORLESS_META : COLOR_META[color];
              const active =
                color === "C"
                  ? filters.colorless
                  : filters.colors.includes(color);
              const toggle = () => {
                if (color === "C") {
                  onFiltersChange({
                    ...filters,
                    colors: [],
                    colorless: !filters.colorless,
                  });
                  return;
                }
                const next = filters.colors.includes(color)
                  ? filters.colors.filter((c) => c !== color)
                  : [...filters.colors, color];
                onFiltersChange({ ...filters, colors: next, colorless: false });
              };
              return (
                <BarRow
                  key={color}
                  label={
                    <Group gap="xs">
                      <ColorPips colors={color === "C" ? [] : [color]} />
                      <Text size="sm">{meta.name}</Text>
                    </Group>
                  }
                  value={entry.games}
                  max={maxColorGames}
                  color={meta.fill}
                  active={active}
                  onClick={toggle}
                  right={`${entry.games} · ${percent(entry.winRate)}`}
                  tooltip={`${entry.games} games, ${
                    entry.wins
                  } wins with ${meta.name.toLowerCase()} decks`}
                />
              );
            })}
          </Stack>
        </Card>

        <Card withBorder padding="md">
          <Title order={4} mb="md">
            Games by month
          </Title>
          {stats.monthly.length === 0 ? (
            <Text c="dimmed" size="sm">
              No games in this range.
            </Text>
          ) : (
            <Stack gap="sm">
              {stats.monthly.map((entry) => (
                <BarRow
                  key={entry.month}
                  label={<Text size="sm">{entry.label}</Text>}
                  value={entry.games}
                  max={maxMonthGames}
                  color="linear-gradient(90deg, #e91e8c, #845ef7)"
                  right={`${entry.wins}W / ${entry.games}`}
                  tooltip={`${entry.label}: ${entry.games} games, ${entry.wins} wins`}
                />
              ))}
            </Stack>
          )}
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card withBorder padding="md">
          <Title order={4} mb="md">
            How games ended
          </Title>
          {stats.winConditions.length === 0 ? (
            <Text c="dimmed" size="sm">
              No games in this range.
            </Text>
          ) : (
            <Stack gap="sm">
              {stats.winConditions.map((entry) => {
                const label =
                  entry.condition === "unknown"
                    ? "Not recorded"
                    : WIN_CONDITION_LABELS[entry.condition];
                return (
                  <BarRow
                    key={entry.condition}
                    label={<Text size="sm">{label}</Text>}
                    value={entry.games}
                    max={maxConditionGames}
                    color="var(--mantine-color-grape-6)"
                    right={`${entry.games} · you won ${entry.yourWins}`}
                    tooltip={`${label}: ${entry.games} games, ${entry.yourWins} of them your wins`}
                  />
                );
              })}
            </Stack>
          )}
        </Card>

        <Card withBorder padding="md">
          <Title order={4} mb="xs">
            Head-to-head
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            Everyone you have sat down with, and who took the game.
          </Text>
          {stats.opponents.length === 0 ? (
            <Text c="dimmed" size="sm">
              No opponents in this range.
            </Text>
          ) : (
            <Table.ScrollContainer minWidth={360}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Opponent</Table.Th>
                    <Table.Th>Games</Table.Th>
                    <Table.Th>Your wins</Table.Th>
                    <Table.Th>Their wins</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {stats.opponents.slice(0, 10).map((opponent) => (
                    <Table.Tr key={opponent.key}>
                      <Table.Td>
                        <Text fw={600} size="sm">
                          {opponent.name}
                        </Text>
                        {opponent.favoriteCommander ? (
                          <Text size="xs" c="dimmed">
                            Usually {opponent.favoriteCommander}
                          </Text>
                        ) : null}
                      </Table.Td>
                      <Table.Td>{opponent.games}</Table.Td>
                      <Table.Td>{opponent.yourWins}</Table.Td>
                      <Table.Td>{opponent.theirWins}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Card>
      </SimpleGrid>

      <Card withBorder padding="md">
        <Title order={4} mb="xs">
          Winningest decks
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          Click a row to focus stats on that deck. Click a column to sort.
        </Text>
        {stats.winningestDecks.length === 0 ? (
          <Text c="dimmed" size="sm">
            No decks match these filters.
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={500}>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <SortableTh
                    label="Commander"
                    sortKey="commander"
                    sort={deckSort}
                    onSort={handleDeckSort}
                  />
                  <Table.Th>Colors</Table.Th>
                  <SortableTh
                    label="Games"
                    sortKey="games"
                    sort={deckSort}
                    onSort={handleDeckSort}
                  />
                  <SortableTh
                    label="Wins"
                    sortKey="wins"
                    sort={deckSort}
                    onSort={handleDeckSort}
                  />
                  <SortableTh
                    label="Win rate"
                    sortKey="winRate"
                    sort={deckSort}
                    onSort={handleDeckSort}
                  />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedDecks.map((deck) => (
                  <Table.Tr
                    key={deck.key}
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        deckKey: filters.deckKey === deck.key ? null : deck.key,
                      })
                    }
                    style={{
                      cursor: "pointer",
                      background:
                        filters.deckKey === deck.key
                          ? "rgba(132, 94, 247, 0.15)"
                          : undefined,
                    }}
                  >
                    <Table.Td>
                      <Text fw={600}>{deck.commanderName}</Text>
                      {deck.deckName ? (
                        <Text size="xs" c="dimmed">
                          {deck.deckName}
                        </Text>
                      ) : null}
                    </Table.Td>
                    <Table.Td>
                      <ColorPips colors={deck.colors} />
                    </Table.Td>
                    <Table.Td>{deck.games}</Table.Td>
                    <Table.Td>{deck.wins}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Progress
                          value={deck.winRate * 100}
                          size="sm"
                          w={80}
                          color="grape"
                        />
                        <Text size="sm">{percent(deck.winRate)}</Text>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      <Card withBorder padding="md">
        <Title order={4} mb="md">
          Pod size
        </Title>
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          {stats.byPlayerCount.map((entry) => (
            <UnstyledButton
              key={entry.playerCount}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  playerCount:
                    filters.playerCount === entry.playerCount
                      ? "all"
                      : entry.playerCount,
                })
              }
            >
              <Card
                withBorder
                padding="sm"
                className="card-hover"
                style={{
                  outline:
                    filters.playerCount === entry.playerCount
                      ? "2px solid var(--mantine-color-grape-5)"
                      : undefined,
                }}
              >
                <Text fw={700}>{entry.playerCount} players</Text>
                <Text size="sm" c="dimmed">
                  {entry.games} games · {percent(entry.winRate)}
                </Text>
              </Card>
            </UnstyledButton>
          ))}
        </SimpleGrid>
      </Card>
    </Stack>
  );
}
