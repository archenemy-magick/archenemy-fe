"use client";
// TODO: figure out absolute imports
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
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  chooseSingleCard,
  abandonScheme,
  startGame,
  selectDeck,
  endGame,
} from "src/store/reducers";
import { Carousel } from "@mantine/carousel";
import type { RootState } from "~/store";
import type { AppDispatch } from "~/store/configureStore";
import DeckSelectorModal from "~/components/DeckSelectorModal";
import CardSlot from "../common/CardSlot";
import fetchAllArchenemyDecks from "~/store/thunks/fetchAllDecks";
import { CustomArchenemyCard } from "~/types";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSelectDeck = (deckId: string) => {
    // TODO: this will be where we select the deck, save and start the game, fetch cards, etc.
    dispatch(selectDeck({ deckId }));
    dispatch(startGame());
    closeDeckModal();
  };

  const [deckModalOpened, { open: openDeckModal, close: closeDeckModal }] =
    useDisclosure(true);

  const { currentCard, previousCards, ongoingCards } = useSelector(
    (state: RootState) => state.game.cards
  );

  const { gameStarted, deckSelected, gameEnded, decks } = useSelector(
    (state: RootState) => state.game
  );

  useEffect(() => {
    if (!gameStarted && !deckSelected && !gameEnded && decks.length === 0) {
      // TODO: remove this once we have user IDs, user login, etc.
      dispatch(fetchAllArchenemyDecks());
    } else if (gameStarted && deckSelected) {
      // TODO: in the future, unless they choose the default deck, we can display only their deck
      // dispatch(fetchAllArchenemyDecks());
    }
  }, [dispatch, gameStarted, deckSelected, decks]);

  const [cardModalOpened, { open: openCardModal, close: closeCardModal }] =
    useDisclosure(false);
  const [selectedModalCard, setSelectedModalCard] =
    useState<CustomArchenemyCard | null>(null);

  const displayCardInModal = (card: CustomArchenemyCard) => {
    setSelectedModalCard(card);
    openCardModal();
  };

  return (
    <Grid>
      {/* TODO: make this a common component */}
      {decks?.length > 0 && (
        <DeckSelectorModal
          open={!gameStarted && !deckSelected}
          onClose={closeDeckModal}
          onSelectDeck={handleSelectDeck}
          decks={decks}
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
            src={selectedModalCard.normalImage}
            alt={selectedModalCard.name}
          />
        )}
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
          <Stack justify="space-between" style={{ height: "100%" }} gap="xl">
            <Box>
              <Title order={3} m="md">
                Current Scheme
              </Title>

              <Center>
                <Stack gap="xs">
                  {/* TODO: get rid of this or at least add the card modal handler to it */}
                  <CardSlot card={currentCard} emptyMessage="Play a Scheme!" />
                  <Button
                    mt="md"
                    onClick={() => dispatch(chooseSingleCard())}
                    color="blue"
                  >
                    Play {previousCards.length > 0 || currentCard ? "New" : "A"}{" "}
                    Scheme
                  </Button>
                </Stack>
              </Center>
            </Box>
            <Box>
              <Button color="green" onClick={() => dispatch(endGame())}>
                End Game
              </Button>
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
                {previousCards.map((card) => (
                  <Carousel.Slide key={card.id}>
                    <CardCard card={card} onOpenModal={displayCardInModal} />
                    {/* <Image src={card.image_uris?.small} /> */}
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
            {/* TODO: make this a reusable component */}
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
                {ongoingCards.map((card, index) => (
                  <Carousel.Slide key={card.id}>
                    <CardCard
                      buttonText="Abandon Scheme"
                      onButtonClick={() => dispatch(abandonScheme({ index }))}
                      onOpenModal={displayCardInModal}
                      card={card}
                    />
                  </Carousel.Slide>
                ))}
              </Carousel>
            )}
          </Box>
        </Stack>
      </Grid.Col>
    </Grid>
  );
};

export default Home;
