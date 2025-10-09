"use client";

import { Provider as StoreProvider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";
import { store, persistor } from "~/store";
import CustomMantineProvider from "../MantineProvider";
import AuthProvider from "../AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PersistGate loading={null} persistor={persistor}>
      <StoreProvider store={store}>
        <AuthProvider>
          <CustomMantineProvider>{children}</CustomMantineProvider>
        </AuthProvider>
      </StoreProvider>
    </PersistGate>
  );
}
