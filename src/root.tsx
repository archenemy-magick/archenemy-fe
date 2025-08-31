import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
