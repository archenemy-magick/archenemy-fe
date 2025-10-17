// ============================================
// Improved SaveDeckModal - Show actual card images
// src/components/SaveDeckModal/index.tsx
// ============================================

import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Stack,
  Group,
  Text,
  ScrollArea,
  Grid,
  Image,
  Badge,
  Box,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { CustomArchenemyCard } from "~/types";

interface SaveDeckModalProps {
  open: boolean;
  onClose: () => void;
  onSaveDeck: (data: {
    deckName: string;
    description?: string;
    cards: CustomArchenemyCard[];
  }) => void;
  cards: CustomArchenemyCard[];
  deckIsSaving: boolean;
  initialName?: string;
  initialDescription?: string;
  isEditing?: boolean;
}

const SaveDeckModal = ({
  open,
  onClose,
  onSaveDeck,
  cards,
  deckIsSaving,
  initialName,
  initialDescription,
  isEditing,
}: SaveDeckModalProps) => {
  const [deckName, setDeckName] = useState(initialName || "");
  const [description, setDescription] = useState(initialDescription || "");

  useEffect(() => {
    if (open) {
      setDeckName(initialName || "");
      setDescription(initialDescription || "");
    }
  }, [open, initialName, initialDescription]);

  const handleSave = () => {
    if (!deckName.trim()) return;
    onSaveDeck({
      deckName: deckName.trim(),
      description: description.trim() || undefined,
      cards,
    });
  };

  // Group cards by type
  const cardsByType = cards.reduce((acc, card) => {
    const type = card.type_line || "Other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(card);
    return acc;
  }, {} as Record<string, CustomArchenemyCard[]>);

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={
        <Text size="xl" fw={700}>
          {isEditing ? "Update Deck" : "Save Deck"}
        </Text>
      }
      size="xl"
      styles={{
        title: {
          width: "100%",
        },
      }}
    >
      <Stack gap="md">
        {/* Deck Info */}
        <TextInput
          label="Deck Name"
          placeholder="Enter deck name"
          value={deckName}
          onChange={(e) => setDeckName(e.currentTarget.value)}
          required
          size="md"
        />

        <Textarea
          label="Description (optional)"
          placeholder="Add a description for your deck"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={3}
          maxLength={200}
          size="md"
        />

        {/* Cards Preview */}
        <div>
          <Group justify="space-between" mb="md">
            <Text fw={600} size="lg">
              Cards in this Deck
            </Text>
            <Badge size="lg" variant="light">
              {cards.length} cards
            </Badge>
          </Group>

          <ScrollArea h={400} type="auto">
            <Stack gap="lg">
              {Object.entries(cardsByType).map(([type, typeCards]) => (
                <div key={type}>
                  <Group mb="sm">
                    <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                      {type}
                    </Text>
                    <Badge size="sm" variant="light">
                      {typeCards.length}
                    </Badge>
                  </Group>

                  <Grid gutter="xs">
                    {typeCards.map((card) => (
                      <Grid.Col key={card.id} span={{ base: 4, sm: 3, md: 2 }}>
                        <Box
                          style={{
                            position: "relative",
                            borderRadius: "var(--mantine-radius-sm)",
                            overflow: "hidden",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          <Image
                            src={card.normal_image}
                            alt={card.name}
                            style={{
                              width: "100%",
                              height: "auto",
                              display: "block",
                            }}
                          />
                        </Box>
                      </Grid.Col>
                    ))}
                  </Grid>
                </div>
              ))}
            </Stack>
          </ScrollArea>
        </div>

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            color="gray"
            onClick={onClose}
            disabled={deckIsSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={deckIsSaving}
            disabled={!deckName.trim() || cards.length === 0}
            gradient={{ from: "violet", to: "grape", deg: 135 }}
            variant="gradient"
            size="md"
          >
            {isEditing ? "Update Deck" : "Save Deck"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default SaveDeckModal;
