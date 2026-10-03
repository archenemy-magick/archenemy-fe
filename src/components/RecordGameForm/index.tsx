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
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { ColorIdentityPicker } from "~/components/ColorIdentityPicker";
import { CommanderAutocomplete } from "~/components/CommanderAutocomplete";
import { getFriends } from "~/lib/api/friends";
import type { PublicProfile } from "~/lib/api/publicProfiles";
import { createRecordedGame, getRecordedGames } from "~/lib/api/recordedGames";
import { consumeRecordGameDraft } from "~/lib/gameRecordDraft";
import { sortColors } from "~/lib/mtgColors";
import type { RootState } from "~/store";
import {
  FORMAT_LABELS,
  GAME_FORMATS,
  type GameFormat,
  type MtgColor,
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

export function RecordGameForm() {
  const router = useRouter();
  const { username, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const [playedAt, setPlayedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
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

  // Link seats whose names (e.g. from the Life Tracker) match a friend.
  useEffect(() => {
    if (!hydrated || friends.length === 0) return;
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
  }, [hydrated, friends]);

  // Offer commanders from past games first, most frequent first.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getRecordedGames()
      .then((games) => {
        if (cancelled) return;
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
  }, [username]);

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

  const handleSubmit = async () => {
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

    try {
      setSubmitting(true);
      await createRecordedGame({
        played_at: new Date(`${playedAt}T12:00:00`).toISOString(),
        format,
        ended_on_turn:
          typeof endedOnTurn === "number"
            ? endedOnTurn
            : Number(endedOnTurn) || null,
        win_condition: winCondition || null,
        notes: notes.trim() || null,
        players: payload,
      });
      notifications.show({
        title: "Game recorded",
        message: "Stats are updated.",
        color: "green",
      });
      router.push("/stats");
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
        commander. Picking a suggested commander fills in its color identity.
        Pick a friend from the name list and the game is added to their stats
        too.
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
        <Button variant="subtle" onClick={() => router.push("/stats")}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={submitting}>
          Save game
        </Button>
      </Group>
    </Stack>
  );
}
