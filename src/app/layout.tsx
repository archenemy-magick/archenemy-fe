"use client";
import { Provider as StoreProvider } from "react-redux";
import { store, persistor } from "../store";

import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";

import CustomMantineProvider from "../components/MantineProvider";
import { AuthProvider } from "~/components";
import { PersistGate } from "redux-persist/lib/integration/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <PersistGate loading={null} persistor={persistor}>
          <StoreProvider store={store}>
            <AuthProvider>
              <CustomMantineProvider>{children}</CustomMantineProvider>
            </AuthProvider>
          </StoreProvider>
        </PersistGate>
      </body>
    </html>
  );
}
