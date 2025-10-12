"use client";

import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  ActionIcon,
  Menu,
  Modal,
  Grid,
  Image,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { AppDispatch, RootState } from "~/store";
import { fetchAllArchenemyDecks, deleteArchenemyDeck } from "~/store/thunks";
import {
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconPlayerPlay,
  IconEditCircle,
  IconPlus,
  IconDotsVertical,
  IconCards,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

const DecksPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { decks } = useSelector((state: RootState) => state.game);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAllArchenemyDecks());
    }
  }, [dispatch, isAuthenticated]);

  // TODO: why are these unused?
  const handleViewDeck = (deckId: string) => {
    router.push(`/decks/${deckId}`);
  };

  const handleEditDeck = (deckId: string) => {
    router.push(`/decks/builder?edit=${deckId}`);
  };

  const openDeleteModal = (deckId: string, deckName: string) => {
    setDeckToDelete({ id: deckId, name: deckName });
    setDeleteModalOpen(true);
  };

  const handleDeleteDeck = async () => {
    if (!deckToDelete) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteArchenemyDeck(deckToDelete.id)).unwrap();

      notifications.show({
        title: "Deck Deleted",
        message: `"${deckToDelete.name}" has been deleted successfully`,
        color: "green",
      });

      setDeleteModalOpen(false);
      setDeckToDelete(null);
    } catch (error) {
      console.error("Error deleting deck:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete deck. Please try again.",
        color: "red",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <Stack align="center" mt="xl">
          <Title>Please sign in to view your decks</Title>
          <Button onClick={() => router.push("/signin")}>Sign In</Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeckToDelete(null);
        }}
        title="Delete Deck"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete{" "}
            <strong>{deckToDelete?.name}</strong>? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeckToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteDeck} loading={isDeleting}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Stack gap="lg">
        <Flex justify="space-between" align="center">
          <Title order={1}>My Decks</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => router.push("/decks/builder")}
          >
            Create New Deck
          </Button>
        </Flex>

        {!decks || decks.length === 0 ? (
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack align="center" gap="md">
              <Text size="lg" c="dimmed">
                You haven&apos;t created any decks yet
              </Text>
              <Button onClick={() => router.push("/decks/builder")}>
                Create Your First Deck
              </Button>
            </Stack>
          </Card>
        ) : (
          <Grid>
            {decks.map((deck) => (
              <Grid.Col key={deck.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card
                  shadow="sm"
                  padding="lg"
                  withBorder
                  style={{
                    height: "100%",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => router.push(`/decks/${deck.id}`)}
                  className="card-hover"
                >
                  {/* Card Preview Strip */}
                  {deck.deck_cards && deck.deck_cards.length > 0 && (
                    <Card.Section mb="md">
                      <Group
                        gap={0}
                        wrap="nowrap"
                        style={{ overflow: "hidden", height: 120 }}
                      >
                        {deck.deck_cards.slice(0, 5).map((card, index) => (
                          <Box
                            key={card.id}
                            style={{
                              flex: 1,
                              height: 120,
                              minWidth: 0,
                            }}
                          >
                            <Image
                              src={card.normal_image}
                              alt={card.name}
                              fit="cover"
                              h={120}
                              style={{
                                filter: "brightness(0.9)",
                              }}
                            />
                          </Box>
                        ))}
                      </Group>
                    </Card.Section>
                  )}

                  <Stack justify="space-between" style={{ minHeight: 140 }}>
                    <div>
                      <Group justify="space-between" mb="xs">
                        <Text fw={600} size="lg" lineClamp={1}>
                          {deck.name}
                        </Text>
                        {deck.is_public && (
                          <Badge color="green" variant="light" size="sm">
                            PUBLIC
                          </Badge>
                        )}
                      </Group>

                      {deck.description && (
                        <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                          {deck.description}
                        </Text>
                      )}

                      <Group gap="xs">
                        <Badge
                          variant="light"
                          leftSection={<IconCards size={12} />}
                        >
                          {deck.deck_cards?.length || 0} cards
                        </Badge>
                        {deck.like_count !== undefined &&
                          deck.like_count > 0 && (
                            <Badge variant="light" color="pink">
                              {deck.like_count} ❤️
                            </Badge>
                          )}
                      </Group>
                    </div>

                    <Group gap="xs" mt="md">
                      <Button
                        variant="light"
                        color="green"
                        leftSection={<IconPlayerPlay size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/game/archenemy?deck=${deck.id}`);
                        }}
                        style={{ flex: 1 }}
                      >
                        Play
                      </Button>
                      <Button
                        variant="light"
                        color="violet"
                        leftSection={<IconEdit size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/decks/builder?edit=${deck.id}`);
                        }}
                        style={{ flex: 1 }}
                      >
                        Edit
                      </Button>
                      <ActionIcon
                        variant="light"
                        color="gray"
                        size="lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open menu
                        }}
                      >
                        <IconDotsVertical size={18} />
                      </ActionIcon>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
};

export default DecksPage;
