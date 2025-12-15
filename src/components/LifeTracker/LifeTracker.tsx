// components/game/LifeTracker/LifeTracker.tsx
"use client";

import { useEffect, useRef } from "react";
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
} from "~/store/reducers";
import { useState } from "react";

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

  // Get game state from Redux
  const game = useSelector(
    (state: RootState) => state.lifeTracker.games[tabId]
  );
  const players = game?.players || [];
  const defaultStartingLife = game?.defaultStartingLife || 40;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [commanderDamageModalOpen, setCommanderDamageModalOpen] =
    useState(false);
  const [selectedPlayerForCommander, setSelectedPlayerForCommander] = useState<
    string | null
  >(null);

  // Life hold detection
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wasHeldRef = useRef(false);
  const [activeButton, setActiveButton] = useState<{
    playerId: string;
    side: "left" | "right";
  } | null>(null);

  // Commander damage hold detection
  const commanderHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
  const commanderHoldIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const commanderWasHeldRef = useRef(false);
  const [activeCommanderButton, setActiveCommanderButton] = useState<{
    sourceId: string;
    direction: "increase" | "decrease";
  } | null>(null);

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
    dispatch(removePlayerAction({ tabId, playerId }));
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

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    dispatch(updatePlayerAction({ tabId, player: updatedPlayer }));
    setEditingPlayer(null);
  };

  const handleUpdateDefaultStartingLife = (startingLife: number) => {
    dispatch(updateDefaultStartingLifeAction({ tabId, startingLife }));
  };

  // Touch detection to prevent double events
  const isTouchRef = useRef(false);
  const isCommanderTouchRef = useRef(false);

  // Life hold handlers - Continuous adjustment
  const handlePressStart = (
    playerId: string,
    amount: number,
    side: "left" | "right"
  ) => {
    // CRITICAL: Always cancel any existing hold first, regardless of which side
    handlePressCancel();

    // Small delay to ensure state is clean
    setTimeout(() => {
      wasHeldRef.current = false;
      setActiveButton({ playerId, side });

      holdTimerRef.current = setTimeout(() => {
        wasHeldRef.current = true;
        adjustLife(playerId, amount * 10);

        holdIntervalRef.current = setInterval(() => {
          adjustLife(playerId, amount * 10);
        }, 500);
      }, 1000);
    }, 10);
  };

  const handlePressEnd = (playerId: string, amount: number) => {
    // Save the held state BEFORE clearing timers
    const wasHeld = wasHeldRef.current;

    // Clear timers
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }

    // Reset state
    wasHeldRef.current = false;
    setActiveButton(null);

    // Only adjust life if this wasn't a hold
    if (!wasHeld) {
      adjustLife(playerId, amount);
    }
  };

  const handlePressCancel = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }

    holdTimerRef.current = null;
    holdIntervalRef.current = null;
    wasHeldRef.current = false;
    setActiveButton(null);
  };

  // Commander damage hold handlers
  const handleCommanderPressStart = (
    targetPlayerId: string,
    sourcePlayerId: string,
    amount: number,
    direction: "increase" | "decrease"
  ) => {
    // Clear any existing commander timers first
    if (commanderHoldTimerRef.current) {
      clearTimeout(commanderHoldTimerRef.current);
    }
    if (commanderHoldIntervalRef.current) {
      clearInterval(commanderHoldIntervalRef.current);
    }

    commanderHoldTimerRef.current = null;
    commanderHoldIntervalRef.current = null;
    commanderWasHeldRef.current = false;
    setActiveCommanderButton({ sourceId: sourcePlayerId, direction });

    commanderHoldTimerRef.current = setTimeout(() => {
      commanderWasHeldRef.current = true;
      updateCommanderDamage(targetPlayerId, sourcePlayerId, amount * 10);

      commanderHoldIntervalRef.current = setInterval(() => {
        updateCommanderDamage(targetPlayerId, sourcePlayerId, amount * 10);
      }, 500);
    }, 1000);
  };

  const handleCommanderPressEnd = (
    targetPlayerId: string,
    sourcePlayerId: string,
    amount: number
  ) => {
    // Save the held state BEFORE clearing timers
    const wasHeld = commanderWasHeldRef.current;

    // Clear timers
    if (commanderHoldTimerRef.current) {
      clearTimeout(commanderHoldTimerRef.current);
      commanderHoldTimerRef.current = null;
    }
    if (commanderHoldIntervalRef.current) {
      clearInterval(commanderHoldIntervalRef.current);
      commanderHoldIntervalRef.current = null;
    }

    // Reset state
    commanderWasHeldRef.current = false;
    setActiveCommanderButton(null);

    // Only adjust if this wasn't a hold
    if (!wasHeld) {
      updateCommanderDamage(targetPlayerId, sourcePlayerId, amount);
    }
  };

  const handleCommanderPressCancel = () => {
    if (commanderHoldTimerRef.current) {
      clearTimeout(commanderHoldTimerRef.current);
    }
    if (commanderHoldIntervalRef.current) {
      clearInterval(commanderHoldIntervalRef.current);
    }

    commanderHoldTimerRef.current = null;
    commanderHoldIntervalRef.current = null;
    commanderWasHeldRef.current = false;
    setActiveCommanderButton(null);
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

        {/* Player Cards */}
        <SimpleGrid cols={2} spacing="xs">
          {players.map((player) => {
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
                          onClick={() => handleRemovePlayer(player.id)}
                        >
                          <IconMinus size={12} />
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
                        backgroundColor:
                          activeButton?.playerId === player.id &&
                          activeButton?.side === "left"
                            ? "rgba(239, 68, 68, 0.2)"
                            : "rgba(239, 68, 68, 0.05)",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        WebkitTouchCallout: "none",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseDown={(e) => {
                        if (isTouchRef.current) return;
                        e.preventDefault();
                        handlePressStart(player.id, -1, "left");
                      }}
                      onMouseUp={(e) => {
                        if (isTouchRef.current) {
                          isTouchRef.current = false;
                          return;
                        }
                        e.preventDefault();
                        handlePressEnd(player.id, -1);
                      }}
                      onMouseLeave={handlePressCancel}
                      onTouchStart={() => {
                        isTouchRef.current = true;
                        handlePressStart(player.id, -1, "left");
                      }}
                      onTouchEnd={() => {
                        handlePressEnd(player.id, -1);
                        setTimeout(() => {
                          isTouchRef.current = false;
                        }, 300);
                      }}
                      onTouchCancel={handlePressCancel}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <IconMinus
                        size={24}
                        color="#ef4444"
                        opacity={
                          activeButton?.playerId === player.id &&
                          activeButton?.side === "left"
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
                        backgroundColor:
                          activeButton?.playerId === player.id &&
                          activeButton?.side === "right"
                            ? "rgba(16, 185, 129, 0.2)"
                            : "rgba(16, 185, 129, 0.05)",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        WebkitTouchCallout: "none",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseDown={(e) => {
                        if (isTouchRef.current) return;
                        e.preventDefault();
                        handlePressStart(player.id, 1, "right");
                      }}
                      onMouseUp={(e) => {
                        if (isTouchRef.current) {
                          isTouchRef.current = false;
                          return;
                        }
                        e.preventDefault();
                        handlePressEnd(player.id, 1);
                      }}
                      onMouseLeave={handlePressCancel}
                      onTouchStart={() => {
                        isTouchRef.current = true;
                        handlePressStart(player.id, 1, "right");
                      }}
                      onTouchEnd={() => {
                        handlePressEnd(player.id, 1);
                        setTimeout(() => {
                          isTouchRef.current = false;
                        }, 300);
                      }}
                      onTouchCancel={handlePressCancel}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <IconPlus
                        size={24}
                        color="#10b981"
                        opacity={
                          activeButton?.playerId === player.id &&
                          activeButton?.side === "right"
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

        {/* Commander Damage Modal */}
        <Modal
          opened={commanderDamageModalOpen}
          onClose={() => {
            setCommanderDamageModalOpen(false);
            handleCommanderPressCancel(); // Clean up any active holds
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
                  const isDecreaseActive =
                    activeCommanderButton?.sourceId === source.id &&
                    activeCommanderButton?.direction === "decrease";
                  const isIncreaseActive =
                    activeCommanderButton?.sourceId === source.id &&
                    activeCommanderButton?.direction === "increase";

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
                            onMouseDown={(e) => {
                              if (isCommanderTouchRef.current) return;
                              e.preventDefault();
                              if (damage > 0) {
                                handleCommanderPressStart(
                                  selectedPlayer.id,
                                  source.id,
                                  -1,
                                  "decrease"
                                );
                              }
                            }}
                            onMouseUp={(e) => {
                              if (isCommanderTouchRef.current) {
                                isCommanderTouchRef.current = false;
                                return;
                              }
                              e.preventDefault();
                              handleCommanderPressEnd(
                                selectedPlayer.id,
                                source.id,
                                -1
                              );
                            }}
                            onMouseLeave={handleCommanderPressCancel}
                            onTouchStart={() => {
                              isCommanderTouchRef.current = true;
                              if (damage > 0) {
                                handleCommanderPressStart(
                                  selectedPlayer.id,
                                  source.id,
                                  -1,
                                  "decrease"
                                );
                              }
                            }}
                            onTouchEnd={() => {
                              handleCommanderPressEnd(
                                selectedPlayer.id,
                                source.id,
                                -1
                              );
                              setTimeout(() => {
                                isCommanderTouchRef.current = false;
                              }, 300);
                            }}
                            onTouchCancel={handleCommanderPressCancel}
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
                            onMouseDown={(e) => {
                              if (isCommanderTouchRef.current) return;
                              e.preventDefault();
                              handleCommanderPressStart(
                                selectedPlayer.id,
                                source.id,
                                1,
                                "increase"
                              );
                            }}
                            onMouseUp={(e) => {
                              if (isCommanderTouchRef.current) {
                                isCommanderTouchRef.current = false;
                                return;
                              }
                              e.preventDefault();
                              handleCommanderPressEnd(
                                selectedPlayer.id,
                                source.id,
                                1
                              );
                            }}
                            onMouseLeave={handleCommanderPressCancel}
                            onTouchStart={() => {
                              isCommanderTouchRef.current = true;
                              handleCommanderPressStart(
                                selectedPlayer.id,
                                source.id,
                                1,
                                "increase"
                              );
                            }}
                            onTouchEnd={() => {
                              handleCommanderPressEnd(
                                selectedPlayer.id,
                                source.id,
                                1
                              );
                              setTimeout(() => {
                                isCommanderTouchRef.current = false;
                              }, 300);
                            }}
                            onTouchCancel={handleCommanderPressCancel}
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
