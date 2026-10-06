"use client";

import { Carousel } from "@mantine/carousel";
import {
  Badge,
  Box,
  Button,
  Center,
  Grid,
  Group,
  Image,
  Modal,
  Paper,
  Progress,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconArrowBack,
  IconArrowsShuffle,
  IconCards,
  IconDeviceFloppy,
  IconHistory,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ArchenemyDeckSelectorModal from "~/components/ArchenemyDeckSelectorModal";
import type { RootState } from "~/store";
import type { AppDispatch } from "~/store/configureStore";
import {
  abandonScheme,
  chooseSingleCard,
  clearSavedGame,
  endGame,
  loadGameState,
  saveGameState,
  selectDeck,
  shuffleCardPool,
  startGame,
  startGameWithDeck,
  undoLastCard,
} from "~/store/reducers";
import { updateTabConfig } from "~/store/reducers/gameTabsReducer";
import { getDeckById } from "~/lib/api/decks";
import { parseGameUtilityParams } from "~/lib/gameLinks";
import {
  getDefaultArchenemyDecks,
  isDefaultDeckId,
} from "~/lib/archenemy/defaultDecks";
import fetchAllArchenemyDecks from "~/store/thunks/fetchAllDecks";
import { CustomArchenemyCard, CustomArchenemyDeck } from "~/types";

const ArchenemyGame = ({ tabId = "default" }: { tabId?: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );

  // Built-in decks: playable by everyone, including signed-out visitors.
  const [defaultDecks, setDefaultDecks] = useState<CustomArchenemyDeck[]>([]);
  const [defaultDecksLoaded, setDefaultDecksLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    getDefaultArchenemyDecks()
      .then((loaded) => {
        if (!cancelled) setDefaultDecks(loaded);
      })
      .catch(() => {
        // The picker still shows the user's own decks.
      })
      .finally(() => {
        if (!cancelled) setDefaultDecksLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectDeck = (deckId: string) => {
    if (isDefaultDeckId(deckId)) {
      const deck = defaultDecks.find((d) => d.id === deckId);
      if (deck) dispatch(startGameWithDeck(deck));
    } else {
      dispatch(selectDeck({ deckId }));
      dispatch(startGame());
    }
    closeDeckModal();
  };
  const isDesktop = useMediaQuery("(min-width: 1200px)");

  const [deckModalOpened, { open: openDeckModal, close: closeDeckModal }] =
    useDisclosure(true);

  const { currentCard, previousCards, ongoingCards, cardPool } = useSelector(
    (state: RootState) => state.game.cards
  );

  const {
    gameStarted,
    deckSelected,
    gameEnded,
    decks,
    selectedDeckId,
    gameHistory = [],
  } = useSelector((state: RootState) => state.game);

  // A deck requested by a "Play" link (see lib/gameLinks). "placeholder" is
  // what the New Utility menu sets when no deck is chosen yet.
  const configDeckId = useSelector(
    (state: RootState) =>
      state.gameTabs.tabs.find((tab) => tab.id === tabId)?.config?.deckId
  );
  const requestedDeckId =
    configDeckId && configDeckId !== "placeholder" ? configDeckId : null;
  const [loadingRequestedDeck, setLoadingRequestedDeck] = useState(false);

  useEffect(() => {
    if (!requestedDeckId) return;
    let cancelled = false;
    const clearRequest = () =>
      dispatch(updateTabConfig({ tabId, config: { deckId: undefined } }));

    // Already playing this deck: just show it.
    if (gameStarted && selectedDeckId === requestedDeckId) {
      clearRequest();
      return;
    }

    (async () => {
      setLoadingRequestedDeck(true);
      try {
        // Yield once so a cancelled (StrictMode) run never reaches confirm().
        await Promise.resolve();
        if (cancelled) return;
        const deck = isDefaultDeckId(requestedDeckId)
          ? (await getDefaultArchenemyDecks()).find(
              (d) => d.id === requestedDeckId
            )
          : decks.find((d) => d.id === requestedDeckId) ??
            (await getDeckById(requestedDeckId));
        if (cancelled) return;
        if (!deck) throw new Error("Deck not found");

        if (gameStarted) {
          const replace = window.confirm(
            `You have an Archenemy game in progress. End it and start "${deck.name}"?`
          );
          if (!replace) return;
          dispatch(endGame());
          dispatch(clearSavedGame());
        }

        dispatch(startGameWithDeck(deck));
        closeDeckModal();
      } catch {
        if (!cancelled) {
          notifications.show({
            title: "Could not load deck",
            message: "It may have been deleted or made private.",
            color: "red",
          });
        }
      } finally {
        if (!cancelled) {
          setLoadingRequestedDeck(false);
          clearRequest();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // Runs once per request; game state is read at that moment on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedDeckId]);

  // Check for saved game on mount. Skipped when a Play link chose a deck:
  // that flow asks about any game in progress itself. The /game page
  // applies ?deck= after this child effect runs, so check the URL too.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const deckFromUrl = parseGameUtilityParams(window.location.search).deckId;
    if (requestedDeckId || deckFromUrl) return;

    const savedGame = localStorage.getItem("archenemyGameState");
    if (!savedGame) return;
    const shouldResume = window.confirm(
      "A saved game was found. Would you like to resume it?"
    );
    if (shouldResume) {
      dispatch(loadGameState());
    } else {
      dispatch(clearSavedGame());
    }
    // Mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Signed-in users' own decks, fetched once. (Re-running on `decks` would
  // loop forever for a user with no decks: each fetch stores a new [].)
  const fetchedUserDecks = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || fetchedUserDecks.current) return;
    if (!gameStarted && !deckSelected && !gameEnded && decks?.length === 0) {
      fetchedUserDecks.current = true;
      dispatch(fetchAllArchenemyDecks());
    }
  }, [dispatch, isAuthenticated, gameStarted, deckSelected, decks, gameEnded]);

  const [cardModalOpened, { open: openCardModal, close: closeCardModal }] =
    useDisclosure(false);
  const [selectedModalCard, setSelectedModalCard] =
    useState<CustomArchenemyCard | null>(null);

  const [historyOpened, { open: openHistory, close: closeHistory }] =
    useDisclosure(false);

  const displayCardInModal = (card: CustomArchenemyCard) => {
    setSelectedModalCard(card);
    openCardModal();
  };

  const handleUndo = () => {
    dispatch(undoLastCard());
    notifications.show({
      title: "Card Undone",
      message: "Moved back to the previous card",
      color: "blue",
    });
  };

  const handleShuffle = () => {
    dispatch(shuffleCardPool());
    notifications.show({
      title: "Deck Shuffled",
      message: "Remaining cards have been shuffled",
      color: "blue",
    });
  };

  const handleSaveGame = () => {
    dispatch(saveGameState());
    notifications.show({
      title: "Game Saved",
      message: "Your progress has been saved",
      color: "green",
    });
  };

  const handleEndGame = () => {
    const confirmed = window.confirm(
      "Are you sure you want to end this game? This will clear your saved progress."
    );
    if (confirmed) {
      dispatch(endGame());
      dispatch(clearSavedGame());
    }
  };

  const totalCardsPlayed =
    previousCards.length + ongoingCards.length + (currentCard ? 1 : 0);
  const totalCards = cardPool.length + totalCardsPlayed;

  return (
    <Stack
      gap="md"
      p="md"
      style={{
        minHeight: "100vh",
      }}
    >
      {(defaultDecksLoaded || decks?.length > 0) && (
        <ArchenemyDeckSelectorModal
          open={
            !gameStarted &&
            !deckSelected &&
            !requestedDeckId &&
            !loadingRequestedDeck
          }
          onClose={closeDeckModal}
          onSelectDeck={handleSelectDeck}
          decks={isAuthenticated ? decks : []}
          defaultDecks={defaultDecks}
          isAuthenticated={isAuthenticated}
        />
      )}
      <Modal
        opened={cardModalOpened}
        onClose={closeCardModal}
        title={selectedModalCard?.name || "Card"}
        size="lg"
      >
        {selectedModalCard && (
          <Image
            src={selectedModalCard.border_crop_image}
            alt={selectedModalCard.name}
          />
        )}
      </Modal>
      <Modal
        opened={historyOpened}
        onClose={closeHistory}
        title="Game History"
        size="md"
      >
        <ScrollArea h={400}>
          <Stack gap="xs">
            {gameHistory.length === 0 ? (
              <Text c="dimmed" ta="center">
                No history yet
              </Text>
            ) : (
              gameHistory
                .slice()
                .reverse()
                .map((entry, index) => {
                  const card = [
                    ...previousCards,
                    ...ongoingCards,
                    currentCard,
                  ].find((c) => c?.id === entry.cardId);
                  return (
                    <Box
                      key={index}
                      p="xs"
                      style={{ border: "1px solid #eee", borderRadius: 4 }}
                    >
                      <Group justify="space-between">
                        <div>
                          <Text size="sm" fw={500}>
                            {card?.name || "Unknown Card"}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {entry.action === "played" && "▶️ Played"}
                            {entry.action === "abandoned" && "⏸️ Abandoned"}
                            {entry.action === "undone" && "↩️ Undone"}
                          </Text>
                        </div>
                        <Text size="xs" c="dimmed">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </Text>
                      </Group>
                    </Box>
                  );
                })
            )}
          </Stack>
        </ScrollArea>
      </Modal>
      <Grid gutter="md">
        {/* LEFT COLUMN - Current Scheme & Controls */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          {/* <GamePageAd slot="1234567890" position="top" /> */}
          <Stack gap="md">
            {/* Stats Card */}
            <Paper p="md" withBorder>
              <Group justify="space-between" mb="md">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Remaining
                  </Text>
                  <Group gap="xs">
                    <IconCards size={20} color="var(--mantine-color-blue-4)" />
                    <Text size="xl" fw={700}>
                      {cardPool.length}
                    </Text>
                  </Group>
                </div>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Played
                  </Text>
                  <Group gap="xs">
                    <Text size="xl" fw={700}>
                      {totalCardsPlayed}
                    </Text>
                  </Group>
                </div>
              </Group>
              <Progress
                value={(totalCardsPlayed / totalCards) * 100}
                color="magenta"
                size="sm"
                radius="xl"
              />
            </Paper>

            {/* Current Scheme Card */}
            <Paper p="lg" withBorder>
              <Title order={3} mb="md" c="magenta.4">
                Current Scheme
              </Title>

              <Center>
                <Stack gap="md" style={{ width: "100%", maxWidth: 300 }}>
                  {currentCard ? (
                    <Box
                      style={{
                        borderRadius: "var(--mantine-radius-md)",
                        overflow: "hidden",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                      }}
                    >
                      <Image
                        src={currentCard.border_crop_image}
                        alt={currentCard.name}
                        onClick={() => displayCardInModal(currentCard)}
                        style={{ cursor: "pointer" }}
                      />
                    </Box>
                  ) : (
                    <Box
                      p="xl"
                      style={{
                        border: "2px dashed var(--mantine-color-dark-4)",
                        borderRadius: "var(--mantine-radius-md)",
                        textAlign: "center",
                      }}
                    >
                      <IconCards
                        size={48}
                        color="var(--mantine-color-dark-4)"
                      />
                      <Text c="dimmed" mt="md">
                        No scheme played yet
                      </Text>
                    </Box>
                  )}

                  <Button
                    onClick={() => dispatch(chooseSingleCard())}
                    disabled={cardPool.length === 0}
                    size="lg"
                    fullWidth
                    gradient={{ from: "magenta", to: "grape", deg: 135 }}
                    variant="gradient"
                  >
                    Play {previousCards.length > 0 || currentCard ? "New" : "A"}{" "}
                    Scheme
                  </Button>
                </Stack>
              </Center>
            </Paper>

            {/* Game Controls */}
            <Paper p="md" withBorder>
              <Text size="sm" fw={600} mb="md" c="dimmed" tt="uppercase">
                Game Controls
              </Text>

              <SimpleGrid cols={2} spacing="xs" mb="md">
                <Tooltip label="Undo last card">
                  <Button
                    variant="light"
                    color="blue"
                    onClick={handleUndo}
                    disabled={!currentCard && previousCards.length === 0}
                    leftSection={<IconArrowBack size={18} />}
                  >
                    Undo
                  </Button>
                </Tooltip>

                <Tooltip label="Shuffle deck">
                  <Button
                    variant="light"
                    color="grape"
                    onClick={handleShuffle}
                    disabled={cardPool.length === 0}
                    leftSection={<IconArrowsShuffle size={18} />}
                  >
                    Shuffle
                  </Button>
                </Tooltip>

                <Tooltip label="Save game">
                  <Button
                    variant="light"
                    color="green"
                    onClick={handleSaveGame}
                    leftSection={<IconDeviceFloppy size={18} />}
                  >
                    Save
                  </Button>
                </Tooltip>

                <Tooltip label="View history">
                  <Button
                    variant="light"
                    color="cyan"
                    onClick={openHistory}
                    leftSection={<IconHistory size={18} />}
                  >
                    History
                  </Button>
                </Tooltip>
              </SimpleGrid>

              <Button
                color="red"
                onClick={handleEndGame}
                fullWidth
                variant="light"
              >
                End Game
              </Button>
            </Paper>
          </Stack>
        </Grid.Col>

        {/* RIGHT COLUMN - Previous & Ongoing Schemes */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            {/* Previous Schemes */}
            <Paper p="lg" withBorder>
              <Group justify="space-between" mb="md">
                <Title order={3} c="blue.4">
                  Previous Schemes
                </Title>
                <Badge variant="light" size="lg">
                  {previousCards.length} cards
                </Badge>
              </Group>

              {previousCards.length === 0 ? (
                <Center py="xl">
                  <Stack align="center" gap="xs">
                    <IconCards size={48} color="var(--mantine-color-dark-4)" />
                    <Text c="dimmed">No previous schemes yet</Text>
                  </Stack>
                </Center>
              ) : (
                <Carousel
                  slideSize="220px"
                  slideGap="md"
                  controlsOffset="sm"
                  controlSize={40}
                  withControls
                  styles={{
                    control: {
                      background: "var(--mantine-color-dark-6)",
                      border: "none",
                      color: "white",
                      "&:hover": {
                        background: "var(--mantine-color-magenta-6)",
                      },
                    },
                  }}
                >
                  {previousCards.map((card) => (
                    <Carousel.Slide key={card.id}>
                      <Box
                        onClick={() => displayCardInModal(card)}
                        style={{
                          borderRadius: "var(--mantine-radius-md)",
                          overflow: "hidden",
                          cursor: "pointer",
                          transition:
                            "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                        className="card-hover"
                      >
                        <Image src={card.border_crop_image} alt={card.name} />
                      </Box>
                    </Carousel.Slide>
                  ))}
                </Carousel>
              )}
            </Paper>

            {/* Ongoing Schemes */}
            <Paper p="lg" withBorder>
              <Group justify="space-between" mb="md">
                <Title order={3} c="grape.4">
                  Ongoing Schemes
                </Title>
                <Badge variant="light" size="lg" color="grape">
                  {ongoingCards.length} active
                </Badge>
              </Group>

              {ongoingCards.length === 0 ? (
                <Center py="xl">
                  <Stack align="center" gap="xs">
                    <IconCards size={48} color="var(--mantine-color-dark-4)" />
                    <Text c="dimmed">No ongoing schemes</Text>
                  </Stack>
                </Center>
              ) : (
                <Carousel
                  slideSize="220px"
                  slideGap="md"
                  controlsOffset="sm"
                  controlSize={40}
                  withControls
                  styles={{
                    control: {
                      background: "var(--mantine-color-dark-6)",
                      border: "none",
                      color: "white",
                      "&:hover": {
                        background: "var(--mantine-color-grape-6)",
                      },
                    },
                  }}
                >
                  {ongoingCards.map((card, index) => (
                    <Carousel.Slide key={card.id}>
                      <Stack gap="xs">
                        <Box
                          onClick={() => displayCardInModal(card)}
                          style={{
                            borderRadius: "var(--mantine-radius-md)",
                            overflow: "hidden",
                            cursor: "pointer",
                          }}
                          className="card-hover"
                        >
                          <Image src={card.border_crop_image} alt={card.name} />
                        </Box>
                        <Button
                          onClick={() => dispatch(abandonScheme({ index }))}
                          color="red"
                          variant="light"
                          size="sm"
                          fullWidth
                        >
                          Abandon
                        </Button>
                      </Stack>
                    </Carousel.Slide>
                  ))}
                </Carousel>
              )}
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default ArchenemyGame;
