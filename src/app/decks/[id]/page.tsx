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
  Modal,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { getDeckById } from "~/lib/api/decks";
import { CustomArchenemyCard } from "~/types";
import {
  IconArrowLeft,
  IconEdit,
  IconPlayerPlay,
  IconX,
} from "@tabler/icons-react";

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

  // Card zoom modal
  const [selectedCard, setSelectedCard] = useState<CustomArchenemyCard | null>(
    null
  );
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  useEffect(() => {
    const loadDeck = async () => {
      try {
        setLoading(true);
        const deckData = await getDeckById(deckId);
        setDeck(deckData);
      } catch (err) {
        setError("Failed to load deck");
      } finally {
        setLoading(false);
      }
    };

    loadDeck();
  }, [deckId]);

  const handleCardClick = (card: CustomArchenemyCard) => {
    setSelectedCard(card);
    openModal();
  };

  const handlePlayDeck = () => {
    router.push(`/game/archenemy?deck=${deckId}`);
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
                <Card
                  shadow="sm"
                  padding="xs"
                  radius="md"
                  withBorder
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCardClick(card)}
                >
                  {card.border_crop_image ? (
                    <Card.Section>
                      <Image
                        src={card.border_crop_image}
                        alt={card.name}
                        height={300}
                        fit="contain"
                      />
                    </Card.Section>
                  ) : (
                    <Card.Section>
                      <Image
                        src={card.normal_image}
                        alt={card.name}
                        height={300}
                        fit="contain"
                      />
                    </Card.Section>
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

      {/* Card Zoom Modal */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        size="auto"
        centered
        padding={0}
        withCloseButton={false}
        styles={{
          body: { padding: 0 },
          content: { background: "transparent" },
        }}
      >
        {selectedCard && (
          <Box
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
          >
            <Button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 1000,
              }}
              size="sm"
              radius="xl"
              variant="filled"
              color="dark"
            >
              <IconX size={16} />
            </Button>
            <Image
              src={selectedCard.large_image || selectedCard.normal_image}
              alt={selectedCard.name}
              fit="contain"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                borderRadius: "var(--mantine-radius-md)",
              }}
            />
            <Box
              p="md"
              style={{
                background: "var(--mantine-color-dark-7)",
                borderBottomLeftRadius: "var(--mantine-radius-md)",
                borderBottomRightRadius: "var(--mantine-radius-md)",
              }}
            >
              <Text fw={600} size="lg" c="white">
                {selectedCard.name}
              </Text>
              <Group gap="xs" mt="xs">
                <Badge variant="light" size="sm">
                  {selectedCard.type_line}
                </Badge>
              </Group>
              {selectedCard.oracle_text && (
                <Text size="sm" c="dimmed" mt="sm">
                  {selectedCard.oracle_text}
                </Text>
              )}
            </Box>
          </Box>
        )}
      </Modal>
    </Container>
  );
};

export default DeckDetailPage;
