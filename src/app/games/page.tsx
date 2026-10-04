"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Modal,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconCopy,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUserMinus,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "~/store";
import { ColorPips } from "~/components/ColorIdentityPicker";
import {
  deleteRecordedGame,
  getRecordedGames,
  unlinkMeFromRecordedGame,
} from "~/lib/api/recordedGames";
import { duplicatePairKey, findDuplicateGroups } from "~/lib/gameDuplicates";
import {
  loadDismissedPairs,
  saveDismissedPairs,
} from "~/lib/duplicateDismissals";
import { gameResultFor, type GameResult } from "~/lib/gameStats";
import { FORMAT_LABELS, type RecordedGame } from "~/types/recordedGame";

const RESULT_BADGE: Record<GameResult, { label: string; color: string }> = {
  W: { label: "Win", color: "green" },
  L: { label: "Loss", color: "red" },
  D: { label: "Draw", color: "gray" },
};

type PendingAction = { kind: "delete" | "unlink"; game: RecordedGame };

const ACTION_COPY = {
  delete: {
    title: "Delete this game?",
    body: "It will be removed from your log and stats, and from the stats of any friends linked to it. This cannot be undone.",
    confirm: "Delete",
    done: "Game deleted",
    doneMessage: "Removed from your log and stats.",
  },
  unlink: {
    title: "Remove yourself from this game?",
    body: "It will leave your log and stats. The friend who recorded it keeps their copy.",
    confirm: "Remove me",
    done: "Removed from game",
    doneMessage: "It no longer counts toward your stats.",
  },
} as const;

function recorderName(game: RecordedGame) {
  return game.players.find((player) => player.is_recorder)?.display_name;
}

