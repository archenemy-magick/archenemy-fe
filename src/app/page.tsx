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
  ThemeIcon,
  Paper,
  Progress,
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
  IconCoin,
  IconClipboardList,
  IconChartBar,
  IconPlayerPlay,
  IconSwords,
} from "@tabler/icons-react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "~/store";
import { ColorPips } from "~/components/ColorIdentityPicker";
import { gameUtilityHref } from "~/lib/gameLinks";
import type { MtgColor } from "~/types/recordedGame";

const HERO_GRADIENT =
  "linear-gradient(135deg, var(--mantine-color-magenta-9), var(--mantine-color-grape-9))";

const SECTION_TITLE_SIZE = "clamp(1.75rem, 4vw, 2.25rem)";

// Illustrative numbers for the stats preview card. Shown with an "Example"
// badge so nobody mistakes them for their own stats.
const EXAMPLE_STATS = {
  winRate: 0.42,
  games: 38,
  streak: "W3",
  decks: [
    { name: "Yuriko, the Tiger's Shadow", colors: ["U", "B"], winRate: 0.56 },
    {
      name: "Atraxa, Praetors' Voice",
      colors: ["W", "U", "B", "G"],
      winRate: 0.4,
    },
    { name: "Krenko, Mob Boss", colors: ["R"], winRate: 0.31 },
  ] as { name: string; colors: MtgColor[]; winRate: number }[],
};

