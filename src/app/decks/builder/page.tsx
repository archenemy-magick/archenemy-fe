"use client";
import {
  Box,
  Button,
  Flex,
  Grid,
  Stack,
  Title,
  Text,
  Divider,
  TextInput,
  SegmentedControl,
  Group,
  Badge,
  Select,
  Menu,
  Container,
} from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IconSearch,
  IconX,
  IconSortAscending,
  IconWand,
  IconChevronDown,
} from "@tabler/icons-react";
import CheckableCard from "../../../components/common/CheckableCard/CheckableCard";
import type { AppDispatch, RootState } from "../../../store";
import {
  addCard,
  removeCard,
  loadDeckForEditing,
  clearEditingDeck,
  addCards,
  clearSelectedCards,
} from "../../../store/reducers/deckBuilderReducer";
import {
  fetchAllArchenemyCards,
  saveArchenemyDeck,
  updateArchenemyDeck,
} from "~/store/thunks";
import { useDisclosure } from "@mantine/hooks";
import SaveDeckModal from "../../../components/SaveDeckModal";
import { CustomArchenemyCard } from "~/types";
import { notifications } from "@mantine/notifications";
import { getDeckById } from "~/lib/api/decks";
import { ScrollToTop } from "~/components/ScrollToTop";
import { CardPreviewModal } from "~/components/CardPreviewModal";

