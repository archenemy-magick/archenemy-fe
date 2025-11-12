// components/DungeonTracker/DungeonTracker.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Circle,
  Line,
  Text,
  Group as KonvaGroup,
} from "react-konva";
import useImage from "use-image";
import {
  Stack,
  Title,
  Text as MantineText,
  Button,
  Card,
  Group,
  Badge,
  Select,
} from "@mantine/core";
import { IconArrowBack, IconPlus, IconMinus } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks"; // ADD THIS IMPORT
import { DungeonCard, DungeonRoom } from "~/types/dungeon";
import {
  parseDungeonRooms,
  canMoveToRoom,
  findRoomByName,
  getFinalRooms,
} from "~/lib/utils/dungeonParser";
import { applyLayoutToRooms } from "~/lib/data/dungeonLayouts";
import type { KonvaEventObject } from "konva/lib/Node";

interface Player {
  id: string;
  name: string;
  color: string;
  currentRoom: string;
  visitedRooms: string[];
  completed: boolean;
}

interface DungeonTrackerProps {
  dungeon: DungeonCard;
  // onComplete?: () => void;
}

const DEFAULT_COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"];
const DEFAULT_NAMES = ["Player 1", "Player 2", "Player 3", "Player 4"];

// Canvas dimensions
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 700;

