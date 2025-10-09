import {
  Box,
  Button,
  Grid,
  Input,
  Modal,
  Stack,
  Title,
  Textarea,
} from "@mantine/core";
import { CustomArchenemyCard } from "../../types";
import { useState, useEffect } from "react";

const SaveDeckModal = ({
  open,
  onClose,
  onSaveDeck,
  cards,
  deckIsSaving,
  initialName,
  initialDescription,
  isEditing,
}: {
  open: boolean;
  onClose: () => void;
  onSaveDeck: ({
    deckName,
    description,
    cards,
  }: {
    deckName: string;
    description?: string;
    cards: CustomArchenemyCard[];
  }) => void;
  cards: CustomArchenemyCard[];
  deckIsSaving: boolean;
  initialName?: string;
  initialDescription?: string;
  isEditing?: boolean;
}) => {
  const [deckName, setDeckName] = useState("");
  const [description, setDescription] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setDeckName("");
      setDescription("");
    }
  }, [open]);

  // Load initial values when editing
  useEffect(() => {
    if (open && initialName) {
      setDeckName(initialName);
      setDescription(initialDescription || "");
    }
  }, [open, initialName, initialDescription]);

  const handleSaveDeck = () => {
    if (deckName) {
      onSaveDeck({ deckName, description, cards });
    }
  };

  return (
    <Modal
      opened={open}
      onClose={onClose}
      fullScreen
      closeButtonProps={{ hidden: true }}
    >
      <Grid>
        <Grid.Col span={12}>
          <Title order={2} mb="md">
            {isEditing ? "Update Deck" : "Save Deck"}
          </Title>
          <Input.Wrapper required label="Deck Name" mb="md">
            <Input
              placeholder="Enter deck name"
              value={deckName}
              onChange={(e) => setDeckName(e.currentTarget.value)}
            />
          </Input.Wrapper>
          <Textarea
            label="Description (optional)"
            placeholder="Add a description for your deck"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            mb="md"
            rows={3}
          />
          <Title order={3} mb="md">
            {isEditing
              ? "Deck cards:"
              : "You're about to save a deck with the following cards:"}
          </Title>
          <Stack align="flex-start">
            {cards.map((card) => (
              <Box
                key={card.id}
                style={{
                  border: "1px solid lightgray",
                  width: "500px",
                  borderRadius: 8,
                }}
              >
                <Stack p="xs" align="flex-start" justify="center">
                  <Title key={card.id} order={4} mb="md" mr="md">
                    {card.name}
                  </Title>
                </Stack>
              </Box>
            ))}
          </Stack>
          <Button
            mt="md"
            color="green"
            onClick={() => handleSaveDeck()}
            disabled={!deckName || cards.length === 0}
            loading={deckIsSaving}
          >
            {isEditing ? "Update Deck" : "Save Deck"}
          </Button>
        </Grid.Col>
      </Grid>
    </Modal>
  );
};

export default SaveDeckModal;
