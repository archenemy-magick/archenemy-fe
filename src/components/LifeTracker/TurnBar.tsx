"use client";

import { useEffect, useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  Select,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconHourglass,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconX,
} from "@tabler/icons-react";
import {
  clockElapsedMs,
  formatDuration,
  isEliminated,
  isPaused,
  type TrackedPlayer,
  type TurnState,
} from "~/lib/lifeTracker/turns";
import { randomInt } from "~/lib/random";

type BarPlayer = TrackedPlayer & { name: string; color: string };

type TurnBarProps = {
  players: BarPlayer[];
  turn: TurnState | null | undefined;
  onStart: (firstPlayerId: string) => void;
  onStep: (direction: 1 | -1) => void;
  onSetPaused: (paused: boolean) => void;
  onStop: () => void;
};

const RANDOM = "random";
// On touchscreens a tap would leave the tooltip stuck open.
const HOVER_ONLY = { hover: true, focus: false, touch: false };

/** Re-renders every second while `active`, for live clocks. */
function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

export function TurnBar({
  players,
  turn,
  onStart,
  onStep,
  onSetPaused,
  onStop,
}: TurnBarProps) {
  const [firstChoice, setFirstChoice] = useState<string>(RANDOM);
  const paused = turn ? isPaused(turn) : true;
  const now = useNow(!!turn && !paused);

  if (!turn) {
    const alive = players.filter((p) => !isEliminated(p));
    const start = () => {
      const pick =
        firstChoice === RANDOM
          ? alive[randomInt(alive.length)]?.id
          : firstChoice;
      if (pick) onStart(pick);
    };
    return (
      <Card withBorder padding="xs">
        <Group gap="xs" wrap="wrap">
          <IconHourglass size={18} aria-hidden />
          <Text size="sm" fw={600}>
            Turns
          </Text>
          <Select
            size="xs"
            aria-label="First player"
            value={firstChoice}
            onChange={(value) => setFirstChoice(value ?? RANDOM)}
            data={[
              { value: RANDOM, label: "Random first player" },
              ...players.map((p) => ({
                value: p.id,
                label: `${p.name} goes first`,
              })),
            ]}
            allowDeselect={false}
            style={{ flex: 1, minWidth: 160 }}
          />
          <Button size="xs" onClick={start} disabled={alive.length === 0}>
            Start
          </Button>
        </Group>
      </Card>
    );
  }

  const active = players.find((p) => p.id === turn.activePlayerId);
  return (
    <Card
      withBorder
      padding="xs"
      style={{ borderColor: active?.color, borderWidth: 2 }}
    >
      {/* Wraps so the timers drop below the status on narrow phones. */}
      <Group justify="space-between" wrap="wrap" gap={4} mb={6}>
        <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
          <Box
            w={10}
            h={10}
            style={{
              borderRadius: "50%",
              background: active?.color,
              flexShrink: 0,
            }}
          />
          <Text size="sm" fw={700} aria-live="polite">
            Round {turn.round} · {active?.name ?? "?"}&apos;s turn
          </Text>
        </Group>
        <Text
          size="xs"
          c="dimmed"
          style={{ flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
        >
          Turn {formatDuration(clockElapsedMs(turn.turnClock, now))} · Game{" "}
          {formatDuration(clockElapsedMs(turn.gameClock, now))}
          {paused ? " · Paused" : ""}
        </Text>
      </Group>
      <Group gap={6} wrap="nowrap">
        <Tooltip label="Previous turn" withArrow events={HOVER_ONLY}>
          <ActionIcon
            variant="default"
            size="lg"
            aria-label="Previous turn"
            onClick={() => onStep(-1)}
          >
            <IconPlayerTrackPrev size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip
          label={paused ? "Resume timers" : "Pause timers"}
          withArrow
          events={HOVER_ONLY}
        >
          <ActionIcon
            variant="default"
            size="lg"
            aria-label={paused ? "Resume timers" : "Pause timers"}
            onClick={() => onSetPaused(!paused)}
          >
            {paused ? (
              <IconPlayerPlay size={18} />
            ) : (
              <IconPlayerPause size={18} />
            )}
          </ActionIcon>
        </Tooltip>
        <Button
          size="sm"
          rightSection={<IconPlayerTrackNext size={16} />}
          onClick={() => onStep(1)}
          style={{ flex: 1 }}
          color={active?.color}
        >
          End turn
        </Button>
        <Tooltip label="Stop tracking turns" withArrow events={HOVER_ONLY}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            aria-label="Stop tracking turns"
            onClick={onStop}
          >
            <IconX size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Card>
  );
}
