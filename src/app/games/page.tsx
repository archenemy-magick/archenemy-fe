"use client";

import { useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { ColorPips } from "~/components/ColorIdentityPicker";
import { deleteRecordedGame, getRecordedGames } from "~/lib/api/recordedGames";
import { gameResultFor, type GameResult } from "~/lib/gameStats";
import { FORMAT_LABELS, type RecordedGame } from "~/types/recordedGame";

const RESULT_BADGE: Record<GameResult, { label: string; color: string }> = {
  W: { label: "Win", color: "green" },
  L: { label: "Loss", color: "red" },
  D: { label: "Draw", color: "gray" },
};

export default function GamesPage() {
  const router = useRouter();
  const [games, setGames] = useState<RecordedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingGame, setConfirmingGame] = useState<RecordedGame | null>(
    null
  );

  const loadGames = async () => {
    try {
      setLoading(true);
      setGames(await getRecordedGames());
    } catch (error: unknown) {
      notifications.show({
        title: "Could not load games",
        message: (error as Error).message || "Try again later.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleDelete = async (gameId: string) => {
    try {
      setDeletingId(gameId);
      await deleteRecordedGame(gameId);
      setGames((current) => current.filter((game) => game.id !== gameId));
      notifications.show({
        title: "Game deleted",
        message: "Removed from your log and stats.",
        color: "orange",
      });
    } catch (error: unknown) {
      notifications.show({
        title: "Delete failed",
        message: (error as Error).message || "Try again.",
        color: "red",
      });
    } finally {
      setDeletingId(null);
      setConfirmingGame(null);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Modal
        opened={confirmingGame !== null}
        onClose={() => setConfirmingGame(null)}
        title="Delete this game?"
        centered
      >
        <Text size="sm" mb="lg">
          It will be removed from your log and stats. This cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirmingGame(null)}>
            Cancel
          </Button>
          <Button
            color="red"
            loading={deletingId !== null}
            onClick={() => confirmingGame && handleDelete(confirmingGame.id)}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      <Stack gap="lg">
        <Group justify="space-between" wrap="wrap">
          <div>
            <Title order={1}>Game log</Title>
            <Text c="dimmed">Every match you have recorded.</Text>
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
              const me = game.players.find((player) => player.is_recorder);
              const result = gameResultFor(game) ?? "D";
              return (
                <Card key={game.id} withBorder padding="md">
                  <Group
                    justify="space-between"
                    align="flex-start"
                    wrap="nowrap"
                  >
                    <Stack gap={6} style={{ flex: 1 }}>
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
                          .filter((player) => !player.is_recorder)
                          .map(
                            (player) =>
                              player.commander_name || player.display_name
                          )
                          .join(", ")}
                      </Text>
                    </Stack>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      aria-label="Delete game"
                      loading={deletingId === game.id}
                      onClick={() => setConfirmingGame(game)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
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
