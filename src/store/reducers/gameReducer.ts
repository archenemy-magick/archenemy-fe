import { createSlice } from "@reduxjs/toolkit";
export type InitialGameState = {
  gameStarted: boolean;
  gameEnded: boolean;
  deckSelected: boolean;
};

export const initialGameState: InitialGameState = {
  gameStarted: false,
  gameEnded: false,
  deckSelected: false,
};

type GameState = typeof initialGameState;

const gameSliceReducer = {
  startGame(state: GameState) {
    console.log("in start game");

    state.gameStarted = true;
  },
  endGame(state: GameState) {
    state.gameEnded = true;
  },
  selectDeck(state: GameState) {
    state.deckSelected = true;
  },
};

export const gameSlice = createSlice({
  name: "game",
  initialState: initialGameState as GameState,
  reducers: gameSliceReducer,
});

export const { startGame, endGame, selectDeck } = gameSlice.actions;
