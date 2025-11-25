import {
  Modal,
  Stack,
  Card,
  Group,
  Text,
  Button,
  Badge,
  Image,
  ScrollArea,
  Box,
} from "@mantine/core";
import { IconCards, IconPlayerPlay } from "@tabler/icons-react";
import { CustomArchenemyDeck } from "~/types";

interface DeckSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelectDeck: (deckId: string) => void;
  decks: CustomArchenemyDeck[];
}

const DeckSelectorModal = ({
  open,
  onClose,
  onSelectDeck,
  decks,
}: DeckSelectorModalProps) => {
  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconCards size={24} />
          <Text size="xl" fw={700}>
            Choose Your Deck
          </Text>
        </Group>
      }
      size="xl"
      centered
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      styles={{
        header: {
          marginBottom: 0,
        },
      }}
    >
      <Stack gap="md">
        <Text c="dimmed" size="sm">
          Select a deck to begin your Archenemy game
        </Text>

        <ScrollArea h={500} type="auto">
          <Stack gap="md">
            {decks.map((deck) => (
              <Card
                key={deck.id}
                padding="lg"
                withBorder
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => onSelectDeck(deck.id)}
                className="card-hover"
              >
                <Group wrap="nowrap" align="flex-start">
                  {/* Deck Preview - Show first 3 cards */}
                  <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                    {deck.deck_cards.slice(0, 3).map((card, index) => (
                      <Box
                        key={card.id}
                        style={{
                          width: 80,
                          height: 112,
                          borderRadius: "var(--mantine-radius-sm)",
                          overflow: "hidden",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                          transform: `translateX(${-index * 8}px)`,
                          zIndex: 3 - index,
                        }}
                      >
                        <Image
                          src={card.normal_image}
                          alt={card.name}
                          fit="cover"
                          h={112}
                        />
                      </Box>
                    ))}
                  </Group>

                  {/* Deck Info */}
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Group justify="space-between">
                      <div>
                        <Text fw={600} size="lg">
                          {deck.name}
                        </Text>
                        {deck.description && (
                          <Text size="sm" c="dimmed" lineClamp={2}>
                            {deck.description}
                          </Text>
                        )}
                      </div>
                      <Badge size="lg" variant="light">
                        {deck.deck_cards.length} cards
                      </Badge>
                    </Group>

                    <Button
                      leftSection={<IconPlayerPlay size={16} />}
                      gradient={{ from: "violet", to: "grape", deg: 135 }}
                      variant="gradient"
                      fullWidth
                      size="md"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDeck(deck.id);
                      }}
                    >
                      Play with This Deck
                    </Button>
                  </Stack>
                </Group>
              </Card>
            ))}
          </Stack>
        </ScrollArea>

        {decks.length === 0 && (
          <Card padding="xl" withBorder>
            <Stack align="center" gap="md">
              <IconCards size={48} color="var(--mantine-color-dark-4)" />
              <Text c="dimmed" ta="center">
                No decks available. Create a deck first!
              </Text>
            </Stack>
          </Card>
        )}
      </Stack>
    </Modal>
  );
};

export default DeckSelectorModal;
