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
  Anchor,
} from "@mantine/core";
import { IconCards, IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";
import { CustomArchenemyDeck } from "~/types";

interface DeckSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelectDeck: (deckId: string) => void;
  /** The signed-in user's decks. */
  decks: CustomArchenemyDeck[];
  /** Built-in decks anyone can play. */
  defaultDecks?: CustomArchenemyDeck[];
  isAuthenticated?: boolean;
}

function DeckOption({
  deck,
  onSelect,
}: {
  deck: CustomArchenemyDeck;
  onSelect: () => void;
}) {
  return (
    <Card
      padding="lg"
      withBorder
      style={{
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onClick={onSelect}
      className="card-hover"
    >
      <Group wrap="nowrap" align="flex-start">
        {/* Deck Preview - Show first 3 cards */}
        <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }} visibleFrom="xs">
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
          <Group justify="space-between" wrap="nowrap" align="flex-start">
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
            <Badge size="lg" variant="light" style={{ flexShrink: 0 }}>
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
              onSelect();
            }}
          >
            Play with This Deck
          </Button>
        </Stack>
      </Group>
    </Card>
  );
}

const DeckSelectorModal = ({
  open,
  onClose,
  onSelectDeck,
  decks,
  defaultDecks = [],
  isAuthenticated = false,
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
          <Stack gap="lg">
            {defaultDecks.length > 0 && (
              <Stack gap="sm">
                <Text fw={700} size="sm" tt="uppercase" c="dimmed">
                  Built-in decks
                </Text>
                {defaultDecks.map((deck) => (
                  <DeckOption
                    key={deck.id}
                    deck={deck}
                    onSelect={() => onSelectDeck(deck.id)}
                  />
                ))}
              </Stack>
            )}

            {isAuthenticated ? (
              <Stack gap="sm">
                <Text fw={700} size="sm" tt="uppercase" c="dimmed">
                  Your decks
                </Text>
                {decks.length > 0 ? (
                  decks.map((deck) => (
                    <DeckOption
                      key={deck.id}
                      deck={deck}
                      onSelect={() => onSelectDeck(deck.id)}
                    />
                  ))
                ) : (
                  <Card padding="lg" withBorder>
                    <Text c="dimmed" ta="center" size="sm">
                      You haven&apos;t built a deck yet.{" "}
                      <Anchor component={Link} href="/archenemy/decks/builder">
                        Build one
                      </Anchor>
                    </Text>
                  </Card>
                )}
              </Stack>
            ) : (
              <Card padding="lg" withBorder>
                <Text c="dimmed" ta="center" size="sm">
                  <Anchor component={Link} href="/signup">
                    Create a free account
                  </Anchor>{" "}
                  to build your own scheme decks.
                </Text>
              </Card>
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Modal>
  );
};

export default DeckSelectorModal;
