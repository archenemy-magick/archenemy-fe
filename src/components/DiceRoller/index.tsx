"use client";

import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import {
  IconDice5,
  IconPlanet,
  IconTornado,
  IconTrash,
} from "@tabler/icons-react";
import {
  MAX_DICE_PER_ROLL,
  PLANAR_FACES,
  rollDice,
  rollLabel,
  STANDARD_DICE,
  type DieKind,
  type DieResult,
  type Roll,
} from "~/lib/dice";
import { randomInt } from "~/lib/random";

const DIE_OPTIONS: { value: string; label: string }[] = [
  ...STANDARD_DICE.map((sides) => ({
    value: String(sides),
    label: `d${sides}`,
  })),
  { value: "planar", label: "Planar" },
];

const HISTORY_LIMIT = 20;
const TUMBLE_MS = 450;

function parseDie(value: string): DieKind {
  return value === "planar" ? "planar" : (Number(value) as DieKind);
}

function Face({ result, tumbling }: { result: DieResult; tumbling: boolean }) {
  const base: React.CSSProperties = {
    width: 72,
    height: 72,
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid var(--mantine-color-default-border)",
    background: "var(--mantine-color-default)",
    opacity: tumbling ? 0.6 : 1,
    transition: "opacity 0.15s ease",
  };

  if (result.kind === "standard") {
    return (
      <Box style={base} aria-label={`${result.value}`}>
        <Text fw={800} size="1.75rem" lh={1}>
          {result.value}
        </Text>
        <Text size="xs" c="dimmed">
          d{result.sides}
        </Text>
      </Box>
    );
  }

  const planar = {
    blank: { icon: null, label: "Blank", color: undefined },
    planeswalk: {
      icon: <IconPlanet size={30} />,
      label: "Planeswalk",
      color: "var(--mantine-color-grape-5)",
    },
    chaos: {
      icon: <IconTornado size={30} />,
      label: "Chaos",
      color: "var(--mantine-color-orange-5)",
    },
  }[result.face];

  return (
    <Box
      style={{
        ...base,
        width: 96,
        ...(planar.color ? { borderColor: planar.color } : {}),
        color: planar.color,
      }}
      aria-label={planar.label}
    >
      {planar.icon}
      <Text size="xs" fw={700} mt={planar.icon ? 4 : 0}>
        {planar.label}
      </Text>
    </Box>
  );
}

function summarize(roll: Roll): string {
  if (roll.total === null) {
    const counts = roll.results.reduce<Record<string, number>>((acc, r) => {
      if (r.kind === "planar") acc[r.face] = (acc[r.face] ?? 0) + 1;
      return acc;
    }, {});
    return PLANAR_FACES.filter((f, i, all) => all.indexOf(f) === i)
      .filter((face) => counts[face])
      .map((face) => `${counts[face]} ${face}`)
      .join(", ");
  }
  const values = roll.results.map((r) => (r.kind === "standard" ? r.value : 0));
  return values.length > 1
    ? `${values.join(" + ")} = ${roll.total}`
    : String(roll.total);
}

