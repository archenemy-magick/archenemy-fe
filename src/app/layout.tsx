"use client";
import { Provider } from "react-redux";
import store from "../store";

import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import CustomMantineProvider from "../components/MantineProvider";

const theme = createTheme({
  // Define your theme here
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <CustomMantineProvider>
          <Provider store={store}>{children}</Provider>
        </CustomMantineProvider>
      </body>
    </html>
  );
}
