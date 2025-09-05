import { createSlice } from "@reduxjs/toolkit";
import { ScryfallCard } from "@scryfall/api-types";
import { fetchAllArchenemyCards } from "src/store/thunks";

export interface Deck {
  name: string;
  cards: ScryfallCard.Scheme[];
}

export type InitialDecksScheme = {
  // TODO: do we need this? Maybe for expanding the card in a modal or something?

  decks: Deck[];
  // TODO: this can be defined later, using things like Set, ongoing, etc.
  // selectedFilters: {}
};

export const initialDecksState: InitialDecksScheme = {
  decks: [],
};

const deckSliceReducer = {
  addDeck(state: InitialDecksScheme, action: { payload: Deck }) {
    console.log("action.payload", action.payload);
    state.decks.push(action.payload);
    console.log("decks", state.decks);
  },
  // removeDeck(
  //   state: InitialDecksScheme,
  //   action: { payload: Deck }
  // ) {
  //   state.decks = state.decks.filter(
  //     (deck) => deck.name !== action.payload.name
  //   );
  // }
};

export const decksSlice = createSlice({
  name: "deck",
  initialState: initialDecksState as InitialDecksScheme,
  reducers: deckSliceReducer,
  // extraReducers: (builder) => {
  //   builder.addCase(fetchAllArchenemyCards.fulfilled, (state, action) => {
  //     // TODO: type the response and stuff
  //     state.cardPool = action.payload.data;
  //   });
  // },
});

export const { addDeck } = decksSlice.actions;
