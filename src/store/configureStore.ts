import { gameSlice, InitialGameState } from "./reducers";

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

const persistRootConfig = {
  key: "root",
  storage,
};

const persistGameConfig = {
  key: "game",
  storage,
};

const persistedGameReducer = persistReducer(
  persistGameConfig,
  gameSlice.reducer
);

const reducers = combineReducers({
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
  game: InitialGameState;
};
export type AppDispatch = typeof store.dispatch;
