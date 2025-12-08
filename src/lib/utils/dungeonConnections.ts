// lib/data/dungeonConnections.ts
/**
 * Manual connections for each dungeon room
 * Based on the actual card layouts, not included in Scryfall oracle_text
 */

export const dungeonConnections: Record<string, Record<string, string[]>> = {
  "Tomb of Annihilation": {
    "Trapped Entry": ["Veils of Fear", "Oubliette"],
    "Veils of Fear": ["Sandfall Cell"],
    Oubliette: ["Sandfall Cell"],
    "Sandfall Cell": ["Cradle of the Death God"],
    "Cradle of the Death God": [],
  },

  "Lost Mine of Phandelver": {
    "Cave Entrance": ["Goblin Lair", "Mine Tunnels"],
    "Goblin Lair": ["Storeroom", "Dark Pool"],
    "Mine Tunnels": ["Dark Pool", "Fungi Cavern"],
    Storeroom: ["Temple of Dumathoin"],
    "Dark Pool": ["Temple of Dumathoin"],
    "Fungi Cavern": ["Temple of Dumathoin"],
    "Temple of Dumathoin": [],
  },

  "Dungeon of the Mad Mage": {
    "Yawning Portal": ["Dungeon Level"],
    "Dungeon Level": ["Goblin Bazaar", "Twisted Caverns"],
    "Goblin Bazaar": ["Lost Level"],
    "Twisted Caverns": ["Lost Level"],
    "Lost Level": ["Runestone Caverns", "Muiral's Graveyard"],
    "Runestone Caverns": ["Deep Mines"],
    "Muiral's Graveyard": ["Deep Mines"],
    "Deep Mines": ["Mad Wizard's Lair"],
    "Mad Wizard's Lair": [],
  },

  Undercity: {
    "Secret Entrance": ["Forge", "Lost Well"],
    Forge: ["Trap!", "Arena"],
    "Lost Well": ["Arena", "Stash"],
    "Trap!": ["Archives"],
    Arena: ["Archives", "Catacombs"],
    Stash: ["Catacombs"],
    Archives: ["Throne of the Dead Three"],
    Catacombs: ["Throne of the Dead Three"],
    "Throne of the Dead Three": [],
  },

  "Baldur's Gate Wilderness": {
    // Row 1
    "Crash Landing": ["Goblin Camp", "Emerald Grove", "Auntie's Teahouse"],

    // Row 2
    "Goblin Camp": ["Defiled Temple"],
    "Emerald Grove": ["Defiled Temple", "Mountain Pass"],
    "Auntie's Teahouse": ["Mountain Pass"],

    // Row 3
    "Defiled Temple": ["Ebonlake Grotto", "Grymforge"],
    "Mountain Pass": ["Grymforge", "Githyanki Crèche"],

    // Row 4
    "Ebonlake Grotto": ["Last Light Inn"],
    Grymforge: ["Last Light Inn", "Reithwin Tollhouse"],
    "Githyanki Crèche": ["Reithwin Tollhouse"],

    // Row 5
    "Last Light Inn": ["Moonrise Towers", "Gauntlet of Shar"],
    "Reithwin Tollhouse": ["Gauntlet of Shar", "Balthazar's Lab"],

    // Row 6
    "Moonrise Towers": ["Circus of the Last Days"],
    "Gauntlet of Shar": ["Circus of the Last Days", "Undercity Ruins"],
    "Balthazar's Lab": ["Undercity Ruins"],

    // Row 7
    "Circus of the Last Days": ["Steel Watch Foundry", "Ansur's Sanctum"],
    "Undercity Ruins": ["Ansur's Sanctum", "Temple of Bhaal"],

    // Row 8 (final rooms)
    "Steel Watch Foundry": [],
    "Ansur's Sanctum": [],
    "Temple of Bhaal": [],
  },
};
