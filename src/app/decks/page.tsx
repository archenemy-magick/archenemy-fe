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
  IconPlus,
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

        {decks.length === 0 ? (
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
          <Stack gap="md">
            {decks.map((deck) => (
              <Card
                key={deck.id}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ cursor: "pointer" }}
              >
                <Flex justify="space-between" align="flex-start">
                  <Box
                    style={{ flex: 1 }}
                    onClick={() => handleViewDeck(deck.id)}
                  >
                    <Group gap="sm" mb="xs">
                      <Title order={3}>{deck.name}</Title>
                      {deck.is_public ? (
                        <Badge color="green" variant="light">
                          Public
                        </Badge>
                      ) : (
                        <Badge color="gray" variant="light">
                          Private
                        </Badge>
                      )}
                      {deck.is_archived && (
                        <Badge color="red" variant="light">
                          Archived
                        </Badge>
                      )}
                    </Group>
                    {deck.description && (
                      <Text size="sm" c="dimmed" mb="xs">
                        {deck.description}
                      </Text>
                    )}
                    <Text size="sm" c="dimmed">
                      {deck.deck_cards?.length || 0} cards
                    </Text>
                  </Box>

                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEye size={14} />}
                        onClick={() => handleViewDeck(deck.id)}
                      >
                        View
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={() => handleEditDeck(deck.id)}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => openDeleteModal(deck.id, deck.name)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Flex>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

export default DecksPage;
