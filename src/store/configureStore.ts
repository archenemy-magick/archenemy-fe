import { cardsSlice } from "./reducers";

import { configureStore } from "@reduxjs/toolkit";
import type { ScryfallCard } from "@scryfall/api-types";

const store = configureStore({
  reducer: {
    cards: cardsSlice.reducer,
  },
});

export type RootState = {
  currentCard: ScryfallCard.Scheme;
  previousCards: ScryfallCard.Scheme[];
  ongoingCards: ScryfallCard.Scheme[];
  cardPool: ScryfallCard.Scheme[];
};
export type AppDispatch = typeof store.dispatch;

export default store;
