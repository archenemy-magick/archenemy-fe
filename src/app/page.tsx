"use client";

import { Container, Stack, Title, Button, Text } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="lg">
        <Title order={1}>Welcome to Archenemy</Title>
        <Text size="lg" c="dimmed" ta="center">
          Build and play with Archenemy scheme decks
        </Text>
        <Stack gap="sm" align="center">
          <Button size="lg" onClick={() => router.push("/signin")}>
            Sign In
          </Button>
          <Button
            size="lg"
            variant="light"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/decks")}
          >
            View Decks
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
