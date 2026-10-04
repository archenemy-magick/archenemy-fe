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
  ThemeIcon,
} from "@mantine/core";
import {
  IconArrowRight,
  IconCards,
  IconPlayCard,
  IconPlus,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { gameUtilityHref } from "~/lib/gameLinks";

const SECTIONS = [
  {
    icon: IconTrendingUp,
    title: "Popular Cards",
    description:
      "The most-liked and most-played scheme cards in the community.",
    href: "/archenemy/popular-cards",
  },
  {
    icon: IconUsers,
    title: "Community Archenemy Decks",
    description:
      "Browse decks other players have shared, and play one in a click.",
    href: "/archenemy/decks/public",
  },
  {
    icon: IconCards,
    title: "My Archenemy Decks",
    description: "Your scheme decks: play, edit, or build a new one.",
    href: "/archenemy/decks",
  },
];

export default function ArchenemyPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end" wrap="wrap">
          <div>
            <Title order={1}>Archenemy</Title>
            <Text c="dimmed" size="lg" mt="xs">
              Become the villain. Unleash overwhelming schemes upon your
              opponents.
            </Text>
          </div>
          <Group gap="sm">
            <Button
              component={Link}
              href={gameUtilityHref("archenemy")}
              leftSection={<IconPlayCard size={18} />}
            >
              Play Archenemy
            </Button>
            <Button
              component={Link}
              href="/archenemy/decks/builder"
              variant="light"
              leftSection={<IconPlus size={18} />}
            >
              Build a deck
            </Button>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.href}
                component={Link}
                href={section.href}
                padding="xl"
                withBorder
                className="card-hover"
              >
                <Stack gap="md" h="100%">
                  <ThemeIcon
                    size={56}
                    radius="md"
                    variant="light"
                    color="magenta"
                  >
                    <Icon size={28} />
                  </ThemeIcon>
                  <div style={{ flex: 1 }}>
                    <Text fw={700} size="lg" mb="xs">
                      {section.title}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {section.description}
                    </Text>
                  </div>
                  <Group gap={4}>
                    <Text size="sm" fw={600} c="magenta">
                      Open
                    </Text>
                    <IconArrowRight
                      size={16}
                      color="var(--mantine-color-magenta-5)"
                    />
                  </Group>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