const DeckBuilder = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editDeckId = searchParams.get("edit");

  const {
    cardPool,
    selectedCards,
    editingDeckId,
    editingDeckName,
    editingDeckDescription,
  } = useSelector((state: RootState) => state.deckBuilder);

  const [deckIsSaving, setDeckIsSaving] = useState(false);
  const [isLoadingDeck, setIsLoadingDeck] = useState(false);
  const [editingDeckIsPublic, setEditingDeckIsPublic] = useState(false); // NEW

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Sort state
  const [sortOption, setSortOption] = useState<string>("name-asc");
  const [selectedCardsSortOption, setSelectedCardsSortOption] =
    useState<string>("name-asc");

  const [previewCard, setPreviewCard] = useState<CustomArchenemyCard | null>(
    null
  );
  const [previewOpened, setPreviewOpened] = useState(false);

  const handlePreviewCard = (card: CustomArchenemyCard) => {
    setPreviewCard(card);
    setPreviewOpened(true);
  };

  // Get unique card types from the card pool
  const cardTypes = useMemo(() => {
    const types = new Set<string>();
    cardPool.forEach((card) => {
      // Extract type from type_line (e.g., "Ongoing Scheme" or "Scheme")
      if (card.type_line) {
        types.add(card.type_line);
      }
    });
    return Array.from(types).sort();
  }, [cardPool]);

  // Filter cards based on search query and type filter
  const filteredCardPool = useMemo(() => {
    let filtered = cardPool;

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((card) => card.type_line === typeFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((card: CustomArchenemyCard) => {
        const nameMatch = card.name.toLowerCase().includes(query);
        const oracleTextMatch = card.oracle_text?.toLowerCase().includes(query);
        return nameMatch || oracleTextMatch;
      });
    }

    return filtered;
  }, [cardPool, searchQuery, typeFilter]);

  // Sort function
  const sortCards = (
    cards: CustomArchenemyCard[],
    sortBy: string
  ): CustomArchenemyCard[] => {
    const sorted = [...cards];

    switch (sortBy) {
      case "name-asc":
        return sorted.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
      case "name-desc":
        return sorted.sort((a, b) =>
          (b.name || "").localeCompare(a.name || "")
        );
      case "type-asc":
        return sorted.sort((a, b) => {
          const typeA = a.type_line || "";
          const typeB = b.type_line || "";
          const typeCompare = typeA.localeCompare(typeB);
          return typeCompare !== 0
            ? typeCompare
            : (a.name || "").localeCompare(b.name || "");
        });
      case "type-desc":
        return sorted.sort((a, b) => {
          const typeA = a.type_line || "";
          const typeB = b.type_line || "";
          const typeCompare = typeB.localeCompare(typeA);
          return typeCompare !== 0
            ? typeCompare
            : (a.name || "").localeCompare(b.name || "");
        });
      default:
        return sorted;
    }
  };

  // Separate selected and unselected cards from filtered results, then sort them
  const { selectedCardsList, unselectedCardsList } = useMemo(() => {
    const selectedIds = new Set(selectedCards.map((card) => card.id));

    const selected: CustomArchenemyCard[] = [];
    const unselected: CustomArchenemyCard[] = [];

    filteredCardPool.forEach((card) => {
      if (selectedIds.has(card.id)) {
        selected.push(card);
      } else {
        unselected.push(card);
      }
    });

    // Sort both lists
    const sortedSelected = sortCards(selected, selectedCardsSortOption);
    const sortedUnselected = sortCards(unselected, sortOption);

    return {
      selectedCardsList: sortedSelected,
      unselectedCardsList: sortedUnselected,
    };
  }, [filteredCardPool, selectedCards, sortOption, selectedCardsSortOption]);

  // Load deck for editing if edit param exists
  useEffect(() => {
    const loadDeck = async () => {
      if (editDeckId && editDeckId !== editingDeckId) {
        setIsLoadingDeck(true);
        try {
          const deck = await getDeckById(editDeckId);
          dispatch(
            loadDeckForEditing({
              deckId: deck.id,
              deckName: deck.name,
              deckDescription: deck.description,
              cards: deck.deck_cards,
            })
          );
          setEditingDeckIsPublic(deck.is_public || false); // NEW - load privacy setting
        } catch (error) {
          notifications.show({
            title: "Error",
            message: "Failed to load deck for editing",
            color: "red",
          });
          router.push("/decks/builder");
        } finally {
          setIsLoadingDeck(false);
        }
      }
    };

    loadDeck();
  }, [editDeckId, editingDeckId, dispatch, router]);

  // Load cards if not already loaded
  useEffect(() => {
    if (!cardPool || cardPool.length === 0) {
      dispatch(fetchAllArchenemyCards());
    }
  }, [dispatch, cardPool]);

  const [
    saveDeckModalOpened,
    { open: openSaveDeckModal, close: closeSaveDeckModal },
  ] = useDisclosure(false);

  const handleSaveDeck = async ({
    deckName,
    description,
    cards,
    isPublic, // NEW
  }: {
    deckName: string;
    description?: string;
    cards: CustomArchenemyCard[];
    isPublic: boolean; // NEW
  }) => {
    setDeckIsSaving(true);

    try {
      if (editingDeckId) {
        // Update existing deck
        await dispatch(
          updateArchenemyDeck({
            deckId: editingDeckId,
            deckName,
            description,
            selectedCards: cards,
            isPublic, // NEW
          })
        ).unwrap();

        notifications.show({
          title: "Deck Updated",
          message: `Your deck has been updated as ${
            isPublic ? "public" : "private"
          }!`,
          color: "green",
        });
      } else {
        // Create new deck
        await dispatch(
          saveArchenemyDeck({
            deckName,
            description,
            selectedCards: cards,
            isPublic, // NEW
          })
        ).unwrap();

        notifications.show({
          title: "Deck Saved",
          message: `Your deck has been saved as ${
            isPublic ? "public" : "private"
          }!`,
          color: "green",
        });
      }

      dispatch(clearEditingDeck());
      closeSaveDeckModal();
      router.push("/decks");
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "There was an error saving your deck. Please try again.",
        color: "red",
      });
    } finally {
      setDeckIsSaving(false);
    }
  };

  const handleCancel = () => {
    dispatch(clearEditingDeck());
    router.push("/decks");
  };

  const handleSelectAllFiltered = () => {
    dispatch(addCards(unselectedCardsList));
    notifications.show({
      message: `Added ${unselectedCardsList.length} cards`,
      color: "blue",
    });
  };

  const handleSelectAllOfType = (type: string) => {
    const cardsOfType = unselectedCardsList.filter(
      (card) => card.type_line === type
    );
    dispatch(addCards(cardsOfType));
    notifications.show({
      message: `Added ${cardsOfType.length} ${type} cards`,
      color: "blue",
    });
  };

  const handleSelectRandom = (count: number) => {
    const shuffled = [...unselectedCardsList].sort(() => Math.random() - 0.5);
    const randomCards = shuffled.slice(0, Math.min(count, shuffled.length));
    dispatch(addCards(randomCards));
    notifications.show({
      message: `Added ${randomCards.length} random cards`,
      color: "blue",
    });
  };

  const handleClearAll = () => {
    dispatch(clearSelectedCards());
    notifications.show({
      message: "Cleared all selections",
      color: "gray",
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
  };

  const sortOptions = [
    { label: "Name (A-Z)", value: "name-asc" },
    { label: "Name (Z-A)", value: "name-desc" },
    { label: "Type (A-Z)", value: "type-asc" },
    { label: "Type (Z-A)", value: "type-desc" },
  ];

  if (isLoadingDeck) {
    return (
      <Stack align="center" justify="center" h="60vh">
        <Text>Loading deck...</Text>
      </Stack>
    );
  }

  return (
    <Container size="xl" p="md">
      <CardPreviewModal
        card={previewCard}
        opened={previewOpened}
        onClose={() => setPreviewOpened(false)}
      />
      <Stack gap="xl" pb="xl">
        <SaveDeckModal
          open={saveDeckModalOpened}
          onClose={closeSaveDeckModal}
          onSaveDeck={handleSaveDeck}
          cards={selectedCards}
          deckIsSaving={deckIsSaving}
          initialName={editingDeckName}
          initialDescription={editingDeckDescription}
          initialIsPublic={editingDeckIsPublic} // NEW
          isEditing={!!editingDeckId}
        />

        {/* Header Section */}
        <Stack>
          <Flex align="center" justify="space-between">
            <Flex
              direction={{ base: "column", md: "row" }}
              gap="sm"
              align="center"
            >
              <Title order={1}>
                {editingDeckId
                  ? `Edit Deck: ${editingDeckName}`
                  : "Deck Builder"}
              </Title>
              {editingDeckId && (
                <Text size="sm" c="dimmed">
                  Editing mode - modify your deck below
                </Text>
              )}
            </Flex>
            <Flex gap="sm">
              {editingDeckId && (
                <Button onClick={handleCancel} variant="subtle" color="gray">
                  Cancel
                </Button>
              )}
              <Button
                onClick={() => {
                  openSaveDeckModal();
                }}
                color="green"
                disabled={selectedCards.length === 0}
              >
                {editingDeckId ? "Update Deck" : "Save Deck"}
              </Button>
            </Flex>
          </Flex>
        </Stack>

        {/* Search and Filter Section */}
        <Stack gap="md">
          <Group gap="md" align="flex-end" wrap="wrap">
            <TextInput
              placeholder="Search by name or text..."
              leftSection={<IconSearch size={16} />}
              rightSection={
                searchQuery && (
                  <IconX
                    size={16}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSearchQuery("")}
                  />
                )
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ flex: 1, minWidth: 200, maxWidth: 400 }}
            />

            <SegmentedControl
              value={typeFilter}
              onChange={setTypeFilter}
              data={[
                { label: "All Types", value: "all" },
                ...cardTypes.map((type) => ({
                  label: type,
                  value: type,
                })),
              ]}
            />

            <Select
              placeholder="Sort by..."
              leftSection={<IconSortAscending size={16} />}
              value={sortOption}
              onChange={(value) => setSortOption(value || "name-asc")}
              data={sortOptions}
              style={{ minWidth: 160 }}
            />

            <Menu shadow="md" width={220}>
              <Menu.Target>
                <Button
                  leftSection={<IconWand size={16} />}
                  rightSection={<IconChevronDown size={14} />}
                  variant="light"
                >
                  Bulk Actions
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Select Cards</Menu.Label>
                <Menu.Item onClick={handleSelectAllFiltered}>
                  Add All Filtered ({unselectedCardsList.length})
                </Menu.Item>
                {cardTypes.map((type) => {
                  const count = filteredCardPool.filter(
                    (card) =>
                      card.type_line === type &&
                      !selectedCards.some((sc) => sc.id === card.id)
                  ).length;
                  return (
                    <Menu.Item
                      key={type}
                      onClick={() => handleSelectAllOfType(type)}
                      disabled={count === 0}
                    >
                      Add All {type} ({count})
                    </Menu.Item>
                  );
                })}

                <Menu.Divider />

                <Menu.Label>Random Selection</Menu.Label>
                <Menu.Item
                  onClick={() => handleSelectRandom(10)}
                  disabled={unselectedCardsList.length === 0}
                >
                  Add 10 Random Cards
                </Menu.Item>
                <Menu.Item
                  onClick={() => handleSelectRandom(20)}
                  disabled={unselectedCardsList.length === 0}
                >
                  Add 20 Random Cards
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  color="red"
                  onClick={handleClearAll}
                  disabled={selectedCards.length === 0}
                >
                  Clear All Selections
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            {(searchQuery || typeFilter !== "all") && (
              <Button
                variant="subtle"
                color="gray"
                onClick={clearFilters}
                leftSection={<IconX size={16} />}
              >
                Clear Filters
              </Button>
            )}
          </Group>

          {/* Filter Results Summary */}
          <Group gap="xs">
            <Badge variant="light" size="lg">
              {selectedCards.length} selected
            </Badge>
            <Badge variant="light" color="gray" size="lg">
              {filteredCardPool.length} cards shown
            </Badge>
            {(searchQuery || typeFilter !== "all") && (
              <Badge variant="light" color="blue" size="lg">
                {cardPool.length} total cards
              </Badge>
            )}
          </Group>
        </Stack>

        {/* Selected Cards Section */}
        {selectedCardsList.length > 0 && (
          <Stack gap="md">
            <Divider
              label={
                <Group gap="md">
                  <Title order={2}>
                    Selected Cards ({selectedCardsList.length})
                  </Title>
                  <Select
                    placeholder="Sort by..."
                    leftSection={<IconSortAscending size={16} />}
                    value={selectedCardsSortOption}
                    onChange={(value) =>
                      setSelectedCardsSortOption(value || "name-asc")
                    }
                    data={sortOptions}
                    size="xs"
                    style={{ minWidth: 140 }}
                  />
                </Group>
              }
              labelPosition="left"
            />
            <Grid>
              {selectedCardsList.map((card) => (
                <Grid.Col
                  span={{
                    base: 12,
                    sm: 6,
                    md: 4,
                    lg: 3,
                    xl: 2,
                  }}
                  key={card.id}
                >
                  <Box>
                    <CheckableCard
                      card={card}
                      onClick={() => dispatch(removeCard(card))}
                      cardSelected={true}
                      onPreview={() => handlePreviewCard(card)}
                    />
                  </Box>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        )}

        {/* Unselected Cards Section */}
        <Stack gap="md">
          <Divider
            label={
              <Title order={2}>
                {selectedCardsList.length > 0 ? "Available Cards" : "All Cards"}
                {unselectedCardsList.length === 0 &&
                  filteredCardPool.length === 0 && (
                    <Text size="sm" c="dimmed" ml="md" component="span">
                      No cards match your filters
                    </Text>
                  )}
              </Title>
            }
            labelPosition="left"
          />
          {unselectedCardsList.length === 0 && filteredCardPool.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              Try adjusting your search or filters
            </Text>
          ) : (
            <Grid>
              {unselectedCardsList.map((card) => (
                <Grid.Col
                  span={{
                    base: 12,
                    sm: 6,
                    md: 4,
                    lg: 3,
                    xl: 2,
                  }}
                  key={card.id}
                >
                  <Box>
                    <CheckableCard
                      card={card}
                      onClick={() => dispatch(addCard(card))}
                      cardSelected={false}
                      onPreview={() => handlePreviewCard(card)}
                    />
                  </Box>
                </Grid.Col>
              ))}
            </Grid>
          )}
        </Stack>
        <ScrollToTop />
      </Stack>
    </Container>
  );
};

export default DeckBuilder;
