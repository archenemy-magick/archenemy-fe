import { createAsyncThunk } from "@reduxjs/toolkit";

// The game slice's extraReducers reference these thunks; mock them like the
// component tests do so the slice can be built in isolation.
jest.mock("~/store/thunks", () => ({
  fetchAllArchenemyCards: createAsyncThunk("cards/fetchAll", async () => []),
  deleteArchenemyDeck: createAsyncThunk("decks/delete", async () => "id"),
  saveArchenemyDeck: createAsyncThunk("decks/save", async () => ({})),
}));
jest.mock("~/store/thunks/fetchAllDecks", () => ({
  __esModule: true,
  default: createAsyncThunk("decks/fetchAll", async () => []),
}));

import { gameSlice, startGameWithDeck } from "~/store/reducers/gameReducer";
import type { CustomArchenemyCard, CustomArchenemyDeck } from "~/types";

const card = (id: string) => ({ id, name: id } as CustomArchenemyCard);

describe("startGameWithDeck", () => {
  it("starts a game from a deck that is not in the user's deck list", () => {
    const initial = gameSlice.reducer(undefined, { type: "init" });
    const deck = {
      id: "public-deck",
      name: "Someone else's deck",
      deck_cards: [card("a"), card("b")],
    } as CustomArchenemyDeck;

    const state = gameSlice.reducer(
      { ...initial, gameEnded: true },
      startGameWithDeck(deck)
    );

    expect(initial.decks).toEqual([]);
    expect(state).toMatchObject({
      gameStarted: true,
      gameEnded: false,
      deckSelected: true,
      selectedDeckId: "public-deck",
    });
    expect(state.cards.cardPool.map((c) => c.id)).toEqual(["a", "b"]);
  });
});
