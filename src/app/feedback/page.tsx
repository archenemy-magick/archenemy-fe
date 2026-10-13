"use client";

import { Container, Stack, Text, Title } from "@mantine/core";
import { FeedbackForm } from "~/components/FeedbackForm";

export default function FeedbackPage() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>Feedback</Title>
          <Text c="dimmed">
            Found a bug, have an idea, or just want to say something? We read
            every message.
          </Text>
        </div>
        <FeedbackForm />
      </Stack>
    </Container>
  );
}
