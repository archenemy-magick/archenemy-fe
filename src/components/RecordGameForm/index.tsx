"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
  ActionIcon,
  Modal,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { ColorIdentityPicker } from "~/components/ColorIdentityPicker";
import { CommanderAutocomplete } from "~/components/CommanderAutocomplete";
import { getFriends } from "~/lib/api/friends";
import type { PublicProfile } from "~/lib/api/publicProfiles";
import {
  createRecordedGame,
  getRecordedGames,
  updateRecordedGame,
} from "~/lib/api/recordedGames";
import { consumeRecordGameDraft } from "~/lib/gameRecordDraft";
import { findDuplicateCandidates } from "~/lib/gameDuplicates";
import { sortColors } from "~/lib/mtgColors";
import type { RootState } from "~/store";
import {
  FORMAT_LABELS,
  GAME_FORMATS,
  type GameFormat,
  type MtgColor,
  type RecordedGame,
  type RecordedGamePlayerInput,
  type WinCondition,
  WIN_CONDITION_LABELS,
  WIN_CONDITIONS,
} from "~/types/recordedGame";
import {
  FriendNameAutocomplete,
  findFriendByName,
} from "./FriendNameAutocomplete";

type PlayerDraft = {
  key: string;
  display_name: string;
  /** Linked friend's account; null for players without one. */
  user_id: string | null;
  is_recorder: boolean;
  commander_name: string;
  deck_name: string;
  colors: MtgColor[];
  is_winner: boolean;
  ending_life: number | null;
};

