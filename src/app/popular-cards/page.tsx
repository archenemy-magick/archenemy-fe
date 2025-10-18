"use client";

import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  Image,
  Grid,
  Paper,
  Center,
  Button,
  Divider,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import {
  IconTrophy,
  IconUsers,
  IconCards,
  IconPlus,
} from "@tabler/icons-react";
import { getPopularCards } from "~/lib/api/decks";
import { CustomArchenemyCard } from "~/types";
import CheckableCard from "~/components/common/CheckableCard/CheckableCard";
import SaveDeckModal from "~/components/SaveDeckModal";
import { useDispatch } from "react-redux";
import { AppDispatch } from "~/store";
import { saveArchenemyDeck } from "~/store/thunks";

type PopularCard = CustomArchenemyCard & {
  deck_count: number;
  unique_users: number;
};

const PopularCardsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [cards, setCards] = useState<PopularCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState<CustomArchenemyCard[]>([]);
  const [deckIsSaving, setDeckIsSaving] = useState(false);

  const [
    saveDeckModalOpened,
    { open: openSaveDeckModal, close: closeSaveDeckModal },
  ] = useDisclosure(false);

  useEffect(() => {
    const fetchPopularCards = async () => {
      try {
        setLoading(true);
        const data = await getPopularCards(50);
        setCards(data);
      } catch (error) {
        console.error("Error fetching popular cards:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load popular cards",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCards();
  }, []);

  const handleCardClick = (card: PopularCard) => {
    setSelectedCards((prev) => {
      const isSelected = prev.some((c) => c.id === card.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== card.id);
      } else {
        return [...prev, card];
      }
    });
  };

  const handleSaveDeck = async ({
    deckName,
    description,
    cards,
  }: {
    deckName: string;
    description?: string;
    cards: CustomArchenemyCard[];
  }) => {
    setDeckIsSaving(true);

    try {
      await dispatch(
        saveArchenemyDeck({
          deckName,
          description,
          selectedCards: cards,
        })
      ).unwrap();

      notifications.show({
        title: "Deck Saved",
        message: "Your deck has been created successfully!",
        color: "green",
      });

      closeSaveDeckModal();
      setSelectedCards([]);

      // Navigate to My Decks
      setTimeout(() => {
        router.push("/decks");
      }, 1000);
    } catch (error) {
      console.error("Error saving deck:", error);
      notifications.show({
        title: "Error",
        message: "There was an error saving your deck. Please try again.",
        color: "red",
      });
    } finally {
      setDeckIsSaving(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedCards([]);
    notifications.show({
      message: "Selection cleared",
      color: "blue",
    });
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Text>Loading popular cards...</Text>
        </Center>
      </Container>
    );
  }

  const topCard = cards[0];
  const isCardSelected = (cardId: string) =>
    selectedCards.some((c) => c.id === cardId);

  return (
    <Container size="xl" py="xl">
      <SaveDeckModal
        open={saveDeckModalOpened}
        onClose={closeSaveDeckModal}
        onSaveDeck={handleSaveDeck}
        cards={selectedCards}
        deckIsSaving={deckIsSaving}
      />

      <Stack gap="xl">
        {/* Header with Selection Info */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>
              <Group gap="xs">
                <IconTrophy size={32} />
                Most Popular Cards
              </Group>
            </Title>
            <Text c="dimmed" size="sm">
              Click cards to select them and build a deck from popular choices
            </Text>
          </div>

          {selectedCards.length > 0 && (
            <Paper p="md" withBorder>
              <Stack gap="xs">
                <Badge size="lg" color="magenta">
                  {selectedCards.length} cards selected
                </Badge>
                <Group gap="xs">
                  <Button
                    size="sm"
                    color="magenta"
                    leftSection={<IconPlus size={16} />}
                    onClick={openSaveDeckModal}
                  >
                    Save as Deck
                  </Button>
                  <Button
                    size="sm"
                    variant="subtle"
                    color="gray"
                    onClick={handleClearSelection}
                  >
                    Clear
                  </Button>
                </Group>
              </Stack>
            </Paper>
          )}
        </Group>

        {/* Top Card Highlight */}
        {topCard && (
          <Paper
            p="xl"
            withBorder
            style={{
              background: isCardSelected(topCard.id)
                ? "linear-gradient(135deg, var(--mantine-color-magenta-7), var(--mantine-color-magenta-6))"
                : "linear-gradient(135deg, var(--mantine-color-magenta-6), var(--mantine-color-gold-5))",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 32px rgba(233, 30, 140, 0.3)",
            }}
            onClick={() => handleCardClick(topCard)}
          >
            <Group align="flex-start">
              <div style={{ position: "relative" }}>
                <Image
                  src={topCard.normal_image}
                  alt={topCard.name}
                  w={200}
                  radius="md"
                  style={{
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
                  }}
                />
                {isCardSelected(topCard.id) && (
                  <Badge
                    size="lg"
                    variant="filled"
                    color="magenta"
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
                  >
                    ✓ Selected
                  </Badge>
                )}
              </div>
              <Stack gap="sm" style={{ flex: 1 }}>
                <Group justify="space-between">
                  <div>
                    <Badge
                      size="lg"
                      variant="gradient"
                      gradient={{ from: "gold", to: "yellow", deg: 90 }}
                      mb="xs"
                      style={{
                        color: "#000",
                        fontWeight: 700,
                      }}
                    >
                      🏆 #1 Most Popular
                    </Badge>
                    <Title order={2} c="white">
                      {topCard.name}
                    </Title>
                  </div>
                </Group>

                <Text size="sm" style={{ fontStyle: "italic" }} c="gray.1">
                  {topCard.oracle_text}
                </Text>

                <Group gap="xl" mt="md">
                  <div>
                    <Group gap="xs">
                      <IconCards size={20} color="white" />
                      <Text size="xl" fw={700} c="white">
                        {topCard.deck_count}
                      </Text>
                    </Group>
                    <Text size="xs" c="gray.2">
                      Decks
                    </Text>
                  </div>
                  <div>
                    <Group gap="xs">
                      <IconUsers size={20} color="white" />
                      <Text size="xl" fw={700} c="white">
                        {topCard.unique_users}
                      </Text>
                    </Group>
                    <Text size="xs" c="gray.2">
                      Users
                    </Text>
                  </div>
                </Group>

                <Text size="sm" c="gray.2" mt="xs">
                  {isCardSelected(topCard.id)
                    ? "Click to deselect"
                    : "Click to add to your deck"}
                </Text>
              </Stack>
            </Group>
          </Paper>
        )}

        <Divider label="All Popular Cards" labelPosition="center" />

        {/* Cards Grid with CheckableCard */}
        <Grid>
          {cards.map((card, index) => (
            <Grid.Col
              key={card.id}
              span={{ base: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
            >
              <div style={{ position: "relative" }}>
                <CheckableCard
                  card={card}
                  onClick={() => handleCardClick(card)}
                  cardSelected={isCardSelected(card.id)}
                />

                {/* Popularity Badge */}
                <Badge
                  size="sm"
                  variant="light"
                  color={index < 3 ? "gold" : "gray"}
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    fontWeight: index < 3 ? 700 : 500,
                  }}
                >
                  #{index + 1}
                </Badge>

                {/* Stats Badge */}
                <Paper
                  p="xs"
                  withBorder
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    right: 8,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Group gap="xs" justify="space-between">
                    <Group gap={4}>
                      <IconCards size={12} />
                      <Text size="xs" fw={500}>
                        {card.deck_count}
                      </Text>
                    </Group>
                    <Group gap={4}>
                      <IconUsers size={12} />
                      <Text size="xs" fw={500}>
                        {card.unique_users}
                      </Text>
                    </Group>
                  </Group>
                </Paper>
              </div>
            </Grid.Col>
          ))}
        </Grid>

        {cards.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <IconCards size={48} stroke={1.5} color="gray" />
              <Text c="dimmed">No card statistics available yet</Text>
              <Text size="sm" c="dimmed">
                Create and publish some decks to see popular cards!
              </Text>
            </Stack>
          </Center>
        )}
      </Stack>
    </Container>
  );
};

export default PopularCardsPage;
