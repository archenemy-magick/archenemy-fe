import { Box, Button, Grid, Input, Modal, Stack, Title } from "@mantine/core";
import { CustomArchenemyCard } from "../../types";
import { useState } from "react";

const SaveDeckModal = ({
  open,
  onClose,
  onSaveDeck,
  cards,
}: {
  open: boolean;
  onClose: () => void;
  onSaveDeck: ({
    deckName,
    cards,
  }: {
    deckName: string;
    cards: CustomArchenemyCard[];
  }) => void;
  cards: CustomArchenemyCard[];
}) => {
  const [deckName, setDeckName] = useState("");

  const handleSaveDeck = () => {
    console.log("deckName", deckName);

    if (deckName) {
      console.log("Saving deck:", deckName, cards);

      // TODO: should this be awaited?
      onSaveDeck({ deckName, cards });
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
            Save Deck
          </Title>
          <Input.Wrapper required label="Deck Name" mb="md">
            <Input
              placeholder="Enter deck name"
              onChange={(e) => setDeckName(e.currentTarget.value)}
            />
          </Input.Wrapper>
          <Title order={3} mb="md">
            You&apos;re about to save a deck with the following cards:
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
          <Button mt="md" color="green" onClick={() => handleSaveDeck()}>
            Save Deck
          </Button>
        </Grid.Col>
      </Grid>
    </Modal>
  );
};

export default SaveDeckModal;
