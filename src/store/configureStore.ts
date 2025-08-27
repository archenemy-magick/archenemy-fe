import { cardsSlice } from "./reducers";

import { configureStore } from "@reduxjs/toolkit";
import type { ScryfallCard } from "@scryfall/api-types";

const store = configureStore({
  reducer: {
    cards: cardsSlice.reducer,
  },
});

export type RootState = {
  cards: {
    currentCard: ScryfallCard.Any | null;
    previousCards: ScryfallCard.Any[];
    ongoingCards: ScryfallCard.Any[];
  };
};
export type AppDispatch = typeof store.dispatch;

export default store;
