"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Image,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCards } from "@tabler/icons-react";
import { PlayDeckButton } from "~/components/PlayDeckButton";
import { getDefaultArchenemyDecks } from "~/lib/archenemy/defaultDecks";
import type { CustomArchenemyDeck } from "~/types";

export default function BuiltInDecksPage() {
  const [decks, setDecks] = useState<CustomArchenemyDeck[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [viewing, setViewing] = useState<CustomArchenemyDeck | null>(null);

  useEffect(() => {
    getDefaultArchenemyDecks()
      .then(setDecks)
      .catch(() => setFailed(true));
  }, []);

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>Built-in Archenemy Decks</Title>
          <Text c="dimmed">
            Ready-to-play scheme decks. No account or deck building needed.
          </Text>
        </div>

        {failed ? (
          <Text c="red">Could not load decks. Try refreshing the page.</Text>
        ) : decks === null ? (
          <Text c="dimmed">Loading decks…</Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {decks.map((deck) => (
              <Card key={deck.id} withBorder padding="lg" h="100%">
                <Card.Section mb="md">
                  <Group gap={0} wrap="nowrap" style={{ height: 120 }}>
                    {deck.deck_cards.slice(0, 5).map((card) => (
                      <Box key={card.id} style={{ flex: 1, minWidth: 0 }}>
                        <Image
                          src={card.normal_image}
                          alt={card.name}
                          fit="cover"
                          h={120}
                        />
                      </Box>
                    ))}
                  </Group>
                </Card.Section>
                <Stack gap="sm" h="100%" justify="space-between">
                  <div>
                    <Group justify="space-between" wrap="nowrap" mb="xs">
                      <Text fw={700} size="lg">
                        {deck.name}
                      </Text>
                      <Badge variant="light" style={{ flexShrink: 0 }}>
                        {deck.deck_cards.length} cards
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {deck.description}
                    </Text>
                  </div>
                  <Stack gap="xs">
                    <PlayDeckButton deckId={deck.id} fullWidth />
                    <Button
                      variant="subtle"
                      leftSection={<IconCards size={16} />}
                      onClick={() => setViewing(deck)}
                    >
                      View schemes
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Stack>

      <Modal
        opened={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.name}
        size="xl"
      >
        {viewing ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
              {viewing.deck_cards.map((card) => (
                <Image
                  key={card.id}
                  src={card.normal_image}
                  alt={card.name}
                  radius="md"
                  style={{ aspectRatio: "5/7" }}
                  fit="contain"
                />
              ))}
            </SimpleGrid>
            <PlayDeckButton deckId={viewing.id} fullWidth />
          </Stack>
        ) : null}
      </Modal>
    </Container>
  );
}
