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
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllArchenemyCards,
  chooseSingleCard,
  abandonScheme,
  startGame,
  selectDeck,
  endGame,
} from "src/store/reducers";
import { Carousel } from "@mantine/carousel";
import type { RootState } from "~/store";
import type { AppDispatch } from "~/store/configureStore";
import { ScryfallCard } from "@scryfall/api-types";
import DeckSelectorModal from "~/components/DeckSelectorModal";
import CardSlot from "../common/CardSlot";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();

  const onSelectDeck = () => {
    // TODO: this will be where we select the deck, save and start the game, fetch cards, etc.
    dispatch(selectDeck());
    dispatch(startGame());
    closeDeckModal();
  };

  const [deckModalOpened, { open: openDeckModal, close: closeDeckModal }] =
    useDisclosure(true);

  const { currentCard, previousCards, ongoingCards } = useSelector(
    (state: RootState) => state.cards
  );
  const { gameStarted, deckSelected, gameEnded } = useSelector(
    (state: RootState) => state.game
  );

  useEffect(() => {
    if (gameStarted) {
      // TODO: in the future, unless they choose the default deck, we can display only their deck
      dispatch(fetchAllArchenemyCards());
    }
  }, [dispatch, gameStarted]);

  const [cardModalOpened, { open: openCardModal, close: closeCardModal }] =
    useDisclosure(false);
  const [selectedModalCard, setSelectedModalCard] =
    useState<ScryfallCard.Scheme | null>(null);

  const displayCardInModal = (card: ScryfallCard.Scheme) => {
    setSelectedModalCard(card);
    openCardModal();
  };

  return (
    <Grid>
      {/* TODO: make this a common component */}
      <DeckSelectorModal
        open={!gameStarted}
        onClose={closeDeckModal}
        onSelectDeck={onSelectDeck}
      />
      <Modal
        opened={cardModalOpened}
        onClose={closeCardModal}
        title={selectedModalCard?.name || "Card"}
        size="lg"
      >
        {selectedModalCard && <CardCard card={selectedModalCard} />}
      </Modal>
      <Grid.Col span={4} mt="md">
        <Group justify="" style={{ height: "100vh" }}>
          <Box>
            <Title order={3} ml="md">
              Current Scheme
            </Title>

            <Center>
              <Stack gap="xs">
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
        </Group>
      </Grid.Col>
      <Grid.Col span={8} mt="md">
        <Stack>
          <Box>
            <Title order={3}>Previous Schemes</Title>
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
                mt="md"
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
          <Box>
            {/* TODO: make this a reusable component */}
            <Title order={3}>Ongoing Schemes</Title>
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
                mt="md"
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
