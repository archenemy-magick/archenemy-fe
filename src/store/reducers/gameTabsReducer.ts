// store/reducers/gameTabsReducer.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type GameTabType = "archenemy" | "dungeons" | "life-tracker";

interface GameTabConfig {
  deckId?: string;
  dungeonId?: string;
}

interface GameTab {
  id: string;
  type: GameTabType;
  label: string;
  config?: GameTabConfig;
}

export type InitialGameTabsState = {
  tabs: GameTab[];
  activeTabId: string | null;
};

export const initialGameTabsState: InitialGameTabsState = {
  tabs: [],
  activeTabId: null,
};

const gameTabsSliceReducer = {
  // Add a new tab
  addTab(
    state: InitialGameTabsState,
    action: PayloadAction<{
      type: GameTabType;
      label: string;
      config?: GameTabConfig;
    }>
  ) {
    const { type, label, config } = action.payload;
    const newTab: GameTab = {
      id: `${type}-${Date.now()}`,
      type,
      label,
      config,
    };

    state.tabs.push(newTab);
    state.activeTabId = newTab.id;
  },

  // Remove a tab
  removeTab(state: InitialGameTabsState, action: PayloadAction<string>) {
    const tabId = action.payload;
    const index = state.tabs.findIndex((tab) => tab.id === tabId);

    if (index !== -1) {
      state.tabs.splice(index, 1);

      // If we removed the active tab, set a new active tab
      if (state.activeTabId === tabId) {
        if (state.tabs.length > 0) {
          // Set to previous tab or first tab
          const newIndex = Math.max(0, index - 1);
          state.activeTabId = state.tabs[newIndex]?.id || null;
        } else {
          state.activeTabId = null;
        }
      }
    }
  },

  // Set active tab
  setActiveTab(state: InitialGameTabsState, action: PayloadAction<string>) {
    state.activeTabId = action.payload;
  },

  // Update tab label
  updateTabLabel(
    state: InitialGameTabsState,
    action: PayloadAction<{ tabId: string; label: string }>
  ) {
    const { tabId, label } = action.payload;
    const tab = state.tabs.find((t) => t.id === tabId);
    if (tab) {
      tab.label = label;
    }
  },

  // Update tab config
  updateTabConfig(
    state: InitialGameTabsState,
    action: PayloadAction<{ tabId: string; config: GameTabConfig }>
  ) {
    const { tabId, config } = action.payload;
    const tab = state.tabs.find((t) => t.id === tabId);
    if (tab) {
      tab.config = { ...tab.config, ...config };
    }
  },

  // Clear all tabs
  clearAllTabs(state: InitialGameTabsState) {
    state.tabs = [];
    state.activeTabId = null;
  },

  // Restore tabs (called on app init)
  restoreTabs(
    state: InitialGameTabsState,
    action: PayloadAction<{
      tabs: GameTab[];
      activeTabId: string | null;
    }>
  ) {
    state.tabs = action.payload.tabs;
    state.activeTabId = action.payload.activeTabId;
  },
};

export const gameTabsSlice = createSlice({
  name: "gameTabs",
  initialState: initialGameTabsState as InitialGameTabsState,
  reducers: gameTabsSliceReducer,
});

export const {
  addTab,
  removeTab,
  setActiveTab,
  updateTabLabel,
  updateTabConfig,
  clearAllTabs,
  restoreTabs,
} = gameTabsSlice.actions;
