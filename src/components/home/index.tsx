"use client";
// TODO: figure out absolute imports
import { useDisclosure } from "@mantine/hooks";
import CardCard from "../common/SchemeCard";
import { Box, Button, Grid, Title, Stack, Center, Modal } from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllArchenemyCards,
  chooseSingleCard,
  abandonScheme,
} from "src/store/reducers";
import { Carousel } from "@mantine/carousel";
import type { RootState } from "~/store";
import type { AppDispatch } from "~/store/configureStore";
import { ScryfallCard } from "@scryfall/api-types";
import DeckSelectorModal from "~/components/DeckSelectorModal";
import CardSlot from "../common/CardSlot";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();

  // TODO: use this boolean to enable the 'start game' button when there are options for more than one deck
  const [hasSelectedDeck, setHasSelectedDeck] = useState(false);
  const [hasStartedGame, setHasStartedGame] = useState(false);

  const onSelectDeck = () => {
    setHasSelectedDeck(true);
    setHasStartedGame(true);
  };

  const [deckModalOpened, { open: openDeckModal, close: closeDeckModal }] =
    useDisclosure(true);

  const onStartGame = () => {
    setHasStartedGame(true);
  };

  const currentCard = useSelector(
    (state: RootState) => state.cards.currentCard
  );
  const previousCards = useSelector(
    (state: RootState) => state.cards.previousCards
  );
  const ongoingCards = useSelector(
    (state: RootState) => state.cards.ongoingCards
  );

  useEffect(() => {
    if (hasStartedGame) {
      // TODO: in the future, unless they choose the default deck, we can display only their deck
      dispatch(fetchAllArchenemyCards());
    }
  }, [dispatch, hasStartedGame]);

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
        open={deckModalOpened && !hasStartedGame}
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
      </Grid.Col>
      <Grid.Col span={8} mt="md">
        <Stack>
          <Box>
            <Title order={3}>Previous Schemes</Title>
            {previousCards.length === 0 ? (
              <Center style={{ minHeight: 630 }}>No previous schemes</Center>
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
