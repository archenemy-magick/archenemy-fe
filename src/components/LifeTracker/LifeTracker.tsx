// components/game/LifeTracker/LifeTracker.tsx
"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "~/store";
import {
  Stack,
  Title,
  Text,
  Button,
  Card,
  Group,
  SimpleGrid,
  ActionIcon,
  NumberInput,
  Modal,
  TextInput,
  Badge,
  Box,
  Menu,
} from "@mantine/core";
import {
  IconPlus,
  IconMinus,
  IconRefresh,
  IconUserPlus,
  IconUserMinus,
  IconSettings,
  IconSkull,
  IconHeartBroken,
  IconReload,
  IconUser,
  IconClipboardList,
  IconX,
  IconCheck,
  IconLayoutGrid,
} from "@tabler/icons-react";
import {
  initializeGame,
  newGame,
  addPlayer as addPlayerAction,
  removePlayer as removePlayerAction,
  adjustLife as adjustLifeAction,
  updateCommanderDamage as updateCommanderDamageAction,
  resetAllPlayers,
  updatePlayer as updatePlayerAction,
  updateDefaultStartingLife as updateDefaultStartingLifeAction,
  setLifeTrackerView,
} from "~/store/reducers";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveRecordGameDraft } from "~/lib/gameRecordDraft";
import { useHoldToRepeat } from "~/lib/hooks/useHoldToRepeat";
import {
  lifeTrackerLayout,
  type LifeTrackerView,
} from "~/lib/lifeTrackerLayout";

interface Player {
  id: string;
  name: string;
  life: number;
  startingLife: number;
  color: string;
  commanderDamage: Record<string, number>;
}

interface LifeTrackerProps {
  tabId?: string;
}

const DEFAULT_COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // orange
  "#8b5cf6", // purple
  "#ec4899", // pink
];

const PRESET_STARTING_LIFE = [20, 30, 40];