export default function DiceRoller() {
  const reduceMotion = useReducedMotion();
  const [dieValue, setDieValue] = useState("20");
  const [count, setCount] = useState(1);
  const [current, setCurrent] = useState<Roll | null>(null);
  const [tumbling, setTumbling] = useState<DieResult[] | null>(null);
  const [history, setHistory] = useState<Roll[]>([]);
  const tumbleTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (tumbleTimer.current) clearInterval(tumbleTimer.current);
    },
    []
  );

  const die = parseDie(dieValue);

  const handleRoll = () => {
    const roll = rollDice(die, count);
    if (tumbleTimer.current) clearInterval(tumbleTimer.current);

    const finish = () => {
      setTumbling(null);
      setCurrent(roll);
      setHistory((prev) => [roll, ...prev].slice(0, HISTORY_LIMIT));
    };

    if (reduceMotion) {
      finish();
      return;
    }

    // Brief tumble of throwaway faces, then the real result.
    const startedAt = Date.now();
    setCurrent(roll);
    tumbleTimer.current = setInterval(() => {
      if (Date.now() - startedAt >= TUMBLE_MS) {
        if (tumbleTimer.current) clearInterval(tumbleTimer.current);
        tumbleTimer.current = null;
        finish();
        return;
      }
      setTumbling(rollDice(die, count, randomInt).results);
    }, 60);
  };

  const shown = tumbling ?? current?.results ?? null;

  return (
    <Stack gap="md" p="xs">
      <div>
        <Title order={2} size="sm">
          Dice Roller
        </Title>
        <Text size="sm" c="dimmed">
          Fair rolls from your browser&apos;s secure random generator.
        </Text>
      </div>

      <Card withBorder padding="md">
        <Stack gap="md">
          {/* Wraps on narrow phones; a SegmentedControl cut off "Planar". */}
          <SimpleGrid
            cols={{ base: 4, xs: 7 }}
            spacing={6}
            role="radiogroup"
            aria-label="Die type"
          >
            {DIE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                role="radio"
                aria-checked={dieValue === option.value}
                variant={dieValue === option.value ? "filled" : "default"}
                size="sm"
                px={4}
                onClick={() => setDieValue(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </SimpleGrid>

          <Group justify="space-between" wrap="wrap" gap="sm">
            <Group gap="xs">
              <Text size="sm" fw={500}>
                Dice
              </Text>
              <Button
                variant="default"
                size="compact-md"
                onClick={() => setCount((c) => Math.max(1, c - 1))}
                disabled={count <= 1}
                aria-label="Fewer dice"
              >
                −
              </Button>
              <Text fw={700} w={24} ta="center" aria-live="polite">
                {count}
              </Text>
              <Button
                variant="default"
                size="compact-md"
                onClick={() =>
                  setCount((c) => Math.min(MAX_DICE_PER_ROLL, c + 1))
                }
                disabled={count >= MAX_DICE_PER_ROLL}
                aria-label="More dice"
              >
                +
              </Button>
            </Group>
            <Button
              size="md"
              leftSection={<IconDice5 size={20} />}
              onClick={handleRoll}
            >
              Roll {rollLabel(die, count)}
            </Button>
          </Group>

          <Box
            mih={120}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-live="polite"
          >
            {shown ? (
              shown.map((result, index) => (
                <Face key={index} result={result} tumbling={!!tumbling} />
              ))
            ) : (
              <Text c="dimmed" size="sm">
                Pick a die and roll.
              </Text>
            )}
          </Box>

          {current && !tumbling && current.total !== null && count > 1 ? (
            <Text ta="center" fw={700} size="lg">
              Total: {current.total}
            </Text>
          ) : null}
        </Stack>
      </Card>

      <Card withBorder padding="md">
        <Group justify="space-between" mb="xs">
          <Text fw={600} size="sm">
            History
          </Text>
          {history.length > 0 ? (
            <Button
              variant="subtle"
              color="gray"
              size="compact-xs"
              leftSection={<IconTrash size={12} />}
              onClick={() => setHistory([])}
            >
              Clear
            </Button>
          ) : null}
        </Group>
        {history.length === 0 ? (
          <Text size="sm" c="dimmed">
            Your recent rolls will show up here.
          </Text>
        ) : (
          <ScrollArea.Autosize mah={220}>
            <Stack gap={6}>
              {history.map((roll) => (
                <Group key={roll.id} gap="xs" wrap="nowrap">
                  <Badge variant="light" miw={72} style={{ flexShrink: 0 }}>
                    {rollLabel(roll.die, roll.results.length)}
                  </Badge>
                  <Text size="sm" style={{ flex: 1 }}>
                    {summarize(roll)}
                  </Text>
                  <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                    {new Date(roll.timestamp).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </Group>
              ))}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Card>
    </Stack>
  );
}
