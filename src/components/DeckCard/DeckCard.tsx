import {
  Card,
  Group,
  Text,
  Badge,
  ActionIcon,
  Stack,
  Image,
  Grid,
  Box,
  Menu,
} from "@mantine/core";
import {
  IconWorld,
  IconLock,
  IconEdit,
  IconTrash,
  IconCopy,
  IconDots,
  IconEye,
} from "@tabler/icons-react";
import { CustomArchenemyDeck } from "~/types";
import { useState } from "react";
import { updateDeck } from "~/lib/api/decks";
import { notifications } from "@mantine/notifications";

interface DeckCardProps {
  deck: CustomArchenemyDeck;
  onEdit?: (deckId: string) => void;
  onDelete?: (deckId: string) => void;
  onClone?: (deckId: string) => void;
  onView?: (deckId: string) => void;
  onPrivacyChange?: () => void; // Callback to refresh deck list
  showActions?: boolean;
}

export default function DeckCard({
  deck,
  onEdit,
  onDelete,
  onClone,
  onView,
  onPrivacyChange,
  showActions = true,
}: DeckCardProps) {
  const [isTogglingPrivacy, setIsTogglingPrivacy] = useState(false);

  const handleTogglePrivacy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    setIsTogglingPrivacy(true);
    try {
      await updateDeck(deck.id, { is_public: !deck.is_public });

      notifications.show({
        message: `Deck is now ${!deck.is_public ? "public" : "private"}`,
        color: "green",
      });

      // Refresh the deck list
      if (onPrivacyChange) {
        onPrivacyChange();
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update deck privacy",
        color: "red",
      });
    } finally {
      setIsTogglingPrivacy(false);
    }
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ cursor: onView ? "pointer" : "default" }}
      onClick={() => onView && onView(deck.id)}
    >
      <Stack gap="md">
        {/* Header with Privacy Badge and Actions */}
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs" style={{ flex: 1 }}>
            <Text fw={600} size="lg" lineClamp={1}>
              {deck.name}
            </Text>

            <Group gap="xs">
              {/* Simple Privacy Badge */}
              <Badge
                size="sm"
                variant="dot"
                color={deck.is_public ? "violet" : "gray"}
              >
                {deck.is_public ? "Public" : "Private"}
              </Badge>

              {/* Card Count Badge */}
              <Badge size="sm" variant="light" color="blue">
                {deck.deck_cards?.length || 0} cards
              </Badge>

              {/* Like Count if available */}
              {deck.like_count && deck.like_count > 0 && (
                <Badge size="sm" variant="light" color="pink">
                  ❤️ {deck.like_count}
                </Badge>
              )}
            </Group>
          </Stack>

          {/* Action Menu */}
          {showActions && (
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDots size={18} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                {onView && (
                  <Menu.Item
                    leftSection={<IconEye size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(deck.id);
                    }}
                  >
                    View Deck
                  </Menu.Item>
                )}
                {onEdit && (
                  <Menu.Item
                    leftSection={<IconEdit size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(deck.id);
                    }}
                  >
                    Edit Deck
                  </Menu.Item>
                )}
                {onClone && (
                  <Menu.Item
                    leftSection={<IconCopy size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClone(deck.id);
                    }}
                  >
                    Clone Deck
                  </Menu.Item>
                )}

                <Menu.Divider />

                <Menu.Item
                  leftSection={
                    deck.is_public ? (
                      <IconLock size={16} />
                    ) : (
                      <IconWorld size={16} />
                    )
                  }
                  onClick={handleTogglePrivacy}
                  disabled={isTogglingPrivacy}
                >
                  Make {deck.is_public ? "Private" : "Public"}
                </Menu.Item>

                {onDelete && (
                  <>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(deck.id);
                      }}
                    >
                      Delete Deck
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>

        {/* Description */}
        {deck.description && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {deck.description}
          </Text>
        )}

        {/* Card Preview Grid */}
        {deck.deck_cards && deck.deck_cards.length > 0 && (
          <Grid gutter="xs">
            {deck.deck_cards.slice(0, 6).map((card) => (
              <Grid.Col key={card.id} span={4}>
                <Box
                  style={{
                    position: "relative",
                    borderRadius: "4px",
                    overflow: "hidden",
                    aspectRatio: "5/7",
                  }}
                >
                  <Image
                    src={card.normal_image}
                    alt={card.name}
                    fit="cover"
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Creator Info */}
        {deck.user_profile?.username && (
          <Text size="xs" c="dimmed">
            By {deck.user_profile.username}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