export function LifeTracker({ tabId = "default" }: LifeTrackerProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { username, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  // Get game state from Redux
  const game = useSelector(
    (state: RootState) => state.lifeTracker.games[tabId]
  );
  const players = game?.players || [];
  const defaultStartingLife = game?.defaultStartingLife || 40;
  const view: LifeTrackerView = game?.view ?? "same";
  const layout = lifeTrackerLayout(players.length, view);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [commanderDamageModalOpen, setCommanderDamageModalOpen] =
    useState(false);
  const [selectedPlayerForCommander, setSelectedPlayerForCommander] = useState<
    string | null
  >(null);

  // Tap = ±1, hold = ±10 every half second. One hook per area; each button
  // (keyed by player/side) has its own timers, so several people can press
  // at once. See useHoldToRepeat for how holds are guaranteed to stop.
  const lifeHold = useHoldToRepeat();
  const commanderHold = useHoldToRepeat();

  // Removing a player loses their life total and commander damage, so ask.
  const [pendingRemoval, setPendingRemoval] = useState<Player | null>(null);

  // Initialize game on mount
  useEffect(() => {
    if (!game) {
      dispatch(initializeGame({ tabId, defaultStartingLife: 40 }));
    }
  }, [dispatch, game, tabId]);

  // Handlers
  const handleAddPlayer = () => {
    if (players.length >= 6) return;
    dispatch(addPlayerAction(tabId));
  };

  const handleRemovePlayer = (playerId: string) => {
    if (players.length <= 2) return;
    setPendingRemoval(players.find((p) => p.id === playerId) ?? null);
  };

  const confirmRemovePlayer = () => {
    if (pendingRemoval) {
      lifeHold.cancelAll();
      dispatch(removePlayerAction({ tabId, playerId: pendingRemoval.id }));
    }
    setPendingRemoval(null);
  };

  const adjustLife = (playerId: string, amount: number) => {
    dispatch(adjustLifeAction({ tabId, playerId, amount }));
  };

  const updateCommanderDamage = (
    targetPlayerId: string,
    sourcePlayerId: string,
    amount: number
  ) => {
    dispatch(
      updateCommanderDamageAction({
        tabId,
        targetPlayerId,
        sourcePlayerId,
        amount,
      })
    );
  };

  const handleNewGame = () => {
    dispatch(newGame(tabId));
  };

  const handleRecordGame = () => {
    const normalizedUsername = username?.trim().toLowerCase();
    const matchingIndex = players.findIndex(
      (player) =>
        !!normalizedUsername &&
        player.name.trim().toLowerCase() === normalizedUsername
    );
    const recorderIndex = matchingIndex >= 0 ? matchingIndex : 0;

    saveRecordGameDraft({
      format: defaultStartingLife >= 40 ? "commander" : "other",
      players: players.map((player, index) => ({
        displayName: player.name,
        endingLife: player.life,
        isRecorder: index === recorderIndex,
      })),
    });
    router.push("/games/record");
  };

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    dispatch(updatePlayerAction({ tabId, player: updatedPlayer }));
    setEditingPlayer(null);
  };

  const handleUpdateDefaultStartingLife = (startingLife: number) => {
    dispatch(updateDefaultStartingLifeAction({ tabId, startingLife }));
  };

  const lifeKey = (playerId: string, side: "left" | "right") =>
    `${playerId}:${side}`;
  const bindLife = (playerId: string, side: "left" | "right") => {
    const step = side === "left" ? -1 : 1;
    return lifeHold.bind(lifeKey(playerId, side), {
      onTap: () => adjustLife(playerId, step),
      onRepeat: () => adjustLife(playerId, step * 10),
    });
  };

  const commanderKey = (sourceId: string, direction: "increase" | "decrease") =>
    `${sourceId}:${direction}`;
  const bindCommander = (
    targetPlayerId: string,
    sourceId: string,
    direction: "increase" | "decrease"
  ) => {
    const step = direction === "decrease" ? -1 : 1;
    return commanderHold.bind(commanderKey(sourceId, direction), {
      onTap: () => updateCommanderDamage(targetPlayerId, sourceId, step),
      onRepeat: () =>
        updateCommanderDamage(targetPlayerId, sourceId, step * 10),
    });
  };

  const openCommanderDamageModal = (playerId: string) => {
    setSelectedPlayerForCommander(playerId);
    setCommanderDamageModalOpen(true);
  };

  const selectedPlayer = selectedPlayerForCommander
    ? players.find((p) => p.id === selectedPlayerForCommander)
    : null;

  const hasLethalCommanderDamage = (player: Player) => {
    return Object.values(player.commanderDamage).some((damage) => damage >= 21);
  };

  const isDead = (player: Player) => {
    return player.life <= 0 || hasLethalCommanderDamage(player);
  };

  if (!game) {
    return null; // Loading or initializing
  }

  return (
    <>
      <style>
        {`
          @keyframes lifeTrackerFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes lifeTrackerFadeIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>

      <Stack gap="xs" p="xs">
        {/* Header */}
        <Group justify="space-between" wrap="wrap" gap="xs">
          <div>
            <Title order={2} size="sm">
              Life Tracker
            </Title>
            <Text size="sm" c="dimmed">
              Tap ±1 • Hold 1s for continuous ±10
            </Text>
          </div>

          <Group gap="xs">
            {/* View Menu */}
            <Menu shadow="md" width={240} position="bottom-end">
              <Menu.Target>
                <Button
                  leftSection={<IconLayoutGrid size={18} />}
                  variant="light"
                  color="gray"
                  size="sm"
                >
                  View
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Card direction</Menu.Label>
                {(
                  [
                    {
                      value: "same",
                      label: "All face the same way",
                      hint: "Phone held by one player",
                    },
                    {
                      value: "outward",
                      label: "Face outwards",
                      hint: "Phone flat in the middle of the table",
                    },
                  ] as const
                ).map((option) => (
                  <Menu.Item
                    key={option.value}
                    onClick={() =>
                      dispatch(
                        setLifeTrackerView({ tabId, view: option.value })
                      )
                    }
                    rightSection={
                      view === option.value ? <IconCheck size={16} /> : null
                    }
                  >
                    <Text size="sm">{option.label}</Text>
                    <Text size="xs" c="dimmed">
                      {option.hint}
                    </Text>
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>

            {/* Actions Menu */}
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Button
                  leftSection={<IconSettings size={18} />}
                  variant="light"
                  color="gray"
                  size="sm"
                >
                  Actions
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Life Tracker Controls</Menu.Label>

                <Menu.Item
                  leftSection={<IconUserPlus size={16} />}
                  onClick={handleAddPlayer}
                  disabled={players.length >= 6}
                  color="green"
                >
                  Add Player {players.length < 6 && `(${players.length}/6)`}
                </Menu.Item>

                {/* Remove Player Submenu */}
                {players.length > 2 && (
                  <Menu
                    trigger="hover"
                    position="right-start"
                    offset={2}
                    withArrow
                  >
                    <Menu.Target>
                      <Menu.Item
                        leftSection={<IconUserMinus size={16} />}
                        rightSection="›"
                        color="red"
                      >
                        Remove Player
                      </Menu.Item>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>Select Player</Menu.Label>
                      {players.map((player) => (
                        <Menu.Item
                          key={player.id}
                          leftSection={<IconUser size={14} />}
                          onClick={() => handleRemovePlayer(player.id)}
                          color="red"
                        >
                          {player.name}
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                )}

                <Menu.Divider />

                <Menu.Item
                  leftSection={<IconReload size={16} />}
                  onClick={handleNewGame}
                  color="orange"
                >
                  New Game
                </Menu.Item>

                <Menu.Item
                  leftSection={<IconClipboardList size={16} />}
                  onClick={handleRecordGame}
                  color="grape"
                >
                  {/* Signed-out users go through sign-in; the draft is kept. */}
                  {isAuthenticated ? "Record Game" : "Record Game (sign in)"}
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  leftSection={<IconSettings size={16} />}
                  onClick={() => setSettingsOpen(true)}
                >
                  Settings
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Player Cards */}
        <SimpleGrid cols={layout.cols} spacing="xs">
          {players.map((player, index) => {
            // In "outward" view the top rows face the far side of the table.
            const flipped = layout.isFlipped(index);
            const totalCommanderDamage = Object.values(
              player.commanderDamage
            ).reduce((sum, dmg) => sum + dmg, 0);
            const hasLethal = hasLethalCommanderDamage(player);
            const isPlayerDead = isDead(player);

            return (
              <Card
                key={player.id}
                shadow="sm"
                padding={0}
                withBorder
                style={{
                  borderColor: hasLethal ? "#ef4444" : player.color,
                  borderWidth: hasLethal ? 3 : 2,
                  overflow: "hidden",
                  position: "relative",
                  opacity: isPlayerDead ? 0.6 : 1,
                  filter: isPlayerDead ? "grayscale(50%)" : "none",
                  transform: flipped ? "rotate(180deg)" : undefined,
                  transition: "all 0.3s ease",
                }}
              >
                {/* Death Overlay */}
                {isPlayerDead && (
                  <Box
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 5,
                    }}
                  >
                    <Box
                      style={{
                        animation:
                          "lifeTrackerFadeIn 0.5s ease-out, lifeTrackerFloat 2s ease-in-out infinite",
                      }}
                    >
                      <IconHeartBroken
                        size={32}
                        color="#ef4444"
                        opacity={0.8}
                      />
                    </Box>
                  </Box>
                )}

                {/* Player Info Header */}
                <Box
                  p={4}
                  style={{
                    backgroundColor: player.color,
                    color: "white",
                  }}
                >
                  <Group justify="space-between" wrap="nowrap" gap={4}>
                    <Text
                      fw={600}
                      size="sm"
                      style={{ cursor: "pointer" }}
                      onClick={() => setEditingPlayer(player)}
                      truncate
                    >
                      {player.name}
                    </Text>
                    <Group gap={2}>
                      {totalCommanderDamage > 0 && (
                        <Badge
                          size="xs"
                          color={hasLethal ? "red" : "gray"}
                          variant="light"
                          style={{ cursor: "pointer" }}
                          onClick={() => openCommanderDamageModal(player.id)}
                          leftSection={<IconSkull size={10} />}
                        >
                          {totalCommanderDamage}
                        </Badge>
                      )}
                      {players.length > 2 && (
                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          color="white"
                          aria-label={`Remove ${player.name}`}
                          title={`Remove ${player.name}`}
                          onClick={() => handleRemovePlayer(player.id)}
                        >
                          {/* Not a minus: that read as "lose life". */}
                          <IconX size={12} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Group>
                </Box>

                {/* Life Display with Split Touch Areas */}
                <Box style={{ position: "relative", height: "140px" }}>
                  <Group gap={0} wrap="nowrap" style={{ height: "100%" }}>
                    {/* Left Side - Decrease */}
                    <Box
                      style={{
                        flex: 1,
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        backgroundColor: lifeHold.isActive(
                          lifeKey(player.id, "left")
                        )
                          ? "rgba(239, 68, 68, 0.2)"
                          : "rgba(239, 68, 68, 0.05)",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        WebkitTouchCallout: "none",
                        // No double-tap zoom; a scroll gesture cancels the hold.
                        touchAction: "manipulation",
                        transition: "background-color 0.15s ease",
                      }}
                      {...bindLife(player.id, "left")}
                    >
                      <IconMinus
                        size={24}
                        color="#ef4444"
                        opacity={
                          lifeHold.isActive(lifeKey(player.id, "left"))
                            ? 0.8
                            : 0.3
                        }
                        style={{ transition: "opacity 0.15s ease" }}
                      />
                    </Box>

                    {/* Right Side - Increase */}
                    <Box
                      style={{
                        flex: 1,
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        backgroundColor: lifeHold.isActive(
                          lifeKey(player.id, "right")
                        )
                          ? "rgba(16, 185, 129, 0.2)"
                          : "rgba(16, 185, 129, 0.05)",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        WebkitTouchCallout: "none",
                        // No double-tap zoom; a scroll gesture cancels the hold.
                        touchAction: "manipulation",
                        transition: "background-color 0.15s ease",
                      }}
                      {...bindLife(player.id, "right")}
                    >
                      <IconPlus
                        size={24}
                        color="#10b981"
                        opacity={
                          lifeHold.isActive(lifeKey(player.id, "right"))
                            ? 0.8
                            : 0.3
                        }
                        style={{ transition: "opacity 0.15s ease" }}
                      />
                    </Box>
                  </Group>

                  {/* Center - Life Total (Overlay) */}
                  <Box
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                      textAlign: "center",
                    }}
                  >
                    <Text
                      size="3rem"
                      fw={900}
                      style={{
                        lineHeight: 1,
                        color: player.life <= 0 ? "#ef4444" : player.color,
                        textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      {player.life}
                    </Text>
                  </Box>
                </Box>

                {/* Commander Damage Button */}
                <Box p={4}>
                  <Button
                    fullWidth
                    size="xs"
                    variant="light"
                    color={hasLethal ? "red" : "gray"}
                    leftSection={<IconSkull size={12} />}
                    onClick={() => openCommanderDamageModal(player.id)}
                    styles={{
                      root: {
                        fontSize: "0.65rem",
                        height: "24px",
                        padding: "0 8px",
                      },
                      label: {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    Cmdr{" "}
                    {totalCommanderDamage > 0 && `(${totalCommanderDamage})`}
                  </Button>
                </Box>
              </Card>
            );
          })}
        </SimpleGrid>

        {/* Settings Modal */}
        <Modal
          opened={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          title="Settings"
          centered
        >
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Default Starting Life
            </Text>
            <Group>
              {PRESET_STARTING_LIFE.map((life) => (
                <Button
                  key={life}
                  variant={defaultStartingLife === life ? "filled" : "light"}
                  onClick={() => handleUpdateDefaultStartingLife(life)}
                >
                  {life}
                </Button>
              ))}
            </Group>
            <NumberInput
              label="Custom Starting Life"
              value={defaultStartingLife}
              onChange={(val) =>
                typeof val === "number" && handleUpdateDefaultStartingLife(val)
              }
              min={1}
              max={999}
            />
          </Stack>
        </Modal>

        {/* Edit Player Modal */}
        <Modal
          opened={editingPlayer !== null}
          onClose={() => setEditingPlayer(null)}
          title="Edit Player"
          centered
        >
          {editingPlayer && (
            <Stack gap="md">
              <TextInput
                label="Player Name"
                value={editingPlayer.name}
                onChange={(e) =>
                  setEditingPlayer({
                    ...editingPlayer,
                    name: e.currentTarget.value,
                  })
                }
              />
              <NumberInput
                label="Starting Life"
                value={editingPlayer.startingLife}
                onChange={(val) =>
                  typeof val === "number" &&
                  setEditingPlayer({
                    ...editingPlayer,
                    startingLife: val,
                  })
                }
                min={1}
                max={999}
              />
              <div>
                <Text size="sm" fw={500} mb="xs">
                  Player Color
                </Text>
                <Group gap="xs">
                  {DEFAULT_COLORS.map((color) => (
                    <ActionIcon
                      key={color}
                      size="lg"
                      radius="xl"
                      variant={
                        editingPlayer.color === color ? "filled" : "light"
                      }
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        setEditingPlayer({ ...editingPlayer, color })
                      }
                    >
                      {editingPlayer.color === color && "✓"}
                    </ActionIcon>
                  ))}
                </Group>
              </div>
              <Group justify="flex-end" mt="md">
                <Button
                  variant="default"
                  onClick={() => setEditingPlayer(null)}
                >
                  Cancel
                </Button>
                <Button onClick={() => handleUpdatePlayer(editingPlayer)}>
                  Save
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>

        {/* Remove Player Confirmation */}
        <Modal
          opened={pendingRemoval !== null}
          onClose={() => setPendingRemoval(null)}
          title={`Remove ${pendingRemoval?.name ?? "player"}?`}
          centered
          size="sm"
        >
          <Text size="sm" mb="lg">
            Their life total and commander damage will be lost.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setPendingRemoval(null)}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmRemovePlayer}>
              Remove
            </Button>
          </Group>
        </Modal>

        {/* Commander Damage Modal */}
        <Modal
          opened={commanderDamageModalOpen}
          onClose={() => {
            setCommanderDamageModalOpen(false);
            commanderHold.cancelAll(); // Clean up any active holds
          }}
          title={`Commander Damage to ${selectedPlayer?.name}`}
          centered
          size="sm"
        >
          {selectedPlayer && (
            <Stack gap="xs">
              <Text size="xs" c="dimmed" ta="center">
                Tap ±1 • Hold 1s for continuous ±10
              </Text>
              {players
                .filter((p) => p.id !== selectedPlayer.id)
                .map((source) => {
                  const damage = selectedPlayer.commanderDamage[source.id] || 0;
                  const isLethal = damage >= 21;
                  const isDecreaseActive = commanderHold.isActive(
                    commanderKey(source.id, "decrease")
                  );
                  const isIncreaseActive = commanderHold.isActive(
                    commanderKey(source.id, "increase")
                  );

                  return (
                    <Card
                      key={source.id}
                      padding="sm"
                      withBorder
                      style={{
                        borderColor: isLethal ? "#ef4444" : undefined,
                        borderWidth: isLethal ? 2 : 1,
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="xs">
                          <Box
                            w={16}
                            h={16}
                            style={{
                              backgroundColor: source.color,
                              borderRadius: "50%",
                            }}
                          />
                          <Text size="sm" fw={500}>
                            {source.name}
                          </Text>
                          {isLethal && (
                            <Badge size="xs" color="red" variant="filled">
                              LETHAL
                            </Badge>
                          )}
                        </Group>

                        <Group gap="xs" wrap="nowrap">
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="lg"
                            disabled={damage === 0}
                            style={{
                              backgroundColor: isDecreaseActive
                                ? "rgba(239, 68, 68, 0.2)"
                                : undefined,
                              transition: "background-color 0.15s ease",
                            }}
                            {...bindCommander(
                              selectedPlayer.id,
                              source.id,
                              "decrease"
                            )}
                          >
                            <IconMinus size={18} />
                          </ActionIcon>

                          <Text
                            size="2rem"
                            fw={700}
                            style={{
                              minWidth: "4rem",
                              textAlign: "center",
                              color: isLethal ? "#ef4444" : source.color,
                            }}
                          >
                            {damage}
                          </Text>

                          <ActionIcon
                            variant="light"
                            color="green"
                            size="lg"
                            style={{
                              backgroundColor: isIncreaseActive
                                ? "rgba(16, 185, 129, 0.2)"
                                : undefined,
                              transition: "background-color 0.15s ease",
                            }}
                            {...bindCommander(
                              selectedPlayer.id,
                              source.id,
                              "increase"
                            )}
                          >
                            <IconPlus size={18} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Card>
                  );
                })}
            </Stack>
          )}
        </Modal>
      </Stack>
    </>
  );
}