export const DungeonTracker = ({
  dungeon,
}: // onComplete,
DungeonTrackerProps) => {
  const [dungeonImage] = useImage(dungeon.image_large);

  // NEW: Responsive scaling
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // NEW: Calculate scale based on container width
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = Math.min(containerWidth / CANVAS_WIDTH, 1);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Parse and layout rooms
  const rooms = useMemo(() => {
    const parsed = parseDungeonRooms(dungeon.oracle_text);
    return applyLayoutToRooms(dungeon.name, parsed);
  }, [dungeon.oracle_text, dungeon.name]);

  const startingRoom = rooms[0]?.name || "";

  // Initialize with 1 player
  const [players, setPlayers] = useState<Player[]>([
    {
      id: "p1",
      name: DEFAULT_NAMES[0],
      color: DEFAULT_COLORS[0],
      currentRoom: startingRoom,
      visitedRooms: [startingRoom],
      completed: false,
    },
  ]);

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("p1");
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
  const currentRoom = selectedPlayer
    ? findRoomByName(rooms, selectedPlayer.currentRoom)
    : null;
  const hoveredRoomData = hoveredRoom
    ? findRoomByName(rooms, hoveredRoom)
    : null;
  const finalRooms = getFinalRooms(rooms);

  const canUndo = selectedPlayer && selectedPlayer.visitedRooms.length > 1;

  // Add player
  const handleAddPlayer = () => {
    if (players.length >= 4) {
      return;
    }

    const newPlayerId = `p${players.length + 1}`;
    const newPlayer: Player = {
      id: newPlayerId,
      name: DEFAULT_NAMES[players.length],
      color: DEFAULT_COLORS[players.length],
      currentRoom: startingRoom,
      visitedRooms: [startingRoom],
      completed: false,
    };

    setPlayers((prev) => [...prev, newPlayer]);
    setSelectedPlayerId(newPlayerId);
  };

  // Remove player
  const handleRemovePlayer = () => {
    if (players.length <= 1) {
      return;
    }

    const remainingPlayers = players.filter((p) => p.id !== selectedPlayerId);
    setPlayers(remainingPlayers);
    setSelectedPlayerId(remainingPlayers[0].id);
  };

  // Move player to room
  const handleRoomClick = (targetRoomName: string) => {
    if (!selectedPlayer || !currentRoom) return;

    // Forward move
    if (canMoveToRoom(currentRoom, targetRoomName)) {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === selectedPlayerId
            ? {
                ...p,
                currentRoom: targetRoomName,
                visitedRooms: [...p.visitedRooms, targetRoomName],
                completed: finalRooms.some((r) => r.name === targetRoomName),
              }
            : p
        )
      );
    }
    // Backward move
    else if (
      selectedPlayer.visitedRooms.includes(targetRoomName) &&
      targetRoomName !== selectedPlayer.currentRoom
    ) {
      const roomIndex = selectedPlayer.visitedRooms.indexOf(targetRoomName);
      const newVisitedRooms = selectedPlayer.visitedRooms.slice(
        0,
        roomIndex + 1
      );

      setPlayers((prev) =>
        prev.map((p) =>
          p.id === selectedPlayerId
            ? {
                ...p,
                currentRoom: targetRoomName,
                visitedRooms: newVisitedRooms,
                completed: false,
              }
            : p
        )
      );
    }
  };

  // Undo player move
  const handleUndo = () => {
    if (!canUndo || !selectedPlayer) return;

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === selectedPlayerId) {
          const newVisited = p.visitedRooms.slice(0, -1);
          const previousRoom = newVisited[newVisited.length - 1];
          return {
            ...p,
            currentRoom: previousRoom,
            visitedRooms: newVisited,
            completed: false,
          };
        }
        return p;
      })
    );
  };

  // Reset all players
  const handleReset = () => {
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        currentRoom: startingRoom,
        visitedRooms: [startingRoom],
        completed: false,
      }))
    );
  };

  // Drag and drop
  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    setIsDragging(false);

    const { x, y } = e.target.position();

    const droppedRoom = rooms.find((room) => {
      const distance = Math.sqrt(
        Math.pow(room.position.x - x, 2) + Math.pow(room.position.y - y, 2)
      );
      return distance < 40;
    });

    if (droppedRoom && currentRoom && selectedPlayer) {
      // Forward move
      if (canMoveToRoom(currentRoom, droppedRoom.name)) {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === selectedPlayerId
              ? {
                  ...p,
                  currentRoom: droppedRoom.name,
                  visitedRooms: [...p.visitedRooms, droppedRoom.name],
                  completed: finalRooms.some(
                    (r) => r.name === droppedRoom.name
                  ),
                }
              : p
          )
        );
      }
      // Backward move
      else if (selectedPlayer.visitedRooms.includes(droppedRoom.name)) {
        const roomIndex = selectedPlayer.visitedRooms.indexOf(droppedRoom.name);
        const newVisitedRooms = selectedPlayer.visitedRooms.slice(
          0,
          roomIndex + 1
        );

        setPlayers((prev) =>
          prev.map((p) =>
            p.id === selectedPlayerId
              ? {
                  ...p,
                  currentRoom: droppedRoom.name,
                  visitedRooms: newVisitedRooms,
                  completed: false,
                }
              : p
          )
        );
      }
    }
  };

  // Calculate player token positions when multiple players in same room
  const getPlayerTokenPosition = (
    player: Player,
    indexInRoom: number,
    totalInRoom: number
  ) => {
    const room = findRoomByName(rooms, player.currentRoom);
    if (!room) return { x: 0, y: 0 };

    if (totalInRoom === 1) {
      return room.position;
    }

    const radius = 20;
    const angle = (Math.PI * 2 * indexInRoom) / totalInRoom;

    return {
      x: room.position.x + Math.cos(angle) * radius,
      y: room.position.y + Math.sin(angle) * radius,
    };
  };

  if (!currentRoom) {
    return <MantineText>Error: Could not parse dungeon rooms</MantineText>;
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>{dungeon.name}</Title>
          <MantineText size="sm" c="dimmed">
            Local Multiplayer
          </MantineText>
        </div>
        <Group gap="xs">
          <Button
            size="xs"
            variant="light"
            leftSection={<IconPlus size={14} />}
            onClick={handleAddPlayer}
            disabled={players.length >= 4}
          >
            {isMobile ? "+" : "Add Player"}
          </Button>
          <Button
            size="xs"
            variant="light"
            color="red"
            leftSection={<IconMinus size={14} />}
            onClick={handleRemovePlayer}
            disabled={players.length <= 1}
          >
            {isMobile ? "-" : "Remove"}
          </Button>
          <Button size="xs" variant="light" onClick={handleReset}>
            Reset
          </Button>
        </Group>
      </Group>

      {/* Player selector and controls */}
      <Card withBorder>
        <Stack gap="md">
          <Group wrap="wrap">
            <Select
              label="Active Player"
              value={selectedPlayerId}
              onChange={(value) => value && setSelectedPlayerId(value)}
              data={players.map((p) => ({
                value: p.id,
                label: `${p.name} ${p.completed ? "✓" : ""}`,
              }))}
              style={{ flex: 1, minWidth: 150 }}
            />

            <div style={{ marginTop: isMobile ? 0 : "auto" }}>
              <Badge
                size="lg"
                color={selectedPlayer?.completed ? "green" : "blue"}
                leftSection={
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: selectedPlayer?.color,
                    }}
                  />
                }
              >
                {selectedPlayer?.completed
                  ? "Done!"
                  : `${selectedPlayer?.visitedRooms.length}/${rooms.length}`}
              </Badge>
            </div>

            <Button
              size="xs"
              variant="light"
              color="orange"
              leftSection={<IconArrowBack size={14} />}
              onClick={handleUndo}
              disabled={!canUndo}
            >
              Undo
            </Button>
          </Group>
        </Stack>
      </Card>

      {/* Canvas with dungeon visualization - NEW: Scaled and responsive */}
      <Card withBorder p={0} style={{ overflow: "hidden" }} ref={containerRef}>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            touchAction: "pan-y", // CHANGE: Allow vertical scrolling but prevent horizontal
          }}
        >
          <Stage
            width={CANVAS_WIDTH * scale}
            height={CANVAS_HEIGHT * scale}
            scaleX={scale}
            scaleY={scale}
          >
            <Layer>
              {/* Dungeon card background image */}
              {dungeonImage && (
                <KonvaImage
                  image={dungeonImage}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                />
              )}

              {/* Path trail for selected player */}
              {selectedPlayer && selectedPlayer.visitedRooms.length > 1 && (
                <Line
                  points={selectedPlayer.visitedRooms.flatMap((roomName) => {
                    const room = findRoomByName(rooms, roomName);
                    return room ? [room.position.x, room.position.y] : [];
                  })}
                  stroke={selectedPlayer.color}
                  strokeWidth={3} // Slightly thicker
                  opacity={0.4} // Slightly more visible
                  dash={[8, 4]} // Longer dashes
                  listening={false}
                />
              )}

              {/* Connection lines from current room to available rooms */}
              {currentRoom.leadsTo.map((targetRoomName) => {
                const targetRoom = findRoomByName(rooms, targetRoomName);
                if (!targetRoom) return null;

                return (
                  <Line
                    key={`line-${targetRoomName}`}
                    points={[
                      currentRoom.position.x,
                      currentRoom.position.y,
                      targetRoom.position.x,
                      targetRoom.position.y,
                    ]}
                    stroke={selectedPlayer?.color || "#facc15"} // Use player color or gold
                    strokeWidth={4} // Thicker lines
                    opacity={0.7} // More visible
                    dash={[10, 6]} // More pronounced dashes
                    listening={false}
                  />
                );
              })}

              {/* Room circles (clickable areas) */}
              {rooms.map((room) => {
                const isCurrentRoom = room.name === selectedPlayer?.currentRoom;
                const isConnected = currentRoom.leadsTo.includes(room.name);
                const isVisited = selectedPlayer?.visitedRooms.includes(
                  room.name
                );
                const isHovered = room.name === hoveredRoom;

                const isNearDraggedToken =
                  isDragging &&
                  Math.sqrt(
                    Math.pow(room.position.x - dragPosition.x, 2) +
                      Math.pow(room.position.y - dragPosition.y, 2)
                  ) < 50;

                const canDropHere =
                  isNearDraggedToken &&
                  (isConnected || (isVisited && !isCurrentRoom));

                return (
                  <Circle
                    key={room.name}
                    x={room.position.x}
                    y={room.position.y}
                    radius={25}
                    fill={
                      isCurrentRoom
                        ? `${selectedPlayer?.color}60` // Less opaque for better visibility
                        : canDropHere
                        ? isConnected
                          ? "rgba(250, 204, 21, 0.5)" // Brighter gold for forward moves
                          : "rgba(251, 146, 60, 0.5)" // Brighter orange for backward moves
                        : isVisited
                        ? "rgba(147, 197, 253, 0.35)" // Softer blue for visited
                        : "rgba(156, 163, 175, 0.25)" // Subtle gray for unvisited
                    }
                    stroke={
                      isCurrentRoom
                        ? selectedPlayer?.color
                        : canDropHere
                        ? isConnected
                          ? "#facc15" // Brighter gold
                          : "#fb923c" // Brighter orange
                        : isConnected
                        ? selectedPlayer?.color
                        : isVisited
                        ? "#60a5fa" // Lighter blue
                        : "#9ca3af" // Medium gray
                    }
                    strokeWidth={canDropHere ? 4 : isHovered ? 4 : 2}
                    opacity={isHovered || canDropHere ? 1 : 0.85}
                    onMouseEnter={() => setHoveredRoom(room.name)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={() => handleRoomClick(room.name)}
                    onTap={() => handleRoomClick(room.name)}
                    listening={true}
                  />
                );
              })}

              {/* Player tokens */}
              {players.map((player) => {
                const playersInRoom = players.filter(
                  (p) => p.currentRoom === player.currentRoom
                );
                const indexInRoom = playersInRoom.findIndex(
                  (p) => p.id === player.id
                );
                const position = getPlayerTokenPosition(
                  player,
                  indexInRoom,
                  playersInRoom.length
                );

                const isSelected = player.id === selectedPlayerId;
                const actualPosition =
                  isSelected && isDragging ? dragPosition : position;

                return (
                  <KonvaGroup key={player.id}>
                    <Circle
                      x={actualPosition.x}
                      y={actualPosition.y}
                      radius={14} // Slightly larger
                      fill={player.color}
                      stroke="#ffffff"
                      strokeWidth={
                        isSelected ? 4 : hoveredPlayerId === player.id ? 3 : 2.5
                      } // Thicker borders
                      draggable={true}
                      onClick={() => {
                        if (!isDragging) {
                          setSelectedPlayerId(player.id);
                        }
                      }}
                      onTap={() => {
                        if (!isDragging) {
                          setSelectedPlayerId(player.id);
                        }
                      }}
                      onDragStart={(e) => {
                        setSelectedPlayerId(player.id);
                        setIsDragging(true);
                      }}
                      onDragMove={(e) => {
                        if (player.id === selectedPlayerId) {
                          const { x, y } = e.target.position();
                          setDragPosition({ x, y });
                        }
                      }}
                      onDragEnd={(e) => {
                        if (player.id === selectedPlayerId) {
                          handleDragEnd(e);
                        } else {
                          setIsDragging(false);
                        }
                      }}
                      shadowColor={
                        isDragging && isSelected ? "black" : undefined
                      }
                      shadowBlur={
                        isDragging && isSelected
                          ? 12
                          : hoveredPlayerId === player.id
                          ? 8
                          : 0
                      }
                      shadowOpacity={
                        isDragging && isSelected
                          ? 0.7
                          : hoveredPlayerId === player.id
                          ? 0.4
                          : 0
                      }
                      opacity={1} // Full opacity for player tokens
                      onMouseEnter={(e) => {
                        setHoveredPlayerId(player.id);
                        const container = e.target.getStage()?.container();
                        if (container) {
                          container.style.cursor = "pointer";
                        }
                      }}
                      onMouseLeave={(e) => {
                        setHoveredPlayerId(null);
                        const container = e.target.getStage()?.container();
                        if (container) {
                          container.style.cursor = "default";
                        }
                      }}
                    />

                    <Text
                      x={actualPosition.x - 5} // Adjusted for larger circle
                      y={actualPosition.y - 7} // Adjusted for larger circle
                      text={player.id.toUpperCase().replace("P", "")}
                      fontSize={14} // Slightly larger text
                      fill="#ffffff"
                      fontStyle="bold"
                      listening={false}
                    />
                  </KonvaGroup>
                );
              })}
            </Layer>
          </Stage>
        </div>
      </Card>

      {/* Current room info */}
      <Card withBorder>
        <Stack gap="xs">
          <Group justify="space-between">
            <Title order={4}>{currentRoom.name}</Title>
            {selectedPlayer?.completed && (
              <Badge color="green">Final Room!</Badge>
            )}
          </Group>
          <MantineText size="sm">{currentRoom.effect}</MantineText>

          {currentRoom.leadsTo.length > 0 && (
            <div>
              <MantineText size="xs" c="dimmed" fw={600}>
                Available paths:
              </MantineText>
              <Group gap="xs" mt={4}>
                {currentRoom.leadsTo.map((roomName) => (
                  <Badge key={roomName} size="sm" variant="light">
                    {roomName}
                  </Badge>
                ))}
              </Group>
            </div>
          )}
        </Stack>
      </Card>

      {/* All players status */}
      <Card withBorder>
        <Stack gap="xs">
          <Title order={5}>All Players</Title>
          {players.map((player) => {
            const playerRoom = findRoomByName(rooms, player.currentRoom);
            return (
              <Group key={player.id} justify="space-between" wrap="wrap">
                <Group gap="xs">
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: player.color,
                      border:
                        player.id === selectedPlayerId
                          ? "2px solid white"
                          : "none",
                    }}
                  />
                  <MantineText
                    size="sm"
                    fw={player.id === selectedPlayerId ? 600 : 400}
                  >
                    {player.name}
                  </MantineText>
                </Group>
                <Group gap="xs">
                  <MantineText size="xs" c="dimmed">
                    {playerRoom?.name}
                  </MantineText>
                  {player.completed && (
                    <Badge size="xs" color="green">
                      ✓
                    </Badge>
                  )}
                </Group>
              </Group>
            );
          })}
        </Stack>
      </Card>

      {/* Hovered room info */}
      {hoveredRoomData && hoveredRoomData.name !== currentRoom.name && (
        <Card withBorder style={{ opacity: 0.8 }}>
          <Stack gap="xs">
            <Title order={5}>{hoveredRoomData.name}</Title>
            <MantineText size="sm">{hoveredRoomData.effect}</MantineText>
          </Stack>
        </Card>
      )}
    </Stack>
  );
};
