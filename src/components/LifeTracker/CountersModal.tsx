"use client";

import {
  ActionIcon,
  Badge,
  Card,
  Divider,
  Group,
  Modal,
  Stack,
  Switch,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useHoldToRepeat } from "~/lib/hooks/useHoldToRepeat";
import {
  PLAYER_COUNTERS,
  TABLE_ROLES,
  type CounterKey,
  type PlayerCounters,
  type TableRole,
} from "~/lib/lifeTracker/counters";
import { LETHAL_POISON } from "~/lib/lifeTracker/turns";

type CountersModalProps = {
  player: { id: string; name: string; counters?: PlayerCounters } | null;
  roles: Partial<Record<TableRole, string | null>>;
  roleHolderName: (playerId: string) => string | undefined;
  onAdjust: (counter: CounterKey, amount: number) => void;
  onSetRole: (role: TableRole, holds: boolean) => void;
  onClose: () => void;
};

export function CountersModal({
  player,
  roles,
  roleHolderName,
  onAdjust,
  onSetRole,
  onClose,
}: CountersModalProps) {
  // Counters are small numbers, so holding steps by 1 rather than 10.
  const hold = useHoldToRepeat({ delayMs: 600, intervalMs: 250 });

  const close = () => {
    hold.cancelAll();
    onClose();
  };

  return (
    <Modal
      opened={player !== null}
      onClose={close}
      title={player ? `${player.name}'s counters` : undefined}
      centered
    >
      {player ? (
        <Stack gap="sm">
          {PLAYER_COUNTERS.map((counter) => {
            const value = player.counters?.[counter.key] ?? 0;
            const Icon = counter.icon;
            const lethal = counter.key === "poison" && value >= LETHAL_POISON;
            const bind = (step: 1 | -1) =>
              hold.bind(`${counter.key}:${step}`, {
                onTap: () => onAdjust(counter.key, step),
                onRepeat: () => onAdjust(counter.key, step),
              });
            return (
              <Card key={counter.key} withBorder padding="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                    <ThemeIcon
                      variant="light"
                      color={counter.color}
                      radius="md"
                    >
                      <Icon size={18} />
                    </ThemeIcon>
                    <div style={{ minWidth: 0 }}>
                      <Group gap={6}>
                        <Text fw={600} size="sm">
                          {counter.label}
                        </Text>
                        {lethal ? (
                          <Badge size="xs" color="red" variant="filled">
                            Lethal
                          </Badge>
                        ) : null}
                      </Group>
                      {counter.key === "commanderCasts" ? (
                        <Text size="xs" c="dimmed">
                          {value} cast{value === 1 ? "" : "s"} · tax +
                          {value * 2}
                        </Text>
                      ) : counter.hint ? (
                        <Text size="xs" c="dimmed">
                          {counter.hint}
                        </Text>
                      ) : null}
                    </div>
                  </Group>
                  <Group gap="xs" wrap="nowrap">
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="lg"
                      aria-label={`Remove ${counter.label.toLowerCase()}`}
                      disabled={value === 0}
                      style={{ touchAction: "manipulation" }}
                      {...bind(-1)}
                    >
                      <IconMinus size={18} />
                    </ActionIcon>
                    <Text
                      fw={700}
                      size="xl"
                      w={36}
                      ta="center"
                      c={lethal ? "red" : undefined}
                      aria-live="polite"
                    >
                      {value}
                    </Text>
                    <ActionIcon
                      variant="light"
                      color="green"
                      size="lg"
                      aria-label={`Add ${counter.label.toLowerCase()}`}
                      style={{ touchAction: "manipulation" }}
                      {...bind(1)}
                    >
                      <IconPlus size={18} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            );
          })}

          <Divider label="Table" labelPosition="left" />

          {TABLE_ROLES.map((role) => {
            const holderId = roles[role.key] ?? null;
            const holds = holderId === player.id;
            const Icon = role.icon;
            const elsewhere =
              holderId && !holds ? roleHolderName(holderId) : undefined;
            return (
              <Group key={role.key} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon variant="light" color={role.color} radius="md">
                    <Icon size={18} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="sm">
                      {role.label}
                    </Text>
                    {elsewhere ? (
                      <Text size="xs" c="dimmed">
                        Currently {elsewhere}; switching takes it from them.
                      </Text>
                    ) : null}
                  </div>
                </Group>
                <Switch
                  checked={holds}
                  onChange={(event) =>
                    onSetRole(role.key, event.currentTarget.checked)
                  }
                  aria-label={`${player.name} has ${role.label.toLowerCase()}`}
                />
              </Group>
            );
          })}
        </Stack>
      ) : null}
    </Modal>
  );
}
