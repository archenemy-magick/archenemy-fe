import {
  deckBuilderSlice,
  gameSlice,
  InitialDeckBuilderState,
  InitialGameState,
  InitialUserState,
  lifeTrackerSlice,
  userSlice,
} from "./reducers";

import { combineReducers, configureStore } from "@reduxjs/toolkit";

import { persistReducer, persistStore } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { InitialLifeTrackerState } from "./reducers/lifeTrackerReducer";
import {
  gameTabsSlice,
  InitialGameTabsState,
} from "./reducers/gameTabsReducer";

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

const persistedUserConfig = createdPersistedConfig("user");

const persistedGameReducer = persistReducer(
  persistGameConfig,
  gameSlice.reducer
);

const persistedDeckBuilderReducer = persistReducer(
  persistedDeckBuilderConfig,
  deckBuilderSlice.reducer
);

const persistedUserReducer = persistReducer(
  persistedUserConfig,
  userSlice.reducer
);

const reducers = combineReducers({
  game: persistedGameReducer,
  deckBuilder: persistedDeckBuilderReducer,
  user: persistedUserReducer,
  lifeTracker: lifeTrackerSlice.reducer,
  gameTabs: gameTabsSlice.reducer,
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
  user: InitialUserState;
  lifeTracker: InitialLifeTrackerState;
  gameTabs: InitialGameTabsState;
};
export type AppDispatch = typeof store.dispatch;
