"use client";

import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  Title,
  Badge,
  LoadingOverlay,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getDeckById } from "~/lib/api/decks";
import { CustomArchenemyCard } from "~/types";
import { IconArrowLeft, IconEdit, IconPlayerPlay } from "@tabler/icons-react";

interface DeckWithCards {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  is_archived: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  deck_cards: CustomArchenemyCard[];
}

const DeckDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const deckId = params.id as string;

  const [deck, setDeck] = useState<DeckWithCards | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDeck = async () => {
      try {
        setLoading(true);
        const deckData = await getDeckById(deckId);
        setDeck(deckData);
      } catch (err) {
        console.error("Error loading deck:", err);
        setError("Failed to load deck");
      } finally {
        setLoading(false);
      }
    };

    loadDeck();
  }, [deckId]);

  const handlePlayDeck = () => {
    router.push(`/archenemy?deck=${deckId}`);
  };

  const handleEditDeck = () => {
    router.push(`/decks/builder?edit=${deckId}`);
  };

  if (loading) {
    return (
      <Container>
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  if (error || !deck) {
    return (
      <Container>
        <Stack align="center" mt="xl">
          <Title order={2}>Deck not found</Title>
          <Text c="dimmed">
            {error || "This deck doesn't exist or you don't have access to it"}
          </Text>
          <Button onClick={() => router.push("/decks")}>Back to Decks</Button>
        </Stack>
      </Container>
    );
  }

  console.log("deck in DeckDetailPage", deck);

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push("/decks")}
        >
          Back to Decks
        </Button>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Flex justify="space-between" align="flex-start" mb="md">
            <Box>
              <Group gap="sm" mb="xs">
                <Title order={1}>{deck.name}</Title>
                {deck.is_public ? (
                  <Badge color="green" variant="light">
                    Public
                  </Badge>
                ) : (
                  <Badge color="gray" variant="light">
                    Private
                  </Badge>
                )}
                {deck.is_archived && (
                  <Badge color="red" variant="light">
                    Archived
                  </Badge>
                )}
              </Group>
              {deck.description && (
                <Text size="sm" c="dimmed" mb="xs">
                  {deck.description}
                </Text>
              )}
              <Text size="sm" c="dimmed">
                {deck.deck_cards.length} cards
              </Text>
            </Box>

            <Group>
              <Button
                leftSection={<IconPlayerPlay size={16} />}
                onClick={handlePlayDeck}
                color="green"
              >
                Play
              </Button>
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={handleEditDeck}
                variant="light"
              >
                Edit
              </Button>
            </Group>
          </Flex>
        </Card>

        <Title order={2}>Cards ({deck.deck_cards.length})</Title>

        {deck.deck_cards.length === 0 ? (
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack align="center">
              <Text c="dimmed">This deck doesn&apos;t have any cards yet</Text>
              <Button onClick={handleEditDeck}>Add Cards</Button>
            </Stack>
          </Card>
        ) : (
          <Grid>
            {deck.deck_cards.map((card: CustomArchenemyCard) => (
              <Grid.Col
                key={card.id}
                span={{
                  base: 12,
                  sm: 6,
                  md: 4,
                  lg: 3,
                  xl: 2,
                }}
              >
                <Card shadow="sm" padding="xs" radius="md" withBorder>
                  {card.normal_image ? (
                    <Card.Section>
                      <Image
                        src={card.normal_image}
                        alt={card.name}
                        height={300}
                        fit="contain"
                      />
                    </Card.Section>
                  ) : (
                    <Box
                      h={300}
                      bg="gray.1"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text size="sm" c="dimmed">
                        No image
                      </Text>
                    </Box>
                  )}
                  <Stack gap="xs" mt="xs">
                    <Text fw={500} size="sm">
                      {card.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {card.type_line}
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
};

export default DeckDetailPage;
