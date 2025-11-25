"use client";

import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Button,
  SimpleGrid,
} from "@mantine/core";
import {
  IconCards,
  IconTrendingUp,
  IconUsers,
  IconPlayCard,
} from "@tabler/icons-react";
import Link from "next/link";

export default function ArchenemyPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Archenemy</Title>
          <Text c="dimmed" size="lg" mt="xs">
            Become the villain. Unleash overwhelming schemes upon your
            opponents.
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md">
              <IconPlayCard size={24} />
              <Text fw={500} size="lg">
                Play Archenemy
              </Text>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              Launch the Archenemy game interface and start scheming against
              your opponents
            </Text>
            <Button
              component={Link}
              href="/game/archenemy"
              variant="filled"
              fullWidth
            >
              Start Game
            </Button>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md">
              <IconCards size={24} />
              <Text fw={500} size="lg">
                Deck Builder
              </Text>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              Create and customize your own scheme deck to dominate your games
            </Text>
            <Button
              component={Link}
              href="/archenemy/decks/builder"
              variant="filled"
              fullWidth
            >
              Build Deck
            </Button>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md">
              <IconTrendingUp size={24} />
              <Text fw={500} size="lg">
                Popular Cards
              </Text>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              Discover the most-liked and frequently used scheme cards in the
              community
            </Text>
            <Button
              component={Link}
              href="/archenemy/popular-cards"
              variant="filled"
              fullWidth
            >
              View Popular Cards
            </Button>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md">
              <IconUsers size={24} />
              <Text fw={500} size="lg">
                Community Decks
              </Text>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              Browse and get inspired by decks created by other Archnemeses
            </Text>
            <Button
              component={Link}
              href="/archenemy/decks/public"
              variant="filled"
              fullWidth
            >
              Browse Decks
            </Button>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
