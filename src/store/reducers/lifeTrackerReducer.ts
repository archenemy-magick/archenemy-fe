// store/reducers/lifeTrackerReducer.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Player {
  id: string;
  name: string;
  life: number;
  startingLife: number;
  color: string;
  commanderDamage: Record<string, number>;
}

interface GameState {
  players: Player[];
  defaultStartingLife: number;
}

export type InitialLifeTrackerState = {
  // Store by tabId to support multiple life tracker tabs
  games: Record<string, GameState>;
};

export const initialLifeTrackerState: InitialLifeTrackerState = {
  games: {},
};

const DEFAULT_COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // orange
  "#8b5cf6", // purple
  "#ec4899", // pink
];

const lifeTrackerSliceReducer = {
  // Initialize game for a tab
  initializeGame(
    state: InitialLifeTrackerState,
    action: PayloadAction<{ tabId: string; defaultStartingLife: number }>
  ) {
    const { tabId, defaultStartingLife } = action.payload;

    if (!state.games[tabId]) {
      state.games[tabId] = {
        defaultStartingLife,
        players: [
          {
            id: "1",
            name: "Player 1",
            life: defaultStartingLife,
            startingLife: defaultStartingLife,
            color: DEFAULT_COLORS[0],
            commanderDamage: { "2": 0 },
          },
          {
            id: "2",
            name: "Player 2",
            life: defaultStartingLife,
            startingLife: defaultStartingLife,
            color: DEFAULT_COLORS[1],
            commanderDamage: { "1": 0 },
          },
        ],
      };
    }
  },

  // New Game - Reset with same player count and starting life
  newGame(state: InitialLifeTrackerState, action: PayloadAction<string>) {
    const tabId = action.payload;
    const game = state.games[tabId];

    if (game) {
      // Keep the same number of players, names, colors, and starting life
      game.players = game.players.map((p) => ({
        ...p,
        life: p.startingLife,
        commanderDamage: game.players.reduce((acc, player) => {
          if (player.id !== p.id) {
            acc[player.id] = 0;
          }
          return acc;
        }, {} as Record<string, number>),
      }));
    }
  },

  // Add player
  addPlayer(state: InitialLifeTrackerState, action: PayloadAction<string>) {
    const tabId = action.payload;
    const game = state.games[tabId];

    if (game && game.players.length < 6) {
      const newPlayerId = String(Date.now());
      const newPlayer: Player = {
        id: newPlayerId,
        name: `Player ${game.players.length + 1}`,
        life: game.defaultStartingLife,
        startingLife: game.defaultStartingLife,
        color: DEFAULT_COLORS[game.players.length % DEFAULT_COLORS.length],
        commanderDamage: {},
      };

      // Add commander damage tracking for new player
      game.players = game.players.map((p) => ({
        ...p,
        commanderDamage: { ...p.commanderDamage, [newPlayerId]: 0 },
      }));

      // Initialize new player's commander damage
      game.players.forEach((p) => {
        newPlayer.commanderDamage[p.id] = 0;
      });

      game.players.push(newPlayer);
    }
  },

  // Remove player
  removePlayer(
    state: InitialLifeTrackerState,
    action: PayloadAction<{ tabId: string; playerId: string }>
  ) {
    const { tabId, playerId } = action.payload;
    const game = state.games[tabId];

    if (game && game.players.length > 2) {
      game.players = game.players
        .filter((p) => p.id !== playerId)
        .map((p) => {
          const { [playerId]: removed, ...remainingDamage } = p.commanderDamage;
          return { ...p, commanderDamage: remainingDamage };
        });
    }
  },

  // Adjust life
  adjustLife(
    state: InitialLifeTrackerState,
    action: PayloadAction<{ tabId: string; playerId: string; amount: number }>
  ) {
    const { tabId, playerId, amount } = action.payload;
    const game = state.games[tabId];

    if (game) {
      const player = game.players.find((p) => p.id === playerId);
      if (player) {
        player.life = Math.max(0, player.life + amount);
      }
    }
  },

  // Update commander damage
  updateCommanderDamage(
    state: InitialLifeTrackerState,
    action: PayloadAction<{
      tabId: string;
      targetPlayerId: string;
      sourcePlayerId: string;
      amount: number;
    }>
  ) {
    const { tabId, targetPlayerId, sourcePlayerId, amount } = action.payload;
    const game = state.games[tabId];

    if (game) {
      const player = game.players.find((p) => p.id === targetPlayerId);
      if (player) {
        const currentDamage = player.commanderDamage[sourcePlayerId] || 0;
        player.commanderDamage[sourcePlayerId] = Math.max(
          0,
          currentDamage + amount
        );

        // Also adjust life total when commander damage changes
        player.life = Math.max(0, player.life - amount);
      }
    }
  },

  // Reset all players
  resetAllPlayers(
    state: InitialLifeTrackerState,
    action: PayloadAction<string>
  ) {
    const tabId = action.payload;
    const game = state.games[tabId];

    if (game) {
      game.players = game.players.map((p) => ({
        ...p,
        life: p.startingLife,
        commanderDamage: Object.keys(p.commanderDamage).reduce(
          (acc, key) => ({ ...acc, [key]: 0 }),
          {}
        ),
      }));
    }
  },

  // Update player settings
  updatePlayer(
    state: InitialLifeTrackerState,
    action: PayloadAction<{ tabId: string; player: Player }>
  ) {
    const { tabId, player } = action.payload;
    const game = state.games[tabId];

    if (game) {
      const index = game.players.findIndex((p) => p.id === player.id);
      if (index !== -1) {
        game.players[index] = player;
      }
    }
  },

  // Update default starting life
  updateDefaultStartingLife(
    state: InitialLifeTrackerState,
    action: PayloadAction<{ tabId: string; startingLife: number }>
  ) {
    const { tabId, startingLife } = action.payload;
    const game = state.games[tabId];

    if (game) {
      game.defaultStartingLife = startingLife;
    }
  },

  // Clear game (when tab closes)
  clearGame(state: InitialLifeTrackerState, action: PayloadAction<string>) {
    const tabId = action.payload;
    delete state.games[tabId];
  },
};

export const lifeTrackerSlice = createSlice({
  name: "lifeTracker",
  initialState: initialLifeTrackerState as InitialLifeTrackerState,
  reducers: lifeTrackerSliceReducer,
});

export const {
  initializeGame,
  newGame,
  addPlayer,
  removePlayer,
  adjustLife,
  updateCommanderDamage,
  resetAllPlayers,
  updatePlayer,
  updateDefaultStartingLife,
  clearGame,
} = lifeTrackerSlice.actions;
