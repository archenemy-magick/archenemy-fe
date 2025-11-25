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
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconSword,
  IconMapSearch,
  IconHeart,
  IconCards,
  IconTrophy,
  IconUsers,
  IconArrowRight,
  IconBolt,
  IconFlame,
  IconSparkles,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "~/store";
import NextImage from "next/image";

const HomePage = () => {
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "MagicSAK",
    description:
      "Essential utilities for Magic: The Gathering. Track Archenemy games, navigate dungeons, build decks, and dominate your games.",
    url: "https://magicsak.com",
    applicationCategory: "GameApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Multi-format Game Interface",
      "Archenemy Deck Builder",
      "Dungeon Tracker",
      "Life Counter",
      "Community Deck Sharing",
      "Popular Cards Tracking",
    ],
  };

  const gameUtilities = [
    {
      icon: IconSword,
      title: "Archenemy",
      description: "Schemes, overwhelming power, absolute villainy",
      color: "magenta",
    },
    {
      icon: IconMapSearch,
      title: "Dungeon Delver",
      description: "Navigate treacherous paths room by room",
      color: "grape",
    },
    {
      icon: IconHeart,
      title: "Life Command",
      description: "Track vitals across the battlefield",
      color: "pink",
    },
  ];

  const archenemyFeatures = [
    {
      icon: IconSword,
      title: "Game Interface",
      description: "Track schemes, life, and dominate your games",
      href: "/game/archenemy",
    },
    {
      icon: IconCards,
      title: "Deck Builder",
      description: "Create and customize your scheme deck",
      href: "/archenemy/decks/builder",
    },
    {
      icon: IconTrophy,
      title: "Popular Cards",
      description: "Most feared schemes in the community",
      href: "/archenemy/decks/popular",
    },
    {
      icon: IconUsers,
      title: "Community Decks",
      description: "Browse legendary decks from other players",
      href: "/archenemy/decks",
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
                MTG&apos;s Swiss Army Knife
                <br />
                <Text
                  component="span"
                  inherit
                  variant="gradient"
                  gradient={{ from: "yellow", to: "orange" }}
                >
                  Across Every Format
                </Text>
              </Title>

              <Text size="xl" c="gray.2" maw={700}>
                Build Archenemy decks, traverse dungeons, track life totals, and
                much more!
              </Text>

              <Group gap="md">
                <Button
                  size="xl"
                  variant="white"
                  leftSection={<IconBolt size={20} />}
                  onClick={() => router.push("/game")}
                >
                  Try It Out!
                </Button>
                {/* <Button
                  size="xl"
                  variant="light"
                  color="white"
                  onClick={() => router.push("/archenemy")}
                >
                  Explore Archenemy
                </Button> */}
              </Group>
            </Stack>
          </Container>
        </Box>

        {/* Game Utilities Section */}
        <Container size="lg" py={80}>
          <Stack gap="xl" align="center" ta="center" mb={60}>
            <Title order={2} size={rem(36)}>
              Your Command Center for MTG
            </Title>
            <Text size="lg" c="dimmed" maw={600}>
              Run multiple game utilities simultaneously. Switch between formats
              without losing your state. True power at your fingertips.
            </Text>
          </Stack>

          {/* Featured Multi-tab Card */}
          <Card
            shadow="md"
            padding="xl"
            withBorder
            mb="xl"
            style={{
              background:
                colorScheme === "dark"
                  ? "linear-gradient(135deg, rgba(192, 38, 211, 0.1) 0%, rgba(126, 34, 206, 0.1) 100%)"
                  : "linear-gradient(135deg, rgba(192, 38, 211, 0.05) 0%, rgba(126, 34, 206, 0.05) 100%)",
            }}
          >
            <Group align="center" wrap="nowrap">
              <ThemeIcon
                size={80}
                radius="md"
                variant="gradient"
                gradient={{ from: "magenta", to: "grape" }}
              >
                <IconSparkles size={40} />
              </ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Text fw={700} size="xl" mb="xs">
                  Tabbed Interface
                </Text>
                <Text c="dimmed" size="lg">
                  Track Archenemy schemes in one tab, navigate dungeons in
                  another, and monitor life totals in a third—all without losing
                  your place.
                </Text>
              </Box>
              <Button
                size="lg"
                variant="gradient"
                gradient={{ from: "magenta", to: "grape" }}
                onClick={() => router.push("/game")}
                rightSection={<IconArrowRight size={20} />}
              >
                Try It Now
              </Button>
            </Group>
          </Card>

          {/* Utility Cards */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {gameUtilities.map((utility) => {
              const Icon = utility.icon;
              return (
                <Card
                  key={utility.title}
                  shadow="sm"
                  padding="xl"
                  withBorder
                  style={{
                    transition: "all 0.2s ease",
                  }}
                  className="card-hover"
                >
                  <Stack gap="md">
                    <ThemeIcon
                      size={60}
                      radius="md"
                      variant="light"
                      color={utility.color}
                    >
                      <Icon size={30} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600} size="lg" mb="xs">
                        {utility.title}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {utility.description}
                      </Text>
                    </div>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        </Container>

        {/* Archenemy Suite Section */}
        <Box bg={colorScheme === "dark" ? "dark.8" : "gray.1"} py={80}>
          <Container size="lg">
            <Stack gap="xl">
              <Box ta="center">
                <Group justify="center" mb="md">
                  <Badge size="lg" variant="light" color="magenta">
                    Featured Format
                  </Badge>
                </Group>
                <Title order={2} size={rem(36)} mb="xs">
                  The Archenemy Suite
                </Title>
                <Text size="lg" c="dimmed" maw={700} m="auto">
                  Comprehensive tools for scheming villainy. Build legendary
                  decks, track epic games, and join a community of master
                  strategists.
                </Text>
              </Box>

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                {archenemyFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Card
                      key={feature.title}
                      shadow="sm"
                      padding="xl"
                      withBorder
                      style={{
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => router.push(feature.href)}
                      className="card-hover"
                    >
                      <Stack gap="md">
                        <ThemeIcon
                          size={60}
                          radius="md"
                          variant="light"
                          color="magenta"
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
                          color="magenta"
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
            </Stack>
          </Container>
        </Box>

        {/* Screenshot/Preview Section */}
        <Container size="lg" py={80}>
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
            </Paper>
          </Stack>
        </Container>

        {/* Coming Soon Section */}
        <Box bg={colorScheme === "dark" ? "dark.8" : "gray.1"} py={80}>
          <Container size="lg">
            <Stack gap="xl" align="center" ta="center">
              <Badge size="lg" variant="dot" color="grape">
                On The Horizon
              </Badge>
              <Title order={2} size={rem(36)}>
                More Power Awaits
              </Title>

              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" w="100%">
                {[
                  { title: "Planechase", status: "Soon", icon: IconMapSearch },
                  {
                    title: "Commander Arsenal",
                    status: "Planned",
                    icon: IconFlame,
                  },
                  {
                    title: "Token Command",
                    status: "Roadmap",
                    icon: IconSparkles,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={item.title}
                      shadow="sm"
                      padding="xl"
                      withBorder
                      style={{ opacity: 0.7 }}
                    >
                      <Stack gap="md" align="center">
                        <ThemeIcon
                          size={60}
                          radius="md"
                          variant="light"
                          color="grape"
                        >
                          <Icon size={30} />
                        </ThemeIcon>
                        <div style={{ textAlign: "center" }}>
                          <Badge
                            size="sm"
                            variant="light"
                            color="grape"
                            mb="xs"
                          >
                            {item.status}
                          </Badge>
                          <Text fw={600} size="lg">
                            {item.title}
                          </Text>
                        </div>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Container>
        </Box>

        {/* CTA Section */}
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
                Ready to Unleash Your Power?
              </Title>
              <Text size="lg" c="gray.2">
                {isAuthenticated
                  ? "Your arsenal awaits. Launch the game utilities and dominate."
                  : "Join the ranks of Magic players wielding the ultimate arsenal."}
              </Text>
              <Group gap="md">
                {isAuthenticated ? (
                  <>
                    <Button
                      size="xl"
                      variant="white"
                      onClick={() => router.push("/game")}
                    >
                      Launch Arsenal
                    </Button>
                    <Button
                      size="xl"
                      variant="outline"
                      color="white"
                      onClick={() => router.push("/archenemy/decks/builder")}
                    >
                      Build Deck
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </Group>
            </Stack>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
