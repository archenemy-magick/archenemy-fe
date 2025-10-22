// src/components/SaveDeckModal/index.tsx
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
  Alert,
  Tooltip,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { IconAlertCircle } from "@tabler/icons-react";
import { CustomArchenemyCard } from "~/types";
import {
  validateDeckName,
  validateDescription,
} from "~/lib/validation/contentFilter";
import { notifications } from "@mantine/notifications";

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
  const [nameError, setNameError] = useState<string | null>(null);
  const [descError, setDescError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ name: false, description: false });

  const handleDeckNameChange = (value: string) => {
    setDeckName(value);
    setTouched({ ...touched, name: true });

    // Validate in real-time
    if (value.trim().length === 0) {
      setNameError("Deck name cannot be empty");
    } else {
      const validation = validateDeckName(value);
      setNameError(validation.valid ? null : validation.error || null);
    }
  };

  const handleDeckNameBlur = () => {
    setTouched({ ...touched, name: true });

    if (deckName.trim().length === 0) {
      setNameError("Deck name cannot be empty");
    } else {
      const validation = validateDeckName(deckName);
      setNameError(validation.valid ? null : validation.error || null);
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setTouched({ ...touched, description: true });

    // Validate in real-time
    const validation = validateDescription(value);
    setDescError(validation.valid ? null : validation.error || null);
  };

  const handleDescriptionBlur = () => {
    setTouched({ ...touched, description: true });

    const validation = validateDescription(description);
    setDescError(validation.valid ? null : validation.error || null);
  };

  const handleSave = () => {
    const nameValidation = validateDeckName(deckName);
    const descValidation = validateDescription(description);

    if (!nameValidation.valid) {
      setNameError(nameValidation.error || "Invalid deck name");
      notifications.show({
        title: "Invalid Deck Name",
        message: nameValidation.error || "Please enter a valid deck name",
        color: "red",
        icon: <IconAlertCircle />,
      });
      return;
    }

    if (!descValidation.valid) {
      setDescError(descValidation.error || "Invalid description");
      notifications.show({
        title: "Invalid Description",
        message: descValidation.error || "Please enter a valid description",
        color: "red",
        icon: <IconAlertCircle />,
      });
      return;
    }

    // All valid - proceed with save
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
        {/* Show validation warnings if any */}
        {(nameError || descError) && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
          >
            Please fix the errors below before saving
          </Alert>
        )}

        {/* Deck Info */}
        <TextInput
          label="Deck Name"
          placeholder="Enter deck name"
          value={deckName}
          onChange={(e) => handleDeckNameChange(e.currentTarget.value)}
          onBlur={handleDeckNameBlur}
          error={nameError}
          required
          size="md"
        />

        <Textarea
          label="Description (optional)"
          placeholder="Add a description for your deck"
          value={description}
          onChange={(e) => handleDescriptionChange(e.currentTarget.value)}
          onBlur={handleDescriptionBlur}
          error={descError}
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
                        <Tooltip
                          label={
                            <Box
                              style={{
                                width: 300,
                                maxWidth: "90vw",
                              }}
                            >
                              <Image
                                src={card.normal_image}
                                alt={card.name}
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  display: "block",
                                  borderRadius: "8px",
                                }}
                              />
                            </Box>
                          }
                          position="right"
                          withArrow
                          transitionProps={{ duration: 200 }}
                          offset={20}
                          styles={{
                            tooltip: {
                              padding: 0,
                              backgroundColor: "transparent",
                              border: "none",
                            },
                          }}
                        >
                          <Box
                            style={{
                              position: "relative",
                              borderRadius: "var(--mantine-radius-sm)",
                              overflow: "hidden",
                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                              cursor: "pointer",
                              transition:
                                "transform 0.2s ease, box-shadow 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(233, 30, 140, 0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 2px 4px rgba(0, 0, 0, 0.1)";
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
                        </Tooltip>
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
            disabled={!!nameError || !!descError || cards.length === 0}
            gradient={{ from: "magenta", to: "grape", deg: 135 }}
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
