"use client";

import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Card,
  SimpleGrid,
  Badge,
  Box,
  Image,
  Paper,
  ThemeIcon,
  rem,
  Skeleton,
  Avatar,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconWand,
  IconCards,
  IconTrophy,
  IconWorld,
  IconPlayerPlay,
  IconUsers,
  IconArrowRight,
  IconDeviceFloppy,
  IconHeart,
  IconEye,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "~/store";
import { useEffect, useState } from "react";
import { getTopPublicDecks } from "~/lib/api/decks";
import { CustomArchenemyDeck } from "~/types";
import NextImage from "next/image";

const HomePage = () => {
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [topDecks, setTopDecks] = useState<CustomArchenemyDeck[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(true);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "MagicSAK",
    description:
      "The ultimate Archenemy Scheme deck building and gaming platform for Magic: The Gathering",
    url: "https://magicsak.com",
    applicationCategory: "GameApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Archenemy Deck Builder",
      "Game Play with Save/Resume",
      "Public Deck Sharing",
      "Popular Cards Tracking",
      "Community Features",
    ],
  };

  useEffect(() => {
    const fetchTopDecks = async () => {
      try {
        console.log("[HomePage] Fetching top decks...");
        setLoadingDecks(true);
        const decks = await getTopPublicDecks(3);
        console.log("[HomePage] Fetched decks:", decks);
        console.log("[HomePage] Number of decks:", decks.length);
        setTopDecks(decks);
      } catch (error) {
        console.error("[HomePage] Failed to fetch top decks:", error);
      } finally {
        setLoadingDecks(false);
        console.log("[HomePage] Loading complete");
      }
    };

    fetchTopDecks();
  }, []);

  const features = [
    {
      icon: IconWand,
      title: "Deck Builder",
      description:
        "Create and customize your perfect Archenemy Scheme deck with our intuitive builder",
      color: "violet",
      href: "/decks/builder",
    },
    {
      icon: IconPlayerPlay,
      title: "Play Games",
      description:
        "Start an Archenemy game with save/resume, undo, and game history tracking",
      color: "green",
      href: "/game/archenemy",
    },
    {
      icon: IconWorld,
      title: "Public Decks",
      description: "Browse, like, and clone decks shared by the community",
      color: "blue",
      href: "/decks/public",
    },
    {
      icon: IconTrophy,
      title: "Popular Cards",
      description: "See which scheme cards are most loved by the community",
      color: "orange",
      href: "/popular-cards",
    },
    {
      icon: IconDeviceFloppy,
      title: "Save & Manage",
      description: "Keep all your decks organized and accessible from anywhere",
      color: "cyan",
      href: "/decks",
    },
    {
      icon: IconUsers,
      title: "Community",
      description:
        "Share your decks, discover new strategies, and connect with other players",
      color: "pink",
      href: "/decks/public",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Box>
        {/* Hero Section */}
        <Box
          style={{
            background:
              "linear-gradient(135deg, var(--mantine-color-magenta-9), var(--mantine-color-grape-9))",
            paddingTop: rem(80),
            paddingBottom: rem(80),
          }}
        >
          <Container size="lg">
            <Stack gap="xl" align="center" ta="center">
              <Title
                order={1}
                size={rem(48)}
                fw={900}
                c="white"
                style={{ lineHeight: 1.2 }}
              >
                Build. Play. Dominate.
                <br />
                <Text
                  component="span"
                  inherit
                  variant="gradient"
                  gradient={{ from: "yellow", to: "orange" }}
                >
                  Archenemy Scheme Decks
                </Text>
              </Title>

              <Text size="xl" c="gray.2" maw={600}>
                The ultimate Archenemy Scheme deck building and gaming platform
                for Magic: The Gathering Archenemy. Create powerful scheme
                decks, use them in games with your friends (or archenemies!),
                and learn more about this unique format.
              </Text>

              <Group gap="md">
                {isAuthenticated ? (
                  <>
                    <Button
                      size="xl"
                      variant="white"
                      leftSection={<IconWand size={20} />}
                      onClick={() => router.push("/decks/builder")}
                    >
                      Start Building
                    </Button>
                    <Button
                      size="xl"
                      variant="light"
                      color="white"
                      leftSection={<IconPlayerPlay size={20} />}
                      onClick={() => router.push("/game/archenemy")}
                    >
                      Play Now
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="xl"
                      variant="white"
                      leftSection={<IconArrowRight size={20} />}
                      onClick={() => router.push("/signup")}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      size="xl"
                      variant="light"
                      color="white"
                      onClick={() => router.push("/decks/public")}
                    >
                      Browse Public Decks
                    </Button>
                  </>
                )}
              </Group>
            </Stack>
          </Container>
        </Box>

        {/* Features Section */}
        <Container size="lg" py={80}>
          <Stack gap="xl" align="center" ta="center" mb={60}>
            <Badge size="lg" color="magenta">
              Features
            </Badge>
            <Title order={2} size={rem(36)}>
              Everything You Need to Become THE Archenemy
            </Title>
            <Text size="lg" c="dimmed" maw={600}>
              From deck building to gameplay tracking, we&apos;ve built the
              complete toolkit for Archenemy enthusiasts.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  shadow="sm"
                  padding="xl"
                  withBorder
                  style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                  onClick={() => router.push(feature.href)}
                  className="card-hover"
                >
                  <Stack gap="md">
                    <ThemeIcon
                      size={60}
                      radius="md"
                      variant="light"
                      color={feature.color}
                    >
                      <Icon size={30} />
                    </ThemeIcon>

                    <div>
                      <Text fw={600} size="lg" mb="xs">
                        {feature.title}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {feature.description}
                      </Text>
                    </div>

                    <Button
                      variant="subtle"
                      color={feature.color}
                      rightSection={<IconArrowRight size={16} />}
                      fullWidth
                    >
                      Explore
                    </Button>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        </Container>

        {/* Screenshot/Preview Section */}
        <Box bg={colorScheme === "dark" ? "dark.8" : "gray.1"} py={80}>
          <Container size="lg">
            <Stack gap="xl" align="center" ta="center">
              <Badge size="lg" variant="light" color="magenta">
                See It In Action
              </Badge>
              <Title
                order={2}
                size={rem(36)}
                c={colorScheme === "dark" ? "white" : "dark"}
              >
                Beautiful. Intuitive. Powerful.
              </Title>

              <Paper
                shadow="xl"
                p="md"
                radius="lg"
                bg={colorScheme === "dark" ? "dark.6" : "gray.0"}
                style={{
                  width: "100%",
                  maxWidth: 900,
                }}
              >
                <Box
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    overflow: "hidden",
                    border:
                      colorScheme === "dark"
                        ? "1px solid var(--mantine-color-dark-4)"
                        : "1px solid var(--mantine-color-gray-3)",
                  }}
                >
                  <Box
                    style={{
                      borderRadius: "var(--mantine-radius-md)",
                      overflow: "hidden",
                      border:
                        colorScheme === "dark"
                          ? "1px solid var(--mantine-color-dark-4)"
                          : "1px solid var(--mantine-color-gray-3)",
                      position: "relative",
                      width: "100%",
                    }}
                  >
                    <NextImage
                      width={1920}
                      height={876}
                      src="/DeckBuilderSample.png"
                      alt="Deck Builder Screenshot"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Stack>
          </Container>
        </Box>

        {/* Top Decks Section */}
        <Container size="lg" py={80}>
          <Stack gap="xl">
            <Group justify="space-between" align="center">
              <div>
                <Badge size="lg" variant="light" color="magenta" mb="md">
                  Community Favorites
                </Badge>
                <Title order={2} size={rem(36)}>
                  Top Rated Archenemy Decks
                </Title>
                <Text size="lg" c="dimmed" mt="xs">
                  Discover the most popular decks from our community
                </Text>
              </div>
              <Button
                rightSection={<IconArrowRight size={16} />}
                variant="light"
                onClick={() => router.push("/decks/public")}
              >
                View All
              </Button>
            </Group>

            {loadingDecks ? (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {[1, 2, 3].map((i) => (
                  <Card key={i} shadow="sm" padding="lg" withBorder>
                    <Skeleton height={200} mb="md" />
                    <Skeleton height={20} mb="sm" />
                    <Skeleton height={15} width="70%" />
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {topDecks.map((deck) => (
                  <Card
                    key={deck.id}
                    shadow="sm"
                    padding="lg"
                    withBorder
                    style={{
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => router.push(`/decks/${deck.id}`)}
                    className="card-hover"
                  >
                    <Stack gap="md">
                      {/* Deck Preview - First 5 cards */}
                      {deck.deck_cards && deck.deck_cards.length > 0 && (
                        <Box
                          style={{
                            position: "relative",
                            height: 200,
                            borderRadius: "var(--mantine-radius-md)",
                            overflow: "hidden",
                            background:
                              colorScheme === "dark"
                                ? "linear-gradient(135deg, #1c1c22 0%, #0f0f14 100%)"
                                : "linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            style={{
                              position: "relative",
                              width: "100%",
                              height: "180px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {deck.deck_cards.slice(0, 5).map((card, index) => {
                              const totalCards = Math.min(
                                deck.deck_cards.length,
                                5
                              );
                              const offset =
                                (index - (totalCards - 1) / 2) * 35; // Horizontal spacing
                              const rotation =
                                (index - (totalCards - 1) / 2) * 4; // Rotation angle

                              return (
                                <Box
                                  key={card.id}
                                  style={{
                                    position: "absolute",
                                    transform: `translateX(${offset}px) rotate(${rotation}deg)`,
                                    zIndex: index,
                                    transition: "transform 0.3s ease",
                                  }}
                                >
                                  <Image
                                    src={
                                      card.border_crop_image ||
                                      card.normal_image
                                    }
                                    alt={card.name}
                                    height={160}
                                    width={115}
                                    fit="contain"
                                    style={{
                                      borderRadius: "var(--mantine-radius-sm)",
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                                      // border:
                                      //   colorScheme === "dark"
                                      //     ? "1px solid rgba(255, 255, 255, 0.1)"
                                      //     : "1px solid rgba(0, 0, 0, 0.1)",
                                    }}
                                  />
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      )}

                      {/* Deck Info */}
                      <div>
                        <Group justify="space-between" mb="xs">
                          <Text fw={600} size="lg" lineClamp={1}>
                            {deck.name}
                          </Text>
                          <Badge size="sm" variant="light" color="magenta">
                            {deck.deck_cards?.length || 0} cards
                          </Badge>
                        </Group>

                        {deck.description && (
                          <Text size="sm" c="dimmed" lineClamp={2} mb="sm">
                            {deck.description}
                          </Text>
                        )}

                        {/* Stats */}
                        <Group gap="md">
                          <Group gap={4}>
                            <IconHeart
                              size={16}
                              color="var(--mantine-color-red-4)"
                            />
                            <Text size="sm" fw={500}>
                              {deck.like_count || 0}
                            </Text>
                          </Group>
                          <Group gap={4}>
                            <IconEye
                              size={16}
                              color="var(--mantine-color-blue-4)"
                            />
                            <Text size="sm" fw={500}>
                              {deck.view_count || 0}
                            </Text>
                          </Group>
                        </Group>
                      </div>

                      {/* Author */}
                      {deck.user_profile && (
                        <Group gap="xs">
                          <Avatar size="sm" radius="xl" />
                          <Text size="xs" c="dimmed">
                            by {deck.user_profile.username || "Anonymous"}
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Container>

        {/* CTA Section */}
        {!isAuthenticated && (
          <Box
            style={{
              background:
                "linear-gradient(135deg, var(--mantine-color-magenta-9), var(--mantine-color-grape-9))",
              paddingTop: rem(60),
              paddingBottom: rem(60),
            }}
          >
            <Container size="sm">
              <Stack gap="xl" align="center" ta="center">
                <Title order={2} size={rem(36)} c="white">
                  Ready to Build Your Archenemy Deck?
                </Title>
                <Text size="lg" c="gray.2">
                  Join our community and start creating powerful Archenemy
                  scheme decks today.
                </Text>
                <Group gap="md">
                  <Button
                    size="xl"
                    variant="white"
                    onClick={() => router.push("/signup")}
                  >
                    Sign Up Free
                  </Button>
                  <Button
                    size="xl"
                    variant="outline"
                    color="white"
                    onClick={() => router.push("/signin")}
                  >
                    Sign In
                  </Button>
                </Group>
              </Stack>
            </Container>
          </Box>
        )}
      </Box>
    </>
  );
};

export default HomePage;
