import {
  deckBuilderSlice,
  decksSlice,
  gameSlice,
  InitialDeckBuilderState,
  InitialGameState,
} from "./reducers";

import { combineReducers, configureStore } from "@reduxjs/toolkit";

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

const createdPersistedConfig = (key: string) => ({
  key,
  storage,
});

const persistRootConfig = createdPersistedConfig("root");

const persistGameConfig = createdPersistedConfig("game");

const persistedDeckBuilderConfig = createdPersistedConfig("deckBuilder");

const persistedDecksConfig = createdPersistedConfig("decks");

const persistedGameReducer = persistReducer(
  persistGameConfig,
  gameSlice.reducer
);

const persistedDeckBuilderReducer = persistReducer(
  persistedDeckBuilderConfig,
  deckBuilderSlice.reducer
);

const persistedDecksReducer = persistReducer(
  persistedDecksConfig,
  decksSlice.reducer
);

const reducers = combineReducers({
  game: persistedGameReducer,
  deckBuilder: persistedDeckBuilderReducer,
  decks: persistedDecksReducer,
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
  game: InitialGameState;
  deckBuilder: InitialDeckBuilderState;
};
export type AppDispatch = typeof store.dispatch;
