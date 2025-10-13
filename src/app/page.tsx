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
} from "@mantine/core";
import {
  IconWand,
  IconCards,
  IconTrophy,
  IconWorld,
  IconPlayerPlay,
  IconUsers,
  IconArrowRight,
  IconSparkles,
  IconDeviceFloppy,
  IconSearch,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "~/store";

const HomePage = () => {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

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

  // Add later once we have decks, etc.
  // const stats = [
  //   { value: "100+", label: "Scheme Cards" },
  //   { value: "~∞", label: "Deck Combinations" },
  //   { value: "Community", label: "Driven" },
  // ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        style={{
          background:
            "linear-gradient(135deg, var(--mantine-color-violet-9), var(--mantine-color-grape-9))",
          paddingTop: rem(80),
          paddingBottom: rem(80),
        }}
      >
        <Container size="lg">
          <Stack gap="xl" align="center" ta="center">
            {/* <Badge
              size="lg"
              variant="light"
              color="white"
              leftSection={<IconSparkles size={14} />}
              style={{ color: "white" }}
            >
              Magic: The Gathering Tools
            </Badge> */}

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
              for Magic: The Gathering Archenemy. Create powerful scheme decks,
              use them in games with your friends (or archenemies!), and learn
              more about this unique format.
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

            {/* Stats */}
            {/* <SimpleGrid cols={3} spacing="xl" mt="xl">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <Text size="xl" fw={900} c="white">
                    {stat.value}
                  </Text>
                  <Text size="sm" c="gray.3">
                    {stat.label}
                  </Text>
                </div>
              ))}
            </SimpleGrid> */}
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container size="lg" py={80}>
        <Stack gap="xl" align="center" ta="center" mb={60}>
          <Badge size="lg" variant="light" color="violet">
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
      <Box
        style={{
          background: "var(--mantine-color-dark-8)",
          paddingTop: rem(80),
          paddingBottom: rem(80),
        }}
      >
        <Container size="lg">
          <Stack gap="xl" align="center" ta="center">
            <Badge size="lg" variant="light" color="violet">
              See It In Action
            </Badge>
            <Title order={2} size={rem(36)} c="white">
              Beautiful. Intuitive. Powerful.
            </Title>

            <Paper
              shadow="xl"
              p="md"
              radius="lg"
              style={{
                width: "100%",
                maxWidth: 900,
                background: "var(--mantine-color-dark-6)",
              }}
            >
              <Box
                style={{
                  borderRadius: "var(--mantine-radius-md)",
                  overflow: "hidden",
                  border: "1px solid var(--mantine-color-dark-4)",
                }}
              >
                {/* Placeholder for screenshot - replace with actual image */}
                <Box
                  style={{
                    aspectRatio: "16/9",
                    background:
                      "linear-gradient(135deg, var(--mantine-color-violet-9), var(--mantine-color-dark-9))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Stack align="center" gap="md">
                    <IconCards
                      size={80}
                      color="var(--mantine-color-violet-4)"
                    />
                    <Text size="xl" c="dimmed">
                      Deck Builder Preview
                    </Text>
                    <Text size="sm" c="dimmed">
                      Add a screenshot here later
                    </Text>
                  </Stack>
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
              <Badge size="lg" variant="light" color="violet" mb="md">
                Community Favorites
              </Badge>
              <Title order={2} size={rem(36)}>
                Top Rated Public Decks
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

          <Text c="dimmed" ta="center" py="xl">
            Top decks will appear here once you have public decks with likes
          </Text>
        </Stack>
      </Container>

      {/* CTA Section */}
      {!isAuthenticated && (
        <Box
          style={{
            background:
              "linear-gradient(135deg, var(--mantine-color-violet-9), var(--mantine-color-grape-9))",
            paddingTop: rem(60),
            paddingBottom: rem(60),
          }}
        >
          <Container size="sm">
            <Stack gap="xl" align="center" ta="center">
              <Title order={2} size={rem(36)} c="white">
                Ready to Build Your Perfect Deck?
              </Title>
              <Text size="lg" c="gray.2">
                Join our community and start creating powerful Archenemy scheme
                decks today.
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
  );
};

export default HomePage;
