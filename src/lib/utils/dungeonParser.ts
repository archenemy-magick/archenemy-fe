// lib/utils/dungeonParser.ts
import { DungeonRoom } from "~/types/dungeon";

/**
 * Parse dungeon oracle text into structured room data
 */
export function parseDungeonRooms(oracleText: string): DungeonRoom[] {
  const rooms: DungeonRoom[] = [];

  // Split by lines and process each room
  const lines = oracleText.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    // Match pattern: "Room Name — Effect (Leads to: Room1, Room2)"
    const match = line.match(
      /^([^—]+)\s*—\s*([^(]+)(?:\(Leads to:\s*([^)]+)\))?/
    );

    if (match) {
      const [, name, effect, leadsTo] = match;

      rooms.push({
        name: name.trim(),
        effect: effect.trim(),
        leadsTo: leadsTo ? leadsTo.split(",").map((s) => s.trim()) : [],
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