const HomePage = () => {
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const altSectionBg = colorScheme === "dark" ? "dark.8" : "gray.1";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "MagicSAK",
    description:
      "Game utilities and stats for Magic: The Gathering. Track life totals, run Archenemy and dungeons, record your games, and see your win rate, best decks, and most-played colors.",
    url: "https://magicsak.com",
    applicationCategory: "GameApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Life Tracker",
      "Commander game recording and statistics",
      "Win rate, deck, and color identity stats",
      "Head-to-head records and friends",
      "Archenemy game interface and deck builder",
      "Dungeon Tracker",
      "Coin Flipper",
    ],
  };

  const steps = [
    {
      icon: IconPlayerPlay,
      title: "Play",
      description:
        "Open the Life Tracker, Archenemy, Dungeons, or the Coin Flipper. Run several at once in tabs without losing your place.",
    },
    {
      icon: IconClipboardList,
      title: "Record",
      description:
        "With a free account, record each game in a few taps: commanders, colors, the turn it ended, and who won. Friends at the table get it in their stats too.",
    },
    {
      icon: IconChartBar,
      title: "See your stats",
      description:
        "Win rate, streaks, your winningest decks, most-played colors, and who you beat (or lose to) the most.",
    },
  ];

  const gameUtilities = [
    {
      icon: IconHeart,
      title: "Life Tracker",
      description: "Life totals for the whole pod, then record the game",
      color: "pink",
      href: gameUtilityHref("life-tracker"),
    },
    {
      icon: IconSword,
      title: "Archenemy",
      description:
        "Play built-in scheme decks or your own, and track ongoing schemes",
      color: "magenta",
      href: gameUtilityHref("archenemy"),
    },
    {
      icon: IconMapSearch,
      title: "Dungeons",
      description: "Venture into dungeons and track progress room by room",
      color: "grape",
      href: gameUtilityHref("dungeons"),
    },
    {
      icon: IconCoin,
      title: "Coin Flipper",
      description: "Flip one coin or a handful for every Krark's Thumb moment",
      color: "yellow",
      href: gameUtilityHref("coin-flipper"),
    },
  ];

  const statsFeatures = [
    {
      icon: IconTrophy,
      title: "Winningest decks",
      description:
        "Every commander you've played, sortable by wins and win rate.",
    },
    {
      icon: IconChartBar,
      title: "Colors and trends",
      description:
        "Your most-played colors, how games end, and how you do by pod size.",
    },
    {
      icon: IconSwords,
      title: "Head-to-head",
      description: "See who you play most, and who's winning that rivalry.",
    },
    {
      icon: IconUsers,
      title: "Friends",
      description:
        "Link friends to a game once and it counts for everyone. Check out each other's stats.",
    },
  ];

  const archenemyFeatures = [
    {
      icon: IconCards,
      title: "Archenemy Deck Builder",
      description: "Build and customize scheme decks",
      href: "/archenemy/decks/builder",
    },
    {
      icon: IconTrophy,
      title: "Popular Archenemy Schemes",
      description: "The most-played schemes in the community",
      href: "/archenemy/popular-cards",
    },
    {
      icon: IconUsers,
      title: "Community Decks",
      description: "Browse and play decks from other players",
      href: "/archenemy/decks/public",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Box>
        {/* Hero */}
        <Box
          style={{
            background: HERO_GRADIENT,
            paddingTop: rem(80),
            paddingBottom: rem(80),
          }}
        >
          <Container size="lg">
            <Stack gap="xl" align="center" ta="center">
              <Title
                order={1}
                fw={900}
                c="white"
                style={{
                  lineHeight: 1.15,
                  fontSize: "clamp(2.25rem, 6vw, 3.25rem)",
                }}
              >
                Play your games.
                <br />
                <Text
                  component="span"
                  inherit
                  variant="gradient"
                  gradient={{ from: "yellow", to: "orange" }}
                >
                  Know your stats.
                </Text>
              </Title>

              <Text size="xl" c="gray.2" maw={680}>
                Free game utilities for every Magic table, no account needed.
                Sign up to keep a record of every game: your win rate, best
                decks, favorite colors, and rivalries with friends.
              </Text>

              <Group gap="md" justify="center">
                {isAuthenticated ? (
                  <>
                    <Button
                      size="lg"
                      variant="white"
                      leftSection={<IconBolt size={20} />}
                      onClick={() => router.push(gameUtilityHref())}
                    >
                      Open Game Utilities
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      color="white"
                      leftSection={<IconChartBar size={20} />}
                      onClick={() => router.push("/stats")}
                    >
                      View my stats
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      variant="white"
                      leftSection={<IconBolt size={20} />}
                      onClick={() => router.push(gameUtilityHref())}
                    >
                      Open Game Utilities
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      color="white"
                      leftSection={<IconChartBar size={20} />}
                      onClick={() => router.push("/signup")}
                    >
                      Sign up to track stats
                    </Button>
                  </>
                )}
              </Group>
            </Stack>
          </Container>
        </Box>

        {/* How it works */}
        <Container size="lg" py={80}>
          <Stack gap="xl" align="center" ta="center" mb={48}>
            <Title order={2} style={{ fontSize: SECTION_TITLE_SIZE }}>
              From first draw to final stats
            </Title>
            <Text size="lg" c="dimmed" maw={620}>
              Everything you need at the table, and everything you want to know
              after.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} padding="xl" withBorder>
                  <Stack gap="md">
                    <Group gap="sm">
                      <ThemeIcon
                        size={48}
                        radius="md"
                        variant="gradient"
                        gradient={{ from: "magenta", to: "grape" }}
                      >
                        <Icon size={26} />
                      </ThemeIcon>
                      <Text size="sm" c="dimmed" fw={700}>
                        STEP {index + 1}
                      </Text>
                    </Group>
                    <div>
                      <Text fw={700} size="lg" mb="xs">
                        {step.title}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {step.description}
                      </Text>
                    </div>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        </Container>

        {/* Game utilities */}
        <Box bg={altSectionBg} py={80}>
          <Container size="lg">
            <Stack gap="xl">
              <Box ta="center">
                <Badge size="lg" variant="light" color="magenta" mb="md">
                  Game Utilities
                </Badge>
                <Title
                  order={2}
                  style={{ fontSize: SECTION_TITLE_SIZE }}
                  mb="xs"
                >
                  Your command center at the table
                </Title>
                <Text size="lg" c="dimmed" maw={640} m="auto">
                  No account needed. Open as many utilities as you need, each in
                  its own tab, and switch between them mid-game without losing
                  anything.
                </Text>
              </Box>

              <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="lg">
                {gameUtilities.map((utility) => {
                  const Icon = utility.icon;
                  return (
                    <Card
                      key={utility.title}
                      component="a"
                      href={utility.href}
                      onClick={(event) => {
                        event.preventDefault();
                        router.push(utility.href);
                      }}
                      padding="xl"
                      withBorder
                      className="card-hover"
                    >
                      <Stack gap="md">
                        <ThemeIcon
                          size={56}
                          radius="md"
                          variant="light"
                          color={utility.color}
                        >
                          <Icon size={28} />
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
            </Stack>
          </Container>
        </Box>

        {/* Stats */}
        <Container size="lg" py={80}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={48}>
            <Stack gap="lg" justify="center">
              <div>
                <Badge size="lg" variant="light" color="grape" mb="md">
                  Stats &amp; Friends
                </Badge>
                <Title
                  order={2}
                  style={{ fontSize: SECTION_TITLE_SIZE }}
                  mb="xs"
                >
                  Find out what&apos;s really winning
                </Title>
                <Text size="lg" c="dimmed">
                  Every game you record builds a picture of how you play. Filter
                  by format, date, pod size, or color, and dig into any deck.
                </Text>
              </div>
              <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="lg">
                {statsFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Group
                      key={feature.title}
                      gap="sm"
                      align="flex-start"
                      wrap="nowrap"
                    >
                      <ThemeIcon
                        size={36}
                        radius="md"
                        variant="light"
                        color="grape"
                      >
                        <Icon size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={600}>{feature.title}</Text>
                        <Text size="sm" c="dimmed">
                          {feature.description}
                        </Text>
                      </div>
                    </Group>
                  );
                })}
              </SimpleGrid>
              <Group>
                <Button
                  variant="gradient"
                  gradient={{ from: "magenta", to: "grape" }}
                  rightSection={<IconArrowRight size={18} />}
                  onClick={() =>
                    router.push(isAuthenticated ? "/games/record" : "/signup")
                  }
                >
                  {isAuthenticated ? "Record a game" : "Create a free account"}
                </Button>
              </Group>
            </Stack>

            <Card
              withBorder
              padding="lg"
              shadow="md"
              aria-label="Example stats"
            >
              <Group justify="space-between" mb="md">
                <Text fw={700}>Your stats</Text>
                <Badge variant="light" color="gray">
                  Example
                </Badge>
              </Group>
              <SimpleGrid cols={3} spacing="sm" mb="lg">
                {[
                  {
                    label: "Win rate",
                    value: `${Math.round(EXAMPLE_STATS.winRate * 100)}%`,
                  },
                  { label: "Games", value: String(EXAMPLE_STATS.games) },
                  { label: "Streak", value: EXAMPLE_STATS.streak },
                ].map((tile) => (
                  <Card key={tile.label} withBorder padding="sm">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      {tile.label}
                    </Text>
                    <Text fw={800} size="xl">
                      {tile.value}
                    </Text>
                  </Card>
                ))}
              </SimpleGrid>
              <Text size="sm" fw={600} mb="xs">
                Winningest decks
              </Text>
              <Stack gap="sm">
                {EXAMPLE_STATS.decks.map((deck) => (
                  <div key={deck.name}>
                    <Group justify="space-between" wrap="nowrap" mb={4}>
                      <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                        <ColorPips colors={deck.colors} size={16} />
                        <Text size="sm" truncate>
                          {deck.name}
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        {Math.round(deck.winRate * 100)}%
                      </Text>
                    </Group>
                    <Progress
                      value={deck.winRate * 100}
                      size="sm"
                      color="grape"
                      aria-label={`${deck.name} win rate`}
                    />
                  </div>
                ))}
              </Stack>
            </Card>
          </SimpleGrid>
        </Container>

        {/* Archenemy */}
        <Box bg={altSectionBg} py={80}>
          <Container size="lg">
            <Stack gap="xl">
              <Box ta="center">
                <Badge size="lg" variant="light" color="magenta" mb="md">
                  Also on MagicSAK
                </Badge>
                <Title
                  order={2}
                  style={{ fontSize: SECTION_TITLE_SIZE }}
                  mb="xs"
                >
                  The Archenemy Suite
                </Title>
                <Text size="lg" c="dimmed" maw={640} m="auto">
                  Build scheme decks, see what the community is playing, and
                  take one into the Archenemy utility.
                </Text>
              </Box>

              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                {archenemyFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Card
                      key={feature.title}
                      component="a"
                      href={feature.href}
                      onClick={(event) => {
                        event.preventDefault();
                        router.push(feature.href);
                      }}
                      padding="lg"
                      withBorder
                      className="card-hover"
                    >
                      <Group gap="md" wrap="nowrap">
                        <ThemeIcon
                          size={48}
                          radius="md"
                          variant="light"
                          color="magenta"
                        >
                          <Icon size={24} />
                        </ThemeIcon>
                        <div style={{ flex: 1 }}>
                          <Text fw={600}>{feature.title}</Text>
                          <Text size="sm" c="dimmed">
                            {feature.description}
                          </Text>
                        </div>
                        <IconArrowRight size={18} />
                      </Group>
                    </Card>
                  );
                })}
              </SimpleGrid>

              {/* TODO: swap for a stats page screenshot. */}
              <Paper
                shadow="xl"
                p="md"
                radius="lg"
                bg={colorScheme === "dark" ? "dark.6" : "gray.0"}
                mx="auto"
                style={{ width: "100%", maxWidth: 900 }}
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
                    alt="Archenemy Deck Builder screenshot"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </Box>
              </Paper>
            </Stack>
          </Container>
        </Box>

        {/* Coming Soon */}
        <Container size="lg" py={80}>
          <Stack gap="xl" align="center" ta="center">
            <Badge size="lg" variant="dot" color="grape">
              On The Horizon
            </Badge>
            <Title order={2} style={{ fontSize: SECTION_TITLE_SIZE }}>
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
                        <Badge size="sm" variant="light" color="grape" mb="xs">
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

        {/* CTA */}
        <Box
          style={{
            background: HERO_GRADIENT,
            paddingTop: rem(60),
            paddingBottom: rem(60),
          }}
        >
          <Container size="sm">
            <Stack gap="xl" align="center" ta="center">
              <Title
                order={2}
                c="white"
                style={{ fontSize: SECTION_TITLE_SIZE }}
              >
                {isAuthenticated
                  ? "Your next game is waiting"
                  : "Pull up a seat"}
              </Title>
              <Text size="lg" c="gray.2">
                {isAuthenticated
                  ? "Open the utilities, play, and record it when you're done."
                  : "Use the utilities right now, no account needed. Sign up when you want to track your games and see who's really the best at the table."}
              </Text>
              <Group gap="md" justify="center">
                {isAuthenticated ? (
                  <>
                    <Button
                      size="lg"
                      variant="white"
                      onClick={() => router.push(gameUtilityHref())}
                    >
                      Open Game Utilities
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      color="white"
                      onClick={() => router.push("/friends")}
                    >
                      Find friends
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      variant="white"
                      onClick={() => router.push(gameUtilityHref())}
                    >
                      Open Game Utilities
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      color="white"
                      onClick={() => router.push("/signup")}
                    >
                      Sign up free
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
