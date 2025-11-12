// data/dungeonLayouts.ts
/**
 * Manually defined positions for each room in each dungeon
 * Coordinates are for a 500x700 canvas
 * Y-axis: 0 is at TOP, 700 is at BOTTOM
 */
export const dungeonLayouts: Record<
  string,
  Record<string, { x: number; y: number }>
> = {
  "Tomb of Annihilation": {
    "Trapped Entry": { x: 250, y: 150 },
    "Veils of Fear": { x: 150, y: 270 },
    Oubliette: { x: 350, y: 270 },
    "Sandfall Cell": { x: 150, y: 390 },
    "Cradle of the Death God": { x: 250, y: 510 },
  },

  "Lost Mine of Phandelver": {
    "Cave Entrance": { x: 250, y: 150 },
    "Goblin Lair": { x: 150, y: 250 },
    "Mine Tunnels": { x: 350, y: 250 },
    Storeroom: { x: 100, y: 370 },
    "Dark Pool": { x: 250, y: 370 },
    "Fungi Cavern": { x: 400, y: 370 },
    "Temple of Dumathoin": { x: 250, y: 530 },
  },

  "Dungeon of the Mad Mage": {
    "Yawning Portal": { x: 250, y: 120 },
    "Dungeon Level": { x: 250, y: 190 },
    "Goblin Bazaar": { x: 150, y: 260 },
    "Twisted Caverns": { x: 350, y: 260 },
    "Lost Level": { x: 250, y: 340 },
    "Runestone Caverns": { x: 150, y: 420 },
    "Muiral's Graveyard": { x: 350, y: 420 },
    "Deep Mines": { x: 250, y: 500 },
    "Mad Wizard's Lair": { x: 250, y: 570 },
  },

  Undercity: {
    "Secret Entrance": { x: 250, y: 160 },
    Forge: { x: 150, y: 240 },
    "Lost Well": { x: 350, y: 240 },
    "Trap!": { x: 100, y: 320 },
    Arena: { x: 250, y: 320 },
    Stash: { x: 400, y: 320 },
    Archives: { x: 150, y: 440 },
    Catacombs: { x: 350, y: 440 },
    "Throne of the Dead Three": { x: 250, y: 550 },
  },

  "Baldur's Gate Wilderness": {
    // Row 1: 1 room (centered, top)
    "Crash Landing": { x: 250, y: 125 },

    // Row 2: 3 rooms
    "Goblin Camp": { x: 115, y: 185 },
    "Emerald Grove": { x: 250, y: 185 },
    "Auntie's Teahouse": { x: 385, y: 185 },

    // Row 3: 2 rooms
    "Defiled Temple": { x: 165, y: 245 },
    "Mountain Pass": { x: 335, y: 245 },

    // Row 4: 3 rooms
    "Ebonlake Grotto": { x: 115, y: 300 },
    Grymforge: { x: 250, y: 300 },
    "Githyanki Crèche": { x: 385, y: 300 },

    // Row 5: 2 rooms
    "Last Light Inn": { x: 165, y: 375 },
    "Reithwin Tollhouse": { x: 335, y: 375 },

    // Row 6: 3 rooms
    "Moonrise Towers": { x: 115, y: 435 },
    "Gauntlet of Shar": { x: 250, y: 435 },
    "Balthazar's Lab": { x: 385, y: 435 },

    // Row 7: 2 rooms
    "Circus of the Last Days": { x: 165, y: 495 },
    "Undercity Ruins": { x: 335, y: 495 },

    // Row 8: 3 rooms (final row, bottom)
    "Steel Watch Foundry": { x: 115, y: 570 },
    "Ansur's Sanctum": { x: 250, y: 570 },
    "Temple of Bhaal": { x: 385, y: 570 },
  },
};

/**
 * Apply layout positions to parsed rooms
 */
export function applyLayoutToRooms(
  dungeonName: string,
  rooms: { name: string; effect: string; leadsTo: string[] }[]
): {
  name: string;
  effect: string;
  leadsTo: string[];
  position: { x: number; y: number };
}[] {
  const layout = dungeonLayouts[dungeonName];

  if (!layout) {
    console.warn(`No layout found for dungeon: ${dungeonName}`);
    return rooms.map((room, index) => ({
      ...room,
      position: { x: 250, y: 150 + index * 100 }, // Fallback: vertical stack from top with offset
    }));
  }

  return rooms.map((room) => ({
    ...room,
    position: layout[room.name] || { x: 250, y: 350 }, // Fallback to center
  }));
}
