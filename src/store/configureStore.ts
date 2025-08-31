import { cardsSlice } from "./reducers";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type { ScryfallCard } from "@scryfall/api-types";

import { persistStore, persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: number) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const persistConfig = {
  key: "cards",
  storage,
};

const persistedCardReducer = persistReducer(persistConfig, cardsSlice.reducer);

const reducers = combineReducers({
  cards: persistedCardReducer,
});

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = {
  cards: {
    currentCard: ScryfallCard.Scheme | null;
    previousCards: ScryfallCard.Scheme[];
    ongoingCards: ScryfallCard.Scheme[];
  };
};
export type AppDispatch = typeof store.dispatch;
