import {
  cardsSlice,
  gameSlice,
  InitialCardsState,
  InitialGameState,
} from "./reducers";

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

const persistRootConfig = {
  key: "root",
  storage,
};

const persistCardsConfig = {
  key: "cards",
  storage,
};

const persistGameConfig = {
  key: "game",
  storage,
};

const persistedCardReducer = persistReducer(
  persistCardsConfig,
  cardsSlice.reducer
);

const persistedGameReducer = persistReducer(
  persistGameConfig,
  gameSlice.reducer
);

const reducers = combineReducers({
  cards: persistedCardReducer,
  game: persistedGameReducer,
});

const persistedReducer = persistReducer(persistRootConfig, reducers);

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
  cards: InitialCardsState;
  game: InitialGameState;
};
export type AppDispatch = typeof store.dispatch;