// <input type="date"> wants the local calendar date; toISOString() would
// give tomorrow's date on a US evening.
function toLocalDateInput(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function seatToDraft(seat: RecordedGame["players"][number]): PlayerDraft {
  return {
    key: seat.id,
    display_name: seat.display_name,
    user_id: seat.is_recorder ? null : seat.user_id,
    is_recorder: seat.is_recorder,
    commander_name: seat.commander_name ?? "",
    deck_name: seat.deck_name ?? "",
    colors: seat.colors,
    is_winner: seat.is_winner,
    ending_life: seat.ending_life,
  };
}

function emptyPlayer(isRecorder: boolean): PlayerDraft {
  return {
    key: `${Date.now()}-${Math.random()}`,
    display_name: "",
    user_id: null,
    is_recorder: isRecorder,
    commander_name: "",
    deck_name: "",
    colors: [],
    is_winner: false,
    ending_life: null,
  };
}

type RecordGameFormProps = {
  /** When set, the form edits this game instead of recording a new one. */
  game?: RecordedGame;
};

export function RecordGameForm({ game }: RecordGameFormProps = {}) {
  const router = useRouter();
  const {
    id: userId,
    username,
    isAuthenticated,
  } = useSelector((state: RootState) => state.user);

  const [playedAt, setPlayedAt] = useState(() => toLocalDateInput(new Date()));
  const [format, setFormat] = useState<GameFormat>("commander");
  const [endedOnTurn, setEndedOnTurn] = useState<number | string>("");
  const [winCondition, setWinCondition] = useState<WinCondition | "">("");
  const [notes, setNotes] = useState("");
  const [players, setPlayers] = useState<PlayerDraft[]>([
    emptyPlayer(true),
    emptyPlayer(false),
    emptyPlayer(false),
    emptyPlayer(false),
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [recentCommanders, setRecentCommanders] = useState<string[]>([]);
  const [existingGames, setExistingGames] = useState<RecordedGame[]>([]);
  const [duplicateMatches, setDuplicateMatches] = useState<RecordedGame[]>([]);
  const [friends, setFriends] = useState<PublicProfile[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getFriends()
      .then((list) => {
        if (!cancelled) setFriends(list);
      })
      .catch(() => {
        // Without friends the name fields are plain text inputs.
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Link seats whose names (e.g. from the Life Tracker) match a friend. Not
  // when editing: a friend may have deliberately unlinked themselves.
  useEffect(() => {
    if (game || !hydrated || friends.length === 0) return;
    setPlayers((current) => {
      const taken = new Set(current.map((p) => p.user_id).filter(Boolean));
      return current.map((player) => {
        if (player.is_recorder || player.user_id) return player;
        const friend = findFriendByName(friends, player.display_name);
        if (!friend || taken.has(friend.id)) return player;
        taken.add(friend.id);
        return { ...player, user_id: friend.id };
      });
    });
  }, [game, hydrated, friends]);

  // Offer commanders from past games first, most frequent first.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getRecordedGames()
      .then((games) => {
        if (cancelled) return;
        setExistingGames(games);
        const counts = new Map<string, number>();
        for (const game of games) {
          for (const player of game.players) {
            const name = player.commander_name?.trim();
            if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
          }
        }
        setRecentCommanders(
          Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([name]) => name)
        );
      })
      .catch(() => {
        // Suggestions are optional; the form works without history.
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!game) return;
    setPlayedAt(toLocalDateInput(new Date(game.played_at)));
    setFormat(game.format);
    setEndedOnTurn(game.ended_on_turn ?? "");
    setWinCondition(game.win_condition ?? "");
    setNotes(game.notes ?? "");
    setPlayers(game.players.map(seatToDraft));
    setHydrated(true);
  }, [game]);

  useEffect(() => {
    if (game) return;
    const draft = consumeRecordGameDraft();
    if (draft) {
      setFormat(draft.format);
      const nextPlayers = draft.players.map((player, index) => ({
        ...emptyPlayer(player.isRecorder || index === 0),
        display_name: player.displayName,
        ending_life: player.endingLife,
        is_recorder: player.isRecorder,
      }));
      if (!nextPlayers.some((p) => p.is_recorder) && nextPlayers[0]) {
        nextPlayers[0].is_recorder = true;
      }
      while (nextPlayers.length < 2) {
        nextPlayers.push(emptyPlayer(false));
      }
      setPlayers(nextPlayers);
    } else if (username) {
      setPlayers((current) =>
        current.map((player, index) =>
          index === 0 && !player.display_name
            ? { ...player, display_name: username }
            : player
        )
      );
    }
    setHydrated(true);
  }, [game, username]);

  const formatOptions = useMemo(
    () =>
      GAME_FORMATS.map((value) => ({
        value,
        label: FORMAT_LABELS[value],
      })),
    []
  );

  const winOptions = useMemo(
    () =>
      WIN_CONDITIONS.map((value) => ({
        value,
        label: WIN_CONDITION_LABELS[value],
      })),
    []
  );

  const updatePlayer = (key: string, patch: Partial<PlayerDraft>) => {
    setPlayers((current) =>
      current.map((player) =>
        player.key === key ? { ...player, ...patch } : player
      )
    );
  };

  const markRecorder = (key: string) => {
    setPlayers((current) =>
      current.map((player) => ({
        ...player,
        is_recorder: player.key === key,
        // Your own seat is linked to your account, not a friend's.
        user_id: player.key === key ? null : player.user_id,
      }))
    );
  };

  const markWinner = (key: string | null) => {
    setPlayers((current) =>
      current.map((player) => ({
        ...player,
        is_winner: key !== null && player.key === key,
      }))
    );
  };

  const addPlayer = () => {
    if (players.length >= 6) return;
    setPlayers((current) => [...current, emptyPlayer(false)]);
  };

  const removePlayer = (key: string) => {
    setPlayers((current) => {
      if (current.length <= 2) return current;
      const next = current.filter((player) => player.key !== key);
      if (!next.some((player) => player.is_recorder) && next[0]) {
        next[0] = { ...next[0], is_recorder: true };
      }
      return next;
    });
  };

  const handleSubmit = async ({ skipDuplicateCheck = false } = {}) => {
    const trimmed = players.map((player) => ({
      ...player,
      display_name: player.display_name.trim(),
      commander_name: player.commander_name.trim(),
    }));

    if (trimmed.some((player) => !player.display_name)) {
      notifications.show({
        title: "Missing player name",
        message: "Every seat needs a display name.",
        color: "red",
      });
      return;
    }

    if (format === "commander" && trimmed.some((p) => !p.commander_name)) {
      notifications.show({
        title: "Commander required",
        message: "Enter a commander for each player.",
        color: "red",
      });
      return;
    }

    if (!trimmed.some((player) => player.is_recorder)) {
      notifications.show({
        title: "Who were you?",
        message: "Mark one player as you.",
        color: "red",
      });
      return;
    }

    const payload: RecordedGamePlayerInput[] = trimmed.map((player, index) => ({
      // The API links the recorder seat to the signed-in user.
      user_id: player.is_recorder ? null : player.user_id,
      display_name: player.display_name,
      is_recorder: player.is_recorder,
      commander_name: player.commander_name || null,
      deck_name: player.deck_name.trim() || null,
      colors: sortColors(player.colors),
      is_winner: player.is_winner,
      seat_order: index,
      ending_life: player.ending_life,
    }));

    const playedAtIso = new Date(`${playedAt}T12:00:00`).toISOString();

    // A friend may already have recorded this game with you linked, or you
    // may have saved it before. Ask rather than double-count it.
    if (!skipDuplicateCheck) {
      const matches = findDuplicateCandidates(
        {
          played_at: playedAtIso,
          players: payload.map((player) => ({
            ...player,
            user_id: player.is_recorder ? userId : player.user_id,
          })),
        },
        existingGames.filter((other) => other.id !== game?.id)
      );
      if (matches.length > 0) {
        setDuplicateMatches(matches);
        return;
      }
    }
    setDuplicateMatches([]);

    const input = {
      played_at: playedAtIso,
      format,
      ended_on_turn:
        typeof endedOnTurn === "number"
          ? endedOnTurn
          : Number(endedOnTurn) || null,
      win_condition: winCondition || null,
      notes: notes.trim() || null,
      players: payload,
    };

    try {
      setSubmitting(true);
      if (game) {
        await updateRecordedGame(game.id, input);
        notifications.show({
          title: "Game updated",
          message: "Stats are updated.",
          color: "green",
        });
        router.push("/games");
      } else {
        await createRecordedGame(input);
        notifications.show({
          title: "Game recorded",
          message: "Stats are updated.",
          color: "green",
        });
        router.push("/stats");
      }
    } catch (error: unknown) {
      notifications.show({
        title: "Could not save game",
        message: (error as Error).message || "Try again.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Text c="dimmed">Sign in to record games and track your stats.</Text>
    );
  }

  if (!hydrated) {
    return <Text c="dimmed">Loading form…</Text>;
  }

  const winnerKey = players.find((player) => player.is_winner)?.key ?? null;

  return (
    <Stack gap="lg">
      <Card withBorder padding="lg">
        <Stack gap="md">
          <Title order={3}>Match details</Title>
          <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
            <TextInput
              label="Played on"
              type="date"
              value={playedAt}
              onChange={(event) => setPlayedAt(event.currentTarget.value)}
            />
            <Select
              label="Format"
              data={formatOptions}
              value={format}
              onChange={(value) =>
                setFormat((value as GameFormat) || "commander")
              }
            />
            <NumberInput
              label="Turn the game ended"
              placeholder="Optional"
              min={1}
              max={99}
              value={endedOnTurn}
              onChange={setEndedOnTurn}
            />
            <Select
              label="How it ended"
              placeholder="Optional"
              clearable
              data={winOptions}
              value={winCondition}
              onChange={(value) =>
                setWinCondition((value as WinCondition) || "")
              }
            />
          </SimpleGrid>
          <Textarea
            label="Notes"
            placeholder="Table talk, spicy lines, house rules…"
            minRows={2}
            value={notes}
            onChange={(event) => setNotes(event.currentTarget.value)}
          />
        </Stack>
      </Card>

      <Group justify="space-between">
        <Title order={3}>Players</Title>
        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={addPlayer}
          disabled={players.length >= 6}
        >
          Add player
        </Button>
      </Group>

      <Text size="sm" c="dimmed">
        Mark yourself, pick a winner (or leave it as a draw), and log each
        commander. Picking a suggested commander fills in its color identity; C
        means a colorless deck. Pick a friend from the name list and the game is
        added to their stats too.
      </Text>

      <Stack gap="md">
        {players.map((player, index) => (
          <Card key={player.key} withBorder padding="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={600}>Seat {index + 1}</Text>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label="Remove player"
                  disabled={players.length <= 2}
                  onClick={() => removePlayer(player.key)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
              <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
                {player.is_recorder ? (
                  <TextInput
                    label="Name"
                    placeholder="Your name"
                    value={player.display_name}
                    onChange={(event) =>
                      updatePlayer(player.key, {
                        display_name: event.currentTarget.value,
                      })
                    }
                    required
                  />
                ) : (
                  <FriendNameAutocomplete
                    value={player.display_name}
                    linkedFriendId={player.user_id}
                    friends={friends}
                    takenFriendIds={players
                      .filter((other) => other.key !== player.key)
                      .map((other) => other.user_id)
                      .filter((id): id is string => id !== null)}
                    onChange={(display_name, user_id) =>
                      updatePlayer(player.key, { display_name, user_id })
                    }
                  />
                )}
                <CommanderAutocomplete
                  value={player.commander_name}
                  onChange={(commander_name) =>
                    updatePlayer(player.key, { commander_name })
                  }
                  onColorIdentity={(colors) =>
                    updatePlayer(player.key, { colors })
                  }
                  recentCommanders={recentCommanders}
                  required={format === "commander"}
                />
                <TextInput
                  label="Deck name"
                  placeholder="Optional nickname"
                  value={player.deck_name}
                  onChange={(event) =>
                    updatePlayer(player.key, {
                      deck_name: event.currentTarget.value,
                    })
                  }
                />
                <NumberInput
                  label="Ending life"
                  placeholder="Optional"
                  value={player.ending_life ?? ""}
                  onChange={(value) =>
                    updatePlayer(player.key, {
                      ending_life: typeof value === "number" ? value : null,
                    })
                  }
                />
              </SimpleGrid>
              <Stack gap={6}>
                <Text size="sm" fw={500}>
                  Colors
                </Text>
                <ColorIdentityPicker
                  value={player.colors}
                  onChange={(colors) => updatePlayer(player.key, { colors })}
                  colorless={{
                    selected: player.colors.length === 0,
                    onSelect: () => updatePlayer(player.key, { colors: [] }),
                  }}
                />
              </Stack>
              <Group>
                <Switch
                  label="This is me"
                  checked={player.is_recorder}
                  onChange={() => markRecorder(player.key)}
                />
                <Switch
                  label="Winner"
                  checked={player.is_winner}
                  onChange={(event) =>
                    markWinner(event.currentTarget.checked ? player.key : null)
                  }
                />
                {winnerKey === null && (
                  <Text size="xs" c="dimmed">
                    No winner selected — recorded as a draw
                  </Text>
                )}
              </Group>
            </Stack>
          </Card>
        ))}
      </Stack>

      <Group justify="flex-end">
        <Button
          variant="subtle"
          onClick={() => router.push(game ? "/games" : "/stats")}
        >
          Cancel
        </Button>
        <Button onClick={() => handleSubmit()} loading={submitting}>
          {game ? "Save changes" : "Save game"}
        </Button>
      </Group>

      <Modal
        opened={duplicateMatches.length > 0}
        onClose={() => setDuplicateMatches([])}
        title="Is this game already recorded?"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            {duplicateMatches.length === 1
              ? "This looks like a game that is already in your log"
              : "This looks like games that are already in your log"}
            . Saving it again would count it twice in your stats.
          </Text>
          {duplicateMatches.map((game) => {
            const recorder = game.players.find((p) => p.is_recorder);
            return (
              <Card key={game.id} withBorder padding="sm">
                <Text size="sm" fw={600}>
                  {new Date(game.played_at).toLocaleDateString()} · recorded by{" "}
                  {game.recorded_by === userId
                    ? "you"
                    : recorder?.display_name ?? "a friend"}
                </Text>
                <Text size="xs" c="dimmed">
                  {game.players
                    .map((p) => p.commander_name || p.display_name)
                    .join(", ")}
                </Text>
              </Card>
            );
          })}
          <Group justify="flex-end">
            <Button
              variant="default"
              loading={submitting}
              onClick={() => handleSubmit({ skipDuplicateCheck: true })}
            >
              Save anyway
            </Button>
            <Button onClick={() => router.push("/games")}>
              {game ? "Discard my changes" : "Same game, don't save"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
