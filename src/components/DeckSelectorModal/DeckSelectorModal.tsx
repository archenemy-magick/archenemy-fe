import { Center, Grid, Modal } from "@mantine/core";
import DeckCard from "../DeckCard/DeckCard";
import { useEffect } from "react";
import fetchAllArchenemyDecks from "~/store/thunks/fetchAllDecks";
import { AppDispatch } from "~/store";
import { useDispatch } from "react-redux";
import { CustomArchenemyDeck } from "~/types";

const DeckSelectorModal = ({
  open,
  onClose,
  onSelectDeck,
  decks,
}: {
  open: boolean;
  onClose: () => void;
  onSelectDeck?: (deckId: string) => void;
  decks: CustomArchenemyDeck[];
}) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchAllArchenemyDecks());
  }, [dispatch]);

  return (
    <Modal
      opened={open}
      onClose={onClose}
      fullScreen
      closeButtonProps={{ hidden: true }}
    >
      <Grid>
        <Grid.Col span={12}>
          {decks.map((deck, index) => (
            <DeckCard
              key={index}
              deck={deck}
              selectDeck={() => onSelectDeck?.(deck.id)}
            />
          ))}
        </Grid.Col>
      </Grid>
    </Modal>
  );
};

export default DeckSelectorModal;
