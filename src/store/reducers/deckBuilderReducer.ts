import { createSlice } from "@reduxjs/toolkit";
import { fetchAllArchenemyCards } from "src/store/thunks";
import { CustomArchenemyCard } from "src/types";

export type InitialDeckBuilderState = {
  // TODO: do we need this? Maybe for expanding the card in a modal or something?
  currentCard: CustomArchenemyCard | null;
  // TODO: update this with our newly created scheme
  cardPool: CustomArchenemyCard[];
  selectedCards: CustomArchenemyCard[];
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
    action: { payload: CustomArchenemyCard }
  ) {
    state.selectedCards.push(action.payload);
    console.log("selectedCards", state.selectedCards);
  },
  removeCard(
    state: InitialDeckBuilderState,
    action: { payload: CustomArchenemyCard }
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
};

export const deckBuilderSlice = createSlice({
  name: "deckBuilder",
  initialState: initialDeckBuilderState as InitialDeckBuilderState,
  reducers: deckBuilderSliceReducer,
  extraReducers: (builder) => {
    builder.addCase(fetchAllArchenemyCards.fulfilled, (state, action) => {
      // TODO: type the response and stuff
      state.cardPool = action.payload;
    });
  },
});

export const { addCard, removeCard, clearSelectedCards, setDeckName } =
  deckBuilderSlice.actions;
