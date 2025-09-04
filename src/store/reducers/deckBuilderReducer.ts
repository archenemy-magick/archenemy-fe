import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import CardApi from "src/http/cards";
import { ScryfallCard } from "@scryfall/api-types";
import { clear } from "console";
import { fetchAllArchenemyCards } from "src/store/thunks";

export type InitialDeckBuilderState = {
  // TODO: do we need this? Maybe for expanding the card in a modal or something?
  currentCard: ScryfallCard.Scheme | null;
  cardPool: ScryfallCard.Scheme[];
  selectedCards: ScryfallCard.Scheme[];
  deckSaved: boolean;
  deckName: string | null;
  // TODO: this can be defined later, using things like Set, ongoing, etc.
  // selectedFilters: {}
};

export const initialDeckBuilderState: InitialDeckBuilderState = {
  currentCard: null,
  cardPool: [],
  selectedCards: [],
  deckSaved: false,
  deckName: null,
};

const deckBuilderSliceReducer = {
  addCard(
    state: InitialDeckBuilderState,
    action: { payload: ScryfallCard.Scheme }
  ) {
    state.selectedCards.push(action.payload);
  },
  removeCard(
    state: InitialDeckBuilderState,
    action: { payload: ScryfallCard.Scheme }
  ) {
    state.selectedCards = state.selectedCards.filter(
      (card) => card.id !== action.payload.id
    );
  },
  clearSelectedCards(state: InitialDeckBuilderState) {
    state.selectedCards = [];
  },
  setDeckName(state: InitialDeckBuilderState, action: { payload: string }) {
    state.deckName = action.payload;
  },
  saveDeck(state: InitialDeckBuilderState) {
    state.deckSaved = true;
  },
};

export const deckBuilderSlice = createSlice({
  name: "deckBuilder",
  initialState: initialDeckBuilderState as InitialDeckBuilderState,
  reducers: deckBuilderSliceReducer,
  extraReducers: (builder) => {
    builder.addCase(fetchAllArchenemyCards.fulfilled, (state, action) => {
      // TODO: type the response and stuff
      state.cardPool = action.payload.data;
    });
  },
});

export const {
  addCard,
  removeCard,
  clearSelectedCards,
  setDeckName,
  saveDeck,
} = deckBuilderSlice.actions;
