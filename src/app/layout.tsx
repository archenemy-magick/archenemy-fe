"use client";
import { Provider } from "react-redux";
import { store, persistor } from "../store";

import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import CustomMantineProvider from "../components/MantineProvider";
import { PersistGate } from "redux-persist/lib/integration/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <CustomMantineProvider>
          <PersistGate loading={null} persistor={persistor}>
            <Provider store={store}>{children}</Provider>
          </PersistGate>
        </CustomMantineProvider>
      </body>
    </html>
  );
}
