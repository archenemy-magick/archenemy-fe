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
  HoverCard,
  Image,
  Container,
} from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IconSearch, IconX, IconCopy, IconCards } from "@tabler/icons-react";
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

      // TODO: probably remove this setTimeout?
      router.push("/decks");
    } catch (error) {
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
  const handleToggleLike = async (
    e: React.MouseEvent,
    deckId: string,
    currentlyLiked: boolean
  ) => {
    e.stopPropagation(); // Prevent card click when clicking like button
    setLikingDeck(deckId);

    try {
      if (currentlyLiked) {
        await unlikeDeck(deckId);
        setLikedDecks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(deckId);
          return newSet;
        });
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
    <Container size="xl" p="md">
      <Stack gap="md">
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
                <Card
                  shadow="sm"
                  padding="lg"
                  withBorder
                  h="100%"
                  style={{ cursor: "pointer" }}
                  onClick={() => handlePreviewDeck(deck)}
                >
                  {deck.deck_cards && deck.deck_cards.length > 0 && (
                    <Card.Section mb="md">
                      <Group
                        gap={0}
                        wrap="nowrap"
                        style={{ overflow: "hidden", height: 120 }}
                      >
                        {deck.deck_cards.slice(0, 5).map((card, index) => (
                          <Box
                            key={card.id}
                            style={{
                              flex: 1,
                              height: 120,
                              minWidth: 0,
                            }}
                          >
                            <Image
                              src={card.normal_image}
                              alt={card.name}
                              fit="cover"
                              h={120}
                              style={{
                                filter: "brightness(0.9)",
                              }}
                            />
                          </Box>
                        ))}
                      </Group>
                    </Card.Section>
                  )}
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
                          onClick={(e) =>
                            handleToggleLike(
                              e,
                              deck.id,
                              likedDecks.has(deck.id)
                            )
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

                      <Button
                        leftSection={<IconCopy size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloneDeck(deck);
                        }}
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
                <Grid>
                  {previewDeck.deck_cards?.map(
                    (card: CustomArchenemyCard, index: number) => (
                      <Grid.Col key={index} span={{ base: 6, sm: 4, md: 3 }}>
                        <HoverCard width={320} shadow="md" position="top">
                          <HoverCard.Target>
                            <Box
                              style={{
                                cursor: "pointer",
                                borderRadius: "var(--mantine-radius-md)",
                                overflow: "hidden",
                                border: "1px solid var(--mantine-color-dark-4)",
                              }}
                            >
                              <Image
                                src={card.normal_image}
                                alt={card.name}
                                fit="contain"
                                style={{
                                  aspectRatio: "5/7",
                                }}
                              />
                            </Box>
                          </HoverCard.Target>
                          <HoverCard.Dropdown>
                            <Stack gap="xs">
                              <Image
                                src={card.normal_image}
                                alt={card.name}
                                fit="contain"
                                radius="md"
                              />
                              <div>
                                <Text fw={600} size="sm">
                                  {card.name}
                                </Text>
                              </div>
                            </Stack>
                          </HoverCard.Dropdown>
                        </HoverCard>
                      </Grid.Col>
                    )
                  )}
                </Grid>
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
    </Container>
  );
};

export default PublicDecksPage;
