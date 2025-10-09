"use client";
import {
  Box,
  Button,
  Flex,
  Grid,
  Stack,
  Title,
  Text,
  Divider,
} from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import CheckableCard from "../../../components/common/CheckableCard/CheckableCard";
import type { AppDispatch, RootState } from "../../../store";
import {
  addCard,
  removeCard,
  loadDeckForEditing,
  clearEditingDeck,
} from "../../../store/reducers/deckBuilderReducer";
import {
  fetchAllArchenemyCards,
  saveArchenemyDeck,
  updateArchenemyDeck,
} from "~/store/thunks";
import { useDisclosure } from "@mantine/hooks";
import SaveDeckModal from "../../../components/SaveDeckModal";
import { CustomArchenemyCard } from "~/types";
import { notifications } from "@mantine/notifications";
import { getDeckById } from "~/lib/api/decks";

const DeckBuilder = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editDeckId = searchParams.get("edit");

  const {
    cardPool,
    selectedCards,
    editingDeckId,
    editingDeckName,
    editingDeckDescription,
  } = useSelector((state: RootState) => state.deckBuilder);

  const [deckIsSaving, setDeckIsSaving] = useState(false);
  const [isLoadingDeck, setIsLoadingDeck] = useState(false);

  // Separate selected and unselected cards
  const { selectedCardsList, unselectedCardsList } = useMemo(() => {
    const selectedIds = new Set(selectedCards.map((card) => card.id));

    const selected: CustomArchenemyCard[] = [];
    const unselected: CustomArchenemyCard[] = [];

    cardPool.forEach((card) => {
      if (selectedIds.has(card.id)) {
        selected.push(card);
      } else {
        unselected.push(card);
      }
    });

    return {
      selectedCardsList: selected,
      unselectedCardsList: unselected,
    };
  }, [cardPool, selectedCards]);

  // Load deck for editing if edit param exists
  useEffect(() => {
    const loadDeck = async () => {
      if (editDeckId && editDeckId !== editingDeckId) {
        setIsLoadingDeck(true);
        try {
          const deck = await getDeckById(editDeckId);
          dispatch(
            loadDeckForEditing({
              deckId: deck.id,
              deckName: deck.name,
              deckDescription: deck.description,
              cards: deck.deck_cards,
            })
          );
        } catch (error) {
          console.error("Error loading deck:", error);
          notifications.show({
            title: "Error",
            message: "Failed to load deck for editing",
            color: "red",
          });
          router.push("/decks/builder");
        } finally {
          setIsLoadingDeck(false);
        }
      }
    };

    loadDeck();
  }, [editDeckId, editingDeckId, dispatch, router]);

  // Load cards if not already loaded
  useEffect(() => {
    if (!cardPool || cardPool.length === 0) {
      dispatch(fetchAllArchenemyCards());
    }
  }, [dispatch, cardPool]);

  const [
    saveDeckModalOpened,
    { open: openSaveDeckModal, close: closeSaveDeckModal },
  ] = useDisclosure(false);

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
      if (editingDeckId) {
        // Update existing deck
        await dispatch(
          updateArchenemyDeck({
            deckId: editingDeckId,
            deckName,
            description,
            selectedCards: cards,
          })
        ).unwrap();

        notifications.show({
          title: "Deck Updated",
          message: "Your deck has been updated successfully!",
          color: "green",
        });
      } else {
        // Create new deck
        await dispatch(
          saveArchenemyDeck({
            deckName,
            description,
            selectedCards: cards,
          })
        ).unwrap();

        notifications.show({
          title: "Deck Saved",
          message: "Your deck has been saved successfully!",
          color: "green",
        });
      }

      dispatch(clearEditingDeck());
      closeSaveDeckModal();
      router.push("/decks");
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

  const handleCancel = () => {
    dispatch(clearEditingDeck());
    router.push("/decks");
  };

  if (isLoadingDeck) {
    return (
      <Stack gap="sm" m="sm" align="center">
        <Title order={1}>Loading deck...</Title>
      </Stack>
    );
  }

  return (
    <Stack gap="sm" m="sm">
      <SaveDeckModal
        open={saveDeckModalOpened}
        onClose={closeSaveDeckModal}
        onSaveDeck={handleSaveDeck}
        cards={selectedCards}
        deckIsSaving={deckIsSaving}
        initialName={editingDeckName}
        initialDescription={editingDeckDescription}
        isEditing={!!editingDeckId}
      />
      <Stack>
        <Flex align="center" justify="space-between">
          <Flex
            direction={{ base: "column", md: "row" }}
            gap="sm"
            align="center"
          >
            <Title order={1}>
              {editingDeckId ? `Edit Deck: ${editingDeckName}` : "Deck Builder"}
            </Title>
            {editingDeckId && (
              <Text size="sm" c="dimmed">
                Editing mode - modify your deck below
              </Text>
            )}
          </Flex>
          <Flex gap="sm">
            {editingDeckId && (
              <Button onClick={handleCancel} variant="subtle" color="gray">
                Cancel
              </Button>
            )}
            <Button
              onClick={() => {
                openSaveDeckModal();
              }}
              color="green"
              disabled={selectedCards.length === 0}
            >
              {editingDeckId ? "Update Deck" : "Save Deck"}
            </Button>
          </Flex>
        </Flex>
      </Stack>

      {/* Selected Cards Section */}
      {selectedCardsList.length > 0 && (
        <Stack gap="md">
          <Divider
            label={
              <Title order={2}>
                Selected Cards ({selectedCardsList.length})
              </Title>
            }
            labelPosition="left"
          />
          <Grid>
            {selectedCardsList.map((card) => (
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
                    onClick={() => dispatch(removeCard(card))}
                    cardSelected={true}
                  />
                </Box>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      )}

      {/* Unselected Cards Section */}
      <Stack gap="md">
        <Divider
          label={
            <Title order={2}>
              {selectedCardsList.length > 0 ? "Available Cards" : "All Cards"}
            </Title>
          }
          labelPosition="left"
        />
        <Grid>
          {unselectedCardsList.map((card) => (
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
                  onClick={() => dispatch(addCard(card))}
                  cardSelected={false}
                />
              </Box>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Stack>
  );
};

export default DeckBuilder;
