import {
  render as testingLibraryRender,
  RenderOptions,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { gameSlice } from "~/store/reducers/gameReducer";
import { deckBuilderSlice } from "~/store/reducers/deckBuilderReducer";
import { userSlice } from "~/store/reducers/userReducer";
import type { RootState } from "~/store";

// Create a mock store with initial state
export function createMockStore(initialState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      game: gameSlice.reducer,
      deckBuilder: deckBuilderSlice.reducer,
      user: userSlice.reducer,
    },
    preloadedState: initialState as RootState,
  });
}

type AppStore = ReturnType<typeof createMockStore>;

interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialState?: Partial<RootState>;
  store?: AppStore;
}

// Enhanced render function with Redux and Mantine
export function render(
  ui: React.ReactElement,
  {
    initialState,
    store = createMockStore(initialState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MantineProvider theme={{}}>{children}</MantineProvider>
      </Provider>
    );
  }

  return {
    ...testingLibraryRender(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
}

// Re-export everything from testing library
export * from "@testing-library/react";
