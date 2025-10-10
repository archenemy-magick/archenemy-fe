"use client";

import { useDisclosure } from "@mantine/hooks";
import CardCard from "../common/SchemeCard";
import {
  Box,
  Button,
  Grid,
  Title,
  Stack,
  Center,
  Modal,
  Group,
  Image,
  lighten,
  Badge,
  Text,
  Divider,
  ActionIcon,
  Tooltip,
  ScrollArea,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  chooseSingleCard,
  abandonScheme,
  startGame,
  selectDeck,
  endGame,
  undoLastCard,
  shuffleCardPool,
  saveGameState,
  loadGameState,
  clearSavedGame,
} from "~/store/reducers";
import { Carousel } from "@mantine/carousel";
import type { RootState } from "~/store";
import type { AppDispatch } from "~/store/configureStore";
import DeckSelectorModal from "~/components/DeckSelectorModal";
import CardSlot from "../common/CardSlot";
import fetchAllArchenemyDecks from "~/store/thunks/fetchAllDecks";
import { CustomArchenemyCard } from "~/types";
import {
  IconArrowBack,
  IconArrowsShuffle,
  IconDeviceFloppy,
  IconHistory,
  IconCards,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

const ArchenemyGame = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSelectDeck = (deckId: string) => {
    dispatch(selectDeck({ deckId }));
    dispatch(startGame());
    closeDeckModal();
  };

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
    gameHistory = [],
  } = useSelector((state: RootState) => state.game);

  // Check for saved game on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGame = localStorage.getItem("archenemyGameState");
      if (savedGame) {
        const shouldResume = window.confirm(
          "A saved game was found. Would you like to resume it?"
        );
        if (shouldResume) {
          dispatch(loadGameState());
        } else {
          dispatch(clearSavedGame());
        }
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (!gameStarted && !deckSelected && !gameEnded && decks?.length === 0) {
      dispatch(fetchAllArchenemyDecks());
    }
  }, [dispatch, gameStarted, deckSelected, decks, gameEnded]);

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
    <Grid>
      {decks?.length > 0 && (
        <DeckSelectorModal
          open={!gameStarted && !deckSelected}
          onClose={closeDeckModal}
          onSelectDeck={handleSelectDeck}
          decks={decks}
        />
      )}

      {/* Card Detail Modal */}
      <Modal
        opened={cardModalOpened}
        onClose={closeCardModal}
        title={selectedModalCard?.name || "Card"}
        size="lg"
      >
        {selectedModalCard && (
          <Image
            src={selectedModalCard.normal_image}
            alt={selectedModalCard.name}
          />
        )}
      </Modal>

      {/* Game History Modal */}
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

      <Grid.Col
        span={{
          base: 12,
          md: 4,
        }}
      >
        <Box
          style={{
            border: "1px solid #eee",
            borderRadius: "4px",
            backgroundColor: lighten("var(--mantine-color-gray-8)", 0.1),
          }}
        >
          <Stack justify="space-between" style={{ height: "100%" }} gap="md">
            {/* Card Counter */}
            <Box p="md">
              <Group justify="space-between" mb="sm">
                <Badge
                  size="lg"
                  variant="light"
                  leftSection={<IconCards size={14} />}
                >
                  {cardPool.length} remaining
                </Badge>
                <Badge size="lg" variant="light" color="green">
                  {totalCardsPlayed} played
                </Badge>
              </Group>
              <Divider mb="md" />

              <Title order={3} mb="md">
                Current Scheme
              </Title>

              <Center>
                <Stack gap="xs">
                  <CardSlot card={currentCard} emptyMessage="Play a Scheme!" />
                  <Button
                    mt="md"
                    onClick={() => dispatch(chooseSingleCard())}
                    color="blue"
                    disabled={cardPool.length === 0}
                    fullWidth
                  >
                    Play {previousCards.length > 0 || currentCard ? "New" : "A"}{" "}
                    Scheme
                  </Button>
                </Stack>
              </Center>
            </Box>

            {/* Game Controls */}
            <Box p="md">
              <Stack gap="xs">
                <Text size="sm" fw={500} mb="xs">
                  Game Controls
                </Text>

                <Group gap="xs">
                  <Tooltip label="Undo last card">
                    <ActionIcon
                      size="lg"
                      variant="light"
                      onClick={handleUndo}
                      disabled={
                        !currentCard &&
                        previousCards.length === 0 &&
                        ongoingCards.length === 0
                      }
                    >
                      <IconArrowBack size={18} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Shuffle remaining cards">
                    <ActionIcon
                      size="lg"
                      variant="light"
                      onClick={handleShuffle}
                      disabled={cardPool.length === 0}
                    >
                      <IconArrowsShuffle size={18} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Save game">
                    <ActionIcon
                      size="lg"
                      variant="light"
                      color="green"
                      onClick={handleSaveGame}
                    >
                      <IconDeviceFloppy size={18} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="View history">
                    <ActionIcon
                      size="lg"
                      variant="light"
                      color="blue"
                      onClick={openHistory}
                    >
                      <IconHistory size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>

                <Button color="red" onClick={handleEndGame} fullWidth mt="md">
                  End Game
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Grid.Col>

      <Grid.Col
        span={{
          base: 12,
          md: 8,
        }}
      >
        <Stack gap="xl">
          <Box
            style={{
              border: "1px solid #eee",
              borderRadius: "4px",
              backgroundColor: lighten("var(--mantine-color-gray-8)", 0.1),
            }}
          >
            <Title order={3} m="md">
              Previous Schemes
            </Title>
            {previousCards.length === 0 ? (
              <Center style={{ minHeight: 380 }}>No previous schemes</Center>
            ) : (
              <Carousel
                slideSize="200px"
                mih={200}
                slideGap="md"
                controlsOffset="sm"
                controlSize={26}
                withControls
                withIndicators={false}
                orientation="horizontal"
                emblaOptions={{ dragFree: true }}
                m="md"
              >
                {previousCards.map((card: CustomArchenemyCard) => (
                  <Carousel.Slide key={card.id}>
                    <CardCard card={card} onOpenModal={displayCardInModal} />
                  </Carousel.Slide>
                ))}
              </Carousel>
            )}
          </Box>
          <Box
            style={{
              border: "1px solid #eee",
              borderRadius: "4px",
              backgroundColor: lighten("var(--mantine-color-gray-8)", 0.1),
            }}
          >
            <Title order={3} m="md">
              Ongoing Schemes
            </Title>
            {ongoingCards.length === 0 ? (
              <Center style={{ minHeight: 520 }}>No ongoing schemes</Center>
            ) : (
              <Carousel
                slideSize="200px"
                slideGap="md"
                controlsOffset="sm"
                controlSize={26}
                withControls
                withIndicators={false}
                orientation="horizontal"
                emblaOptions={{ dragFree: true }}
                mih={200}
                m="md"
              >
                {ongoingCards.map(
                  (card: CustomArchenemyCard, index: number) => (
                    <Carousel.Slide key={card.id}>
                      <CardCard
                        buttonText="Abandon Scheme"
                        onButtonClick={() => dispatch(abandonScheme({ index }))}
                        onOpenModal={displayCardInModal}
                        card={card}
                      />
                    </Carousel.Slide>
                  )
                )}
              </Carousel>
            )}
          </Box>
        </Stack>
      </Grid.Col>
    </Grid>
  );
};

export default ArchenemyGame;
