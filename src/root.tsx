import { Provider } from "react-redux";
import store from "./store";

import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <Provider store={store}>{children}</Provider>
      </body>
    </html>
  );
}
