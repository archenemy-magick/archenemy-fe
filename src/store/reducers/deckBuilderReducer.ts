import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchAllArchenemyCards, saveArchenemyDeck } from "~/store/thunks";
import { CustomArchenemyCard } from "~/types";

export type InitialDeckBuilderState = {
  // TODO: do we need this? Maybe for expanding the card in a modal or something?
  currentCard: CustomArchenemyCard | null;
  // TODO: update this with our newly created scheme
  cardPool: CustomArchenemyCard[];
  selectedCards: CustomArchenemyCard[];
  deckName: string | null;
  deckSavingError?: string;
  editingDeckId?: string;
  editingDeckName?: string;
  editingDeckDescription?: string;

  // TODO: this can be defined later, using things like Set, ongoing, etc.
  // selectedFilters: {}
};

export const initialDeckBuilderState: InitialDeckBuilderState = {
  currentCard: null,
  cardPool: [],
  selectedCards: [],
  deckName: null,
  deckSavingError: undefined,
  editingDeckId: undefined,
  editingDeckName: undefined,
  editingDeckDescription: undefined,
};

const deckBuilderSliceReducer = {
  addCard(
    state: InitialDeckBuilderState,
    action: { payload: CustomArchenemyCard }
  ) {
    state.selectedCards.push(action.payload);
  },
  removeCard(
    state: InitialDeckBuilderState,
    action: { payload: CustomArchenemyCard }
  ) {
    state.selectedCards = state.selectedCards.filter(
      (card) => card.id !== action.payload.id
    );
  },
  addCards: (
    state: InitialDeckBuilderState,
    action: PayloadAction<CustomArchenemyCard[]>
  ) => {
    const newCards = action.payload.filter(
      (card) => !state.selectedCards.some((sc) => sc.id === card.id)
    );
    state.selectedCards = [...state.selectedCards, ...newCards];
  },

  // Clear all selected cards
  clearSelectedCards: (state: InitialDeckBuilderState) => {
    state.selectedCards = [];
  },
  setDeckName(state: InitialDeckBuilderState, action: { payload: string }) {
    state.deckName = action.payload;
  },
  loadDeckForEditing: (
    state: InitialDeckBuilderState,
    action: {
      payload: {
        deckId: string;
        deckName: string;
        deckDescription?: string;
        cards: CustomArchenemyCard[];
      };
    }
  ) => {
    state.editingDeckId = action.payload.deckId;
    state.editingDeckName = action.payload.deckName;
    state.editingDeckDescription = action.payload.deckDescription;
    state.selectedCards = action.payload.cards;
  },
  clearEditingDeck: (state: InitialDeckBuilderState) => {
    state.editingDeckId = undefined;
    state.editingDeckName = undefined;
    state.editingDeckDescription = undefined;
    state.selectedCards = [];
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
    builder.addCase(saveArchenemyDeck.fulfilled, (state) => {
      state.selectedCards = [];
      state.deckName = null;
      state.deckSavingError = undefined;
    });
    builder.addCase(saveArchenemyDeck.rejected, (state, action) => {
      state.deckSavingError = action.error.message;
      throw new Error(action.error.message || "Error saving deck");
    });
  },
});

export const {
  addCard,
  addCards,
  removeCard,
  clearSelectedCards,
  setDeckName,
  loadDeckForEditing,
  clearEditingDeck,
} = deckBuilderSlice.actions;
