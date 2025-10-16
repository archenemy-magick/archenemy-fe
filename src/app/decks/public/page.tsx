"use client";

import {
  Box,
  Button,
  Card,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  Badge,
  ActionIcon,
  Tooltip,
  Modal,
  Divider,
} from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  IconSearch,
  IconX,
  IconCopy,
  IconEye,
  IconCards,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import {
  getPublicDecks,
  cloneDeck,
  likeDeck,
  unlikeDeck,
  getUserLikesForDecks,
} from "~/lib/api/decks";
import { CustomArchenemyCard, CustomArchenemyDeck } from "~/types";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";

// Extend the type to include profiles for public deck view
type PublicDeckWithProfile = CustomArchenemyDeck & {
  profiles?: {
    username: string;
  };
  like_count?: number;
};

const PublicDecksPage = () => {
  const router = useRouter();
  const [publicDecks, setPublicDecks] = useState<PublicDeckWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cloning, setCloning] = useState<string | null>(null);
  const [likedDecks, setLikedDecks] = useState<Set<string>>(new Set());
  const [likingDeck, setLikingDeck] = useState<string | null>(null);

  // Preview modal state
  const [previewDeck, setPreviewDeck] = useState<PublicDeckWithProfile | null>(
    null
  );
  const [previewOpened, { open: openPreview, close: closePreview }] =
    useDisclosure(false);

  // Fetch public decks
  useEffect(() => {
    const fetchPublicDecks = async () => {
      try {
        setLoading(true);
        const data = await getPublicDecks();
        setPublicDecks(data);

        // Fetch user's likes for these decks
        const deckIds = data.map((deck: CustomArchenemyDeck) => deck.id);
        const likes = await getUserLikesForDecks(deckIds);
        setLikedDecks(likes);
      } catch (error) {
        console.error("Error fetching public decks:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load public decks",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPublicDecks();
  }, []);

  // Filter decks based on search
  const filteredDecks = useMemo(() => {
    if (!searchQuery.trim()) return publicDecks;

    const query = searchQuery.toLowerCase();
    return publicDecks.filter((deck) => {
      const nameMatch = deck.name.toLowerCase().includes(query);
      const descMatch = deck.description?.toLowerCase().includes(query);
      const authorMatch = deck.profiles?.username.toLowerCase().includes(query);
      return nameMatch || descMatch || authorMatch;
    });
  }, [publicDecks, searchQuery]);

  // Clone deck handler
  const handleCloneDeck = async (deck: PublicDeckWithProfile) => {
    setCloning(deck.id);

    try {
      await cloneDeck(deck.id);

      notifications.show({
        title: "Deck Cloned!",
        message: `"${deck.name}" has been added to your decks`,
        color: "green",
      });

      // Navigate to user's decks after a short delay
      setTimeout(() => {
        router.push("/decks");
      }, 1500);
    } catch (error) {
      console.error("Error cloning deck:", error);
      notifications.show({
        title: "Error",
        message: "Failed to clone deck. Please try again.",
        color: "red",
      });
    } finally {
      setCloning(null);
    }
  };

  // Preview deck handler
  const handlePreviewDeck = (deck: PublicDeckWithProfile) => {
    setPreviewDeck(deck);
    openPreview();
  };

  // Handle like/unlike
  const handleToggleLike = async (deckId: string, currentlyLiked: boolean) => {
    setLikingDeck(deckId);

    try {
      if (currentlyLiked) {
        await unlikeDeck(deckId);
        setLikedDecks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(deckId);
          return newSet;
        });
        // Update like count in state
        setPublicDecks((decks) =>
          decks.map((deck) =>
            deck.id === deckId
              ? { ...deck, like_count: Math.max((deck.like_count || 0) - 1, 0) }
              : deck
          )
        );
        notifications.show({
          message: "Removed from liked decks",
          color: "blue",
        });
      } else {
        await likeDeck(deckId);
        setLikedDecks((prev) => new Set([...prev, deckId]));
        // Update like count in state
        setPublicDecks((decks) =>
          decks.map((deck) =>
            deck.id === deckId
              ? { ...deck, like_count: (deck.like_count || 0) + 1 }
              : deck
          )
        );
        notifications.show({
          message: "Added to liked decks",
          color: "pink",
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update like. Please try again.",
        color: "red",
      });
    } finally {
      setLikingDeck(null);
    }
  };

  if (loading) {
    return (
      <Stack gap="sm" m="sm" align="center">
        <Title order={1}>Loading public decks...</Title>
      </Stack>
    );
  }

  return (
    <Stack gap="md" m="sm">
      {/* Header */}
      <Group justify="space-between" align="center">
        <div>
          <Title order={1}>Public Decks</Title>
          <Text c="dimmed" size="sm">
            Discover and clone decks from the community
          </Text>
        </div>
        <Button onClick={() => router.push("/decks")}>My Decks</Button>
      </Group>

      {/* Search Bar */}
      <TextInput
        placeholder="Search by deck name, description, or author..."
        leftSection={<IconSearch size={16} />}
        rightSection={
          searchQuery && (
            <IconX
              size={16}
              style={{ cursor: "pointer" }}
              onClick={() => setSearchQuery("")}
            />
          )
        }
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        size="md"
      />

      {/* Results Summary */}
      <Group gap="xs">
        <Badge variant="light" size="lg">
          {filteredDecks.length} decks found
        </Badge>
        {searchQuery && (
          <Badge variant="light" color="blue" size="lg">
            Filtered from {publicDecks.length} total
          </Badge>
        )}
      </Group>

      {/* Deck Grid */}
      {filteredDecks.length === 0 ? (
        <Card padding="xl" withBorder>
          <Stack align="center" gap="md">
            <IconCards size={48} stroke={1.5} color="gray" />
            <Title order={3} c="dimmed">
              {searchQuery
                ? "No decks match your search"
                : "No public decks yet"}
            </Title>
            <Text c="dimmed" ta="center">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Be the first to share a deck with the community!"}
            </Text>
            {!searchQuery && (
              <Button onClick={() => router.push("/decks/builder")}>
                Build a Deck
              </Button>
            )}
          </Stack>
        </Card>
      ) : (
        <Grid>
          {filteredDecks.map((deck) => (
            <Grid.Col key={deck.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" padding="lg" withBorder h="100%">
                <Stack justify="space-between" h="100%">
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text fw={600} size="lg" lineClamp={1}>
                        {deck.name}
                      </Text>
                      <Group gap="xs">
                        <Badge variant="light" size="sm">
                          {deck.deck_cards?.length || 0} cards
                        </Badge>
                        {deck.like_count !== undefined &&
                          deck.like_count > 0 && (
                            <Badge variant="light" color="pink" size="sm">
                              {deck.like_count} ❤️
                            </Badge>
                          )}
                      </Group>
                    </Group>

                    {deck.description && (
                      <Text size="sm" c="dimmed" lineClamp={2} mb="sm">
                        {deck.description}
                      </Text>
                    )}

                    <Group gap="xs" mb="md">
                      <Text size="xs" c="dimmed">
                        by {deck.profiles?.username || "Unknown"}
                      </Text>
                      <Text size="xs" c="dimmed">
                        •
                      </Text>
                      <Text size="xs" c="dimmed">
                        {new Date(deck.created_at).toLocaleDateString()}
                      </Text>
                    </Group>
                  </div>

                  <Group gap="xs">
                    <Tooltip
                      label={likedDecks.has(deck.id) ? "Unlike" : "Like"}
                    >
                      <ActionIcon
                        variant="light"
                        size="lg"
                        color={likedDecks.has(deck.id) ? "pink" : "gray"}
                        onClick={() =>
                          handleToggleLike(deck.id, likedDecks.has(deck.id))
                        }
                        loading={likingDeck === deck.id}
                      >
                        {likedDecks.has(deck.id) ? (
                          <IconHeartFilled size={18} />
                        ) : (
                          <IconHeart size={18} />
                        )}
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Preview deck">
                      <ActionIcon
                        variant="light"
                        size="lg"
                        onClick={() => handlePreviewDeck(deck)}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Button
                      leftSection={<IconCopy size={16} />}
                      onClick={() => handleCloneDeck(deck)}
                      loading={cloning === deck.id}
                      disabled={cloning !== null}
                      fullWidth
                      variant="light"
                    >
                      Clone to My Decks
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* Preview Modal */}
      <Modal
        opened={previewOpened}
        onClose={closePreview}
        title={
          <Group gap="xs">
            <Text fw={600} size="lg">
              {previewDeck?.name}
            </Text>
            <Badge variant="light">
              {previewDeck?.deck_cards?.length || 0} cards
            </Badge>
          </Group>
        }
        size="xl"
      >
        {previewDeck && (
          <Stack gap="md">
            {previewDeck.description && (
              <>
                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Description
                  </Text>
                  <Text size="sm" c="dimmed">
                    {previewDeck.description}
                  </Text>
                </div>
                <Divider />
              </>
            )}

            <div>
              <Text size="sm" fw={500} mb="xs">
                Deck Creator
              </Text>
              <Text size="sm" c="dimmed">
                {previewDeck.profiles?.username || "Unknown"}
              </Text>
            </div>

            <Divider />

            <div>
              <Text size="sm" fw={500} mb="md">
                Cards in this Deck
              </Text>
              <Stack gap="xs">
                {previewDeck.deck_cards?.map(
                  (card: CustomArchenemyCard, index: number) => (
                    <Card key={index} padding="xs" withBorder>
                      <Group justify="space-between">
                        <Text size="sm">{card.name}</Text>
                        <Badge size="xs" variant="light">
                          {card.type_line}
                        </Badge>
                      </Group>
                    </Card>
                  )
                )}
              </Stack>
            </div>

            <Button
              leftSection={<IconCopy size={16} />}
              onClick={() => {
                handleCloneDeck(previewDeck);
                closePreview();
              }}
              loading={cloning === previewDeck.id}
              fullWidth
            >
              Clone to My Decks
            </Button>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
};

export default PublicDecksPage;
