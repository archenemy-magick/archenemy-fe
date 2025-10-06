"use client";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  Image,
  Input,
  Stack,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CheckableCard from "../../../components/common/CheckableCard/CheckableCard";
import type { AppDispatch, RootState } from "../../../store";
import { addCard, removeCard } from "../../../store/reducers";
import {
  fetchAllArchenemyCards,
  saveArchenemyDeck,
} from "../../../store/thunks";
import { useDisclosure } from "@mantine/hooks";
import SaveDeckModal from "../../../components/SaveDeckModal";
import { CustomArchenemyCard } from "~/types";
import { notifications } from "@mantine/notifications";

const DeckBuilder = () => {
  const dispatch = useDispatch<AppDispatch>();
  // TODO: display all fetched cards, then maybe have a dropdown for selecting specific sets
  // Create Redux slice
  // Create card cards with checkbox or something
  // Title input
  // Notes input?
  // Save button
  // Save in local state for now, but soon save in DB
  // Display decks on deck list page
  const { cardPool, selectedCards } = useSelector(
    (state: RootState) => state.deckBuilder
  );

  const { id: userId } = useSelector((state: RootState) => state.user);
  const [deckIsSaving, setDeckIsSaving] = useState(false);

  useEffect(() => {
    console.log("selectedCards changed", selectedCards);
  }, [selectedCards]);

  useEffect(() => {
    if (!cardPool || cardPool.length === 0) {
      dispatch(fetchAllArchenemyCards());
    }
  }, [dispatch, cardPool]);

  const [
    saveDeckModalOpened,
    { open: openSaveDeckModal, close: closeSaveDeckModal },
  ] = useDisclosure(false);

  const handleSaveDeck = ({
    deckName,
    cards,
  }: {
    deckName: string;
    cards: CustomArchenemyCard[];
  }) => {
    setDeckIsSaving(true);
    const deck = { cardIds: cards.map((card) => card.id), name: deckName };
    dispatch(saveArchenemyDeck({ deck, userId }))
      .then(() => {
        notifications.show({
          title: "Deck Saved",
          message: "Your deck has been saved successfully!",
          color: "green",
        });
        closeSaveDeckModal();
      })
      .catch(() => {
        console.log("error saving deck");

        notifications.show({
          title: "Error",
          message: "There was an error saving your deck. Please try again.",
          color: "red",
        });
      });
    setDeckIsSaving(false);
    // closeSaveDeckModal();
    // TODO: show some kind of success message or something
  };

  return (
    <Stack gap="sm" m="sm">
      <SaveDeckModal
        open={saveDeckModalOpened}
        onClose={closeSaveDeckModal}
        onSaveDeck={handleSaveDeck}
        cards={selectedCards}
        deckIsSaving={deckIsSaving}
      />
      <Stack>
        <Flex align="center" justify="space-between">
          <Flex
            direction={{ base: "column", md: "row" }}
            gap="sm"
            align="center"
          >
            <Title order={1}>Deck Builder</Title>
            <Input.Wrapper required>
              <Input placeholder="Enter deck name" />
            </Input.Wrapper>
          </Flex>
          <Button
            onClick={() => {
              openSaveDeckModal();
            }}
            color="green"
            disabled={selectedCards.length === 0}
          >
            Save Deck
          </Button>
        </Flex>
      </Stack>

      <Grid>
        {cardPool?.map((card) => (
          <Grid.Col
            span={{
              base: 12,
              sm: 6,
              md: 4,
              lg: 3,
              xl: 2,
            }}
            key={card.id}
          >
            <Box>
              <CheckableCard
                card={card}
                onClick={() =>
                  selectedCards.some((c) => c.id === card.id)
                    ? dispatch(removeCard(card))
                    : dispatch(addCard(card))
                }
                cardSelected={selectedCards.some((c) => c.id === card.id)}
              />
            </Box>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
};

export default DeckBuilder;