export default function GamesPage() {
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.user.id);
  const [games, setGames] = useState<RecordedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [working, setWorking] = useState(false);
  const [dismissedPairs, setDismissedPairs] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    setDismissedPairs(loadDismissedPairs());
  }, []);

  useEffect(() => {
    let cancelled = false;
    getRecordedGames()
      .then((data) => {
        if (!cancelled) setGames(data);
      })
      .catch((error: unknown) => {
        notifications.show({
          title: "Could not load games",
          message: (error as Error).message || "Try again later.",
          color: "red",
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const duplicates = useMemo(
    () => findDuplicateGroups(games, dismissedPairs),
    [games, dismissedPairs]
  );

  const dismissDuplicates = (game: RecordedGame) => {
    const next = new Set(dismissedPairs);
    for (const other of duplicates.get(game.id) ?? []) {
      next.add(duplicatePairKey(game.id, other.id));
    }
    setDismissedPairs(next);
    saveDismissedPairs(next);
  };

  const runPendingAction = async () => {
    if (!pending) return;
    const { kind, game } = pending;
    try {
      setWorking(true);
      if (kind === "delete") await deleteRecordedGame(game.id);
      else await unlinkMeFromRecordedGame(game.id);
      setGames((current) => current.filter((g) => g.id !== game.id));
      notifications.show({
        title: ACTION_COPY[kind].done,
        message: ACTION_COPY[kind].doneMessage,
        color: "orange",
      });
    } catch (error: unknown) {
      notifications.show({
        title: "That didn't work",
        message: (error as Error).message || "Try again.",
        color: "red",
      });
    } finally {
      setWorking(false);
      setPending(null);
    }
  };

  const copy = pending ? ACTION_COPY[pending.kind] : null;

  return (
    <Container size="lg" py="xl">
      <Modal
        opened={pending !== null}
        onClose={() => setPending(null)}
        title={copy?.title}
        centered
      >
        <Text size="sm" mb="lg">
          {copy?.body}
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setPending(null)}>
            Cancel
          </Button>
          <Button color="red" loading={working} onClick={runPendingAction}>
            {copy?.confirm}
          </Button>
        </Group>
      </Modal>
      <Stack gap="lg">
        <Group justify="space-between" wrap="wrap">
          <div>
            <Title order={1}>Game log</Title>
            <Text c="dimmed">
              Games you recorded, plus games friends recorded with you.
            </Text>
          </div>
          <Group>
            <Button variant="light" onClick={() => router.push("/stats")}>
              View stats
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push("/games/record")}
            >
              Record game
            </Button>
          </Group>
        </Group>

        {duplicates.size > 0 ? (
          <Alert color="yellow" icon={<IconCopy size={18} />}>
            Some games look like they were recorded twice, which counts them
            twice in your stats. Delete your copy, remove yourself from a
            friend&apos;s copy, or mark them as not duplicates.
          </Alert>
        ) : null}

        {loading ? (
          <Text c="dimmed">Loading games…</Text>
        ) : games.length === 0 ? (
          <Card withBorder padding="xl" ta="center">
            <Text mb="md">You have not recorded any games yet.</Text>
            <Button onClick={() => router.push("/games/record")}>
              Record your first game
            </Button>
          </Card>
        ) : (
          <Stack gap="md">
            {games.map((game) => {
              const me =
                game.players.find((player) => player.is_viewer) ??
                game.players.find((player) => player.is_recorder);
              const recordedByMe = game.recorded_by === userId;
              const result = gameResultFor(game) ?? "D";
              const sameAs = duplicates.get(game.id) ?? [];
              return (
                <Card
                  key={game.id}
                  withBorder
                  padding="md"
                  style={
                    sameAs.length > 0
                      ? { borderColor: "var(--mantine-color-yellow-6)" }
                      : undefined
                  }
                >
                  <Group
                    justify="space-between"
                    align="flex-start"
                    wrap="nowrap"
                  >
                    <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="xs">
                        <Badge variant="light">
                          {FORMAT_LABELS[game.format] ?? game.format}
                        </Badge>
                        <Text size="sm" c="dimmed">
                          {new Date(game.played_at).toLocaleDateString()}
                        </Text>
                        {game.ended_on_turn != null ? (
                          <Text size="sm" c="dimmed">
                            Turn {game.ended_on_turn}
                          </Text>
                        ) : null}
                        <Badge color={RESULT_BADGE[result].color}>
                          {RESULT_BADGE[result].label}
                        </Badge>
                      </Group>
                      <Group gap="xs">
                        {me ? <ColorPips colors={me.colors} /> : null}
                        <Text fw={600}>
                          {me?.commander_name || me?.display_name || "You"}
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        vs{" "}
                        {game.players
                          .filter((player) => player !== me)
                          .map(
                            (player) =>
                              player.commander_name || player.display_name
                          )
                          .join(", ")}
                      </Text>
                      {!recordedByMe ? (
                        <Text size="xs" c="dimmed">
                          Recorded by {recorderName(game) ?? "a friend"}
                        </Text>
                      ) : null}
                      {sameAs.length > 0 ? (
                        <Group gap="xs" mt={4}>
                          <Badge
                            color="yellow"
                            variant="light"
                            leftSection={<IconCopy size={12} />}
                          >
                            Possible duplicate
                          </Badge>
                          <Text size="xs" c="dimmed">
                            Also recorded
                            {sameAs
                              .map((other) =>
                                other.recorded_by === userId
                                  ? " by you"
                                  : ` by ${recorderName(other) ?? "a friend"}`
                              )
                              .join(",")}
                          </Text>
                          <Button
                            size="compact-xs"
                            variant="subtle"
                            color="gray"
                            onClick={() => dismissDuplicates(game)}
                          >
                            Not a duplicate
                          </Button>
                        </Group>
                      ) : null}
                    </Stack>
                    {recordedByMe ? (
                      <Group gap={4} wrap="nowrap">
                        <Tooltip label="Edit game" withArrow>
                          <ActionIcon
                            variant="subtle"
                            aria-label="Edit game"
                            onClick={() =>
                              router.push(`/games/${game.id}/edit`)
                            }
                          >
                            <IconPencil size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete game" withArrow>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            aria-label="Delete game"
                            onClick={() => setPending({ kind: "delete", game })}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    ) : (
                      <Tooltip label="Remove me from this game" withArrow>
                        <ActionIcon
                          color="gray"
                          variant="subtle"
                          aria-label="Remove me from this game"
                          onClick={() => setPending({ kind: "unlink", game })}
                        >
                          <IconUserMinus size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
