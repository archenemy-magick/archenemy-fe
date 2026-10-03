"use client";

import { RecordGameForm } from "~/components/RecordGameForm";
import { Container, Stack, Text, Title } from "@mantine/core";

export default function RecordGamePage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>Record a game</Title>
          <Text c="dimmed">
            Log the table after a match: commanders, colors, ending turn, and
            who won.
          </Text>
        </div>
        <RecordGameForm />
      </Stack>
    </Container>
  );
}
