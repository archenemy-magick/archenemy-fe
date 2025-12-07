// lib/utils/dungeonParser.ts
import { DungeonRoom } from "~/types/dungeon";
import { dungeonConnections } from "./dungeonConnections";

/**
 * Parse dungeon oracle text into structured room data
 * Now combines oracle text effects with manual connection data
 */
export function parseDungeonRooms(
  oracleText: string,
  dungeonName: string
): DungeonRoom[] {
  const rooms: DungeonRoom[] = [];
  const connections = dungeonConnections[dungeonName] || {};

  // Split by lines and process each room
  const lines = oracleText.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    // Match pattern: "Room Name — Effect"
    // The oracle text from Scryfall doesn't include (Leads to: ...) so we use manual data
    const match = line.match(/^([^—]+)\s*—\s*(.+)$/);

    if (match) {
      const [, name, effect] = match;
      const roomName = name.trim();

      rooms.push({
        name: roomName,
        effect: effect.trim(),
        leadsTo: connections[roomName] || [], // Get connections from manual data
        position: { x: 0, y: 0 }, // Will be set by layout data
      });
    }
  }

  return rooms;
}

/**
 * Get the starting room for a dungeon
 */
export function getStartingRoom(rooms: DungeonRoom[]): DungeonRoom | null {
  return rooms.length > 0 ? rooms[0] : null;
}

/**
 * Get the final room(s) for a dungeon (rooms with no leadsTo)
 */
export function getFinalRooms(rooms: DungeonRoom[]): DungeonRoom[] {
  return rooms.filter((room) => room.leadsTo.length === 0);
}

/**
 * Check if a room can be moved to from current room
 */
export function canMoveToRoom(
  currentRoom: DungeonRoom,
  targetRoomName: string
): boolean {
  return currentRoom.leadsTo.includes(targetRoomName);
}

/**
 * Find a room by name
 */
export function findRoomByName(
  rooms: DungeonRoom[],
  name: string
): DungeonRoom | undefined {
  return rooms.find((room) => room.name === name);
}
