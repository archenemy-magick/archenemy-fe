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
      <Grid.Col span={4}>
        {currentCard && (
          <CardCard onOpenModal={displayCardInModal} card={currentCard} />
        )}
        <Button mt="md" onClick={() => dispatch(chooseSingleCard())}>
          Play {previousCards.length > 0 || currentCard ? "New" : "A"} Scheme
        </Button>
      </Grid.Col>
      <Grid.Col span={8}>
        <Stack>
          <Box>
            {/* TODO: make this a repeatable component */}
            <Title order={3}>Ongoing Schemes</Title>
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
            >
              {ongoingCards.length > 0 ? (
                ongoingCards.map((card, index) => (
                  <Carousel.Slide key={card.id}>
                    <CardCard
                      buttonText="Abandon Scheme"
                      onButtonClick={() => dispatch(abandonScheme({ index }))}
                      onOpenModal={displayCardInModal}
                      card={card}
                    />
                  </Carousel.Slide>
                ))
              ) : (
                <Box style={{ width: "100%", height: "100%" }}>
                  <Center>No ongoing schemes</Center>
                </Box>
              )}
            </Carousel>
          </Box>
          <Box>
            <div>
              <Title order={3}>Previous Schemes</Title>
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
                {previousCards.length > 0 ? (
                  previousCards.map((card) => (
                    <Carousel.Slide key={card.id}>
                      <CardCard card={card} onOpenModal={displayCardInModal} />
                      {/* <Image src={card.image_uris?.small} /> */}
                    </Carousel.Slide>
                  ))
                ) : (
                  <Box style={{ width: "100%", height: "100%" }}>
                    <Center>No previous schemes</Center>
                  </Box>
                )}
              </Carousel>
            </div>
          </Box>
        </Stack>
      </Grid.Col>
    </Grid>
  );
};

export default Home;
