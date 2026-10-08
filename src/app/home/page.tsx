"use client";

import { Container } from "@mantine/core";
import { HomeDashboard } from "~/components/HomeDashboard";

// Signed-in landing page. Middleware sends signed-in visitors here from "/".
export default function HomePage() {
  return (
    <Container size="lg" py="xl">
      <HomeDashboard />
    </Container>
  );
}
