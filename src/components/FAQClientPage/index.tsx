"use client";

import {
  Container,
  Title,
  Accordion,
  Text,
  Box,
  Stack,
  Paper,
  ThemeIcon,
  Group,
  List,
  useMantineTheme,
} from "@mantine/core";
import {
  IconSparkles,
  IconRocket,
  IconMap,
  IconDice,
  IconBolt,
  IconPlus,
} from "@tabler/icons-react";

export default function FAQPage() {
  const theme = useMantineTheme();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is MagicSAK?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MagicSAK (Swiss Army Knife) is a companion app for the random tools of Magic: The Gathering. Currently, it features a complete Archenemy scheme deck builder and game interface, allowing you to create, manage, and play with custom scheme decks. We're expanding to include Planechase support, dungeon tracking, counter management, and many more tools to enhance your MTG experience.",
        },
      },
      {
        "@type": "Question",
        name: "What is Archenemy mode in Magic: The Gathering?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Archenemy is a multiplayer format where one player (the Archenemy) faces off against multiple opponents. The Archenemy uses a scheme deck in addition to their regular deck, giving them powerful advantages to balance the game. Each turn, the Archenemy sets a scheme in motion, triggering effects that can swing the game in their favor.",
        },
      },
      {
        "@type": "Question",
        name: "How do scheme decks work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A scheme deck consists of at least 20 oversized scheme cards. At the start of each of the Archenemy's turns, they set the top card of their scheme deck in motion, activating its effect. Some schemes are ongoing and remain active, while others have one-time effects.",
        },
      },
      {
        "@type": "Question",
        name: "How do I create an account?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Click the Sign Up button, enter your email and password (at least 8 characters), complete the CAPTCHA verification, check your email for a confirmation link, and click it to activate your account.",
        },
      },
      {
        "@type": "Question",
        name: "How do I build my first deck?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Navigate to the Deck Builder, browse scheme cards, click cards to add them (minimum 20 cards), click Save as Deck, name your deck, choose public/private visibility, and save.",
        },
      },
      {
        "@type": "Question",
        name: "Can I make my decks public?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! When you create or edit a deck, you can choose to make it public. Public decks appear in the community deck browser and can be viewed and copied by other players.",
        },
      },
      {
        "@type": "Question",
        name: "Does it work on mobile?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! MagicSAK is fully responsive and works great on mobile devices. The interface adapts to your screen size, whether you're on a phone, tablet, or desktop.",
        },
      },
      {
        "@type": "Question",
        name: "Is it a PWA (can I install it)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! MagicSAK is a Progressive Web App. You can install it on mobile using Add to Home Screen, or on desktop using the install icon in your browser's address bar. Once installed, it works like a native app with offline access.",
        },
      },
    ],
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Container size="md" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <Box>
            <Title order={1} size="h1" mb="md">
              Frequently Asked Questions
            </Title>
            <Text size="lg" c="dimmed">
              Everything you need to know about MagicSAK
            </Text>
          </Box>

          {/* What's Next Section */}
          <Paper
            shadow="md"
            p="xl"
            radius="md"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.violet[6]} 100%)`,
              color: "white",
            }}
          >
            <Group mb="md">
              <ThemeIcon size="xl" radius="md" variant="white" color="blue">
                <IconSparkles size={24} />
              </ThemeIcon>
              <Title order={2} c="white">
                What&apos;s Next for MagicSAK?
              </Title>
            </Group>

            <Text size="lg" mb="lg" c="white">
              We&apos;re constantly working to make MagicSAK the ultimate
              companion for Magic: The Gathering players. Here&apos;s
              what&apos;s coming soon:
            </Text>

            <Stack gap="md">
              <Group>
                <ThemeIcon size="lg" radius="md" variant="white" color="violet">
                  <IconMap size={20} />
                </ThemeIcon>
                <Box style={{ flex: 1 }}>
                  <Text fw={700} c="white">
                    Planechase Decks
                  </Text>
                  <Text size="sm" c="white" opacity={0.9}>
                    Build and play with planar decks, including the Phenomenon
                    mechanic
                  </Text>
                </Box>
              </Group>

              <Group>
                <ThemeIcon size="lg" radius="md" variant="white" color="violet">
                  <IconDice size={20} />
                </ThemeIcon>
                <Box style={{ flex: 1 }}>
                  <Text fw={700} c="white">
                    Dungeon Interactivity
                  </Text>
                  <Text size="sm" c="white" opacity={0.9}>
                    Track your progress through dungeons with an interactive
                    dungeon explorer and room tracker
                  </Text>
                </Box>
              </Group>

              <Group>
                <ThemeIcon size="lg" radius="md" variant="white" color="violet">
                  <IconBolt size={20} />
                </ThemeIcon>
                <Box style={{ flex: 1 }}>
                  <Text fw={700} c="white">
                    Speed Counters & Trackers
                  </Text>
                  <Text size="sm" c="white" opacity={0.9}>
                    Keep track of energy, experience, poison counters, and more
                    with intuitive digital trackers
                  </Text>
                </Box>
              </Group>

              <Group>
                <ThemeIcon size="lg" radius="md" variant="white" color="violet">
                  <IconPlus size={20} />
                </ThemeIcon>
                <Box style={{ flex: 1 }}>
                  <Text fw={700} c="white">
                    And Much More!
                  </Text>
                  <Text size="sm" c="white" opacity={0.9}>
                    Commander damage tracking, deck statistics, coin flipping
                    tools (Krark&apos;s Thumb up), and community features
                  </Text>
                </Box>
              </Group>
            </Stack>

            <Text size="sm" mt="lg" c="white" opacity={0.8} fs="italic">
              Have a feature request? Contact us and let us know what you&apos;d
              like to see!
            </Text>
          </Paper>

          {/* About the App Section */}
          <Box>
            <Title order={2} size="h2" mb="md">
              About MagicSAK
            </Title>

            <Accordion variant="separated" radius="md">
              <Accordion.Item value="what-is-magicsak">
                <Accordion.Control icon={<IconRocket size={20} />}>
                  What is MagicSAK?
                </Accordion.Control>
                <Accordion.Panel>
                  <Text>
                    MagicSAK (Swiss Army Knife) is your all-in-one companion app
                    for the random tools of Magic: The Gathering. Currently, it
                    features a complete Archenemy scheme deck builder and game
                    interface, allowing you to create, manage, and play with
                    custom scheme decks.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="what-is-archenemy">
                <Accordion.Control>
                  What is Archenemy mode in Magic: The Gathering?
                </Accordion.Control>
                <Accordion.Panel>
                  <Text mb="sm">
                    Archenemy is a multiplayer format where one player (the
                    Archenemy) faces off against multiple opponents. The
                    Archenemy uses a scheme deck in addition to their regular
                    deck, giving them powerful advantages to balance the game.
                  </Text>
                  <Text>
                    Each turn, the Archenemy sets a scheme in motion, triggering
                    effects that can swing the game in their favor. It&apos;s a
                    thrilling format that creates memorable &quot;everyone vs.
                    the big bad&quot; moments!
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="how-scheme-decks-work">
                <Accordion.Control>How do scheme decks work?</Accordion.Control>
                <Accordion.Panel>
                  <Text>
                    A scheme deck consists of at least 20 oversized scheme
                    cards. At the start of each of the Archenemy&apos;s turns,
                    they set the top card of their scheme deck in motion,
                    activating its effect. Some schemes are ongoing and remain
                    active, while others have one-time effects. The Archenemy
                    doesn&apos;t draw from their scheme deck—they simply reveal
                    and resolve each card in order.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Box>

          {/* Getting Started Section */}
          <Box>
            <Title order={2} size="h2" mb="md">
              Getting Started
            </Title>

            <Accordion variant="separated" radius="md">
              <Accordion.Item value="create-account">
                <Accordion.Control>
                  How do I create an account?
                </Accordion.Control>
                <Accordion.Panel>
                  <Text mb="sm">Creating an account is quick and easy:</Text>
                  <List type="ordered" spacing="xs">
                    <List.Item>
                      Click the &quot;Sign Up&quot; button in the navigation
                      menu
                    </List.Item>
                    <List.Item>
                      Enter your email address and choose a secure password (at
                      least 8 characters)
                    </List.Item>
                    <List.Item>Complete the CAPTCHA verification</List.Item>
                    <List.Item>
                      Check your email for a confirmation link
                    </List.Item>
                    <List.Item>
                      Click the confirmation link to activate your account
                    </List.Item>
                    <List.Item>Sign in and start building decks!</List.Item>
                  </List>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="build-first-deck">
                <Accordion.Control>
                  How do I build my first deck?
                </Accordion.Control>
                <Accordion.Panel>
                  <Text mb="sm">
                    Building your first Archenemy deck is straightforward:
                  </Text>
                  <List type="ordered" spacing="xs">
                    <List.Item>
                      Navigate to the &quot;Deck Builder&quot; from the menu
                    </List.Item>
                    <List.Item>
                      Browse through the available scheme cards
                    </List.Item>
                    <List.Item>
                      Click on cards to add them to your deck (you&apos;ll see a
                      checkmark appear)
                    </List.Item>
                    <List.Item>Build a deck with at least 20 cards</List.Item>
                    <List.Item>
                      Click &quot;Save as Deck&quot; when you&apos;re ready
                    </List.Item>
                    <List.Item>
                      Give your deck a name and choose whether to make it public
                    </List.Item>
                    <List.Item>
                      Click &quot;Save&quot; and your deck is ready to play!
                    </List.Item>
                  </List>
                  <Text mt="sm" size="sm" c="dimmed">
                    Tip: Selected cards appear first in the list, making it easy
                    to review your choices!
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="play-game">
                <Accordion.Control>How do I play a game?</Accordion.Control>
                <Accordion.Panel>
                  <Text mb="sm">Playing with your deck is simple:</Text>
                  <List type="ordered" spacing="xs">
                    <List.Item>
                      Go to &quot;My Decks&quot; and find the deck you want to
                      play
                    </List.Item>
                    <List.Item>
                      Click &quot;Play&quot; on your chosen deck
                    </List.Item>
                    <List.Item>
                      The game interface will load with your deck shuffled and
                      ready
                    </List.Item>
                    <List.Item>
                      Click &quot;Set Scheme in Motion&quot; to reveal the top
                      card
                    </List.Item>
                    <List.Item>Follow the scheme&apos;s instructions</List.Item>
                    <List.Item>
                      Use the &quot;Next&quot; button to continue through your
                      deck
                    </List.Item>
                    <List.Item>
                      Track ongoing schemes and resolve them as needed
                    </List.Item>
                  </List>
                  <Text mt="sm" size="sm" c="dimmed">
                    The interface shows you the current scheme, upcoming cards,
                    and your discard pile!
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Box>

          {/* Deck Management Section */}
          <Box>
            <Title order={2} size="h2" mb="md">
              Deck Management
            </Title>

            <Accordion variant="separated" radius="md">
              <Accordion.Item value="public-decks">
                <Accordion.Control>
                  Can I make my decks public?
                </Accordion.Control>
                <Accordion.Panel>
                  <Text mb="sm">
                    Yes! When you create or edit a deck, you can choose to make
                    it public. Public decks:
                  </Text>
                  <List spacing="xs">
                    <List.Item>Appear in the community deck browser</List.Item>
                    <List.Item>
                      Can be viewed and copied by other players
                    </List.Item>
                    <List.Item>
                      Help inspire the community with your creative builds
                    </List.Item>
                    <List.Item>Can be made private again at any time</List.Item>
                  </List>
                  <Text mt="sm" size="sm" c="dimmed">
                    Private decks remain visible only to you and won&apos;t
                    appear in any public listings.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="deck-size">
                <Accordion.Control>
                  How many cards can be in a deck?
                </Accordion.Control>
                <Accordion.Panel>
                  <Text>
                    Your scheme deck must contain at least 20 cards, following
                    the official Archenemy rules. There&apos;s no maximum limit,
                    so you can build larger decks if you want more variety and
                    unpredictability in your games. Most players find that 20-30
                    cards works well for a balanced game experience.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="edit-delete-decks">
                <Accordion.Control>
                  Can I edit or delete my decks?
                </Accordion.Control>
                <Accordion.Panel>
                  <Text mb="sm">
                    Absolutely! You have full control over your decks:
                  </Text>
                  <List spacing="xs">
                    <List.Item>
                      <strong>Edit:</strong> Click &quot;Edit&quot; on any deck
                      to modify its name, cards, or public/private status
                    </List.Item>
                    <List.Item>
                      <strong>Delete:</strong> Click the delete button on any
                      deck. You&apos;ll be asked to confirm before permanent
                      deletion
                    </List.Item>
                    <List.Item>
                      <strong>Duplicate:</strong> (Coming soon) Create a copy of
                      any deck to experiment with variations
                    </List.Item>
                  </List>
                  <Text mt="sm" size="sm" c="dimmed">
                    Note: Deleting a deck is permanent and cannot be undone!
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Box>

          {/* Technical Section */}
          <Box>
            <Title order={2} size="h2" mb="md">
              Technical Details
            </Title>

            <Accordion variant="separated" radius="md">
              <Accordion.Item value="mobile-support">
                <Accordion.Control>Does it work on mobile?</Accordion.Control>
                <Accordion.Panel>
                  <Text>
                    Yes! MagicSAK is fully responsive and works great on mobile
                    devices. The interface adapts to your screen size, whether
                    you&apos;re on a phone, tablet, or desktop. You can build
                    and play with your decks on any device with a modern web
                    browser.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="pwa">
                <Accordion.Control>
                  Is it a PWA (can I install it)?
                </Accordion.Control>
                <Accordion.Panel>
                  <Text mb="sm">
                    Yes! MagicSAK is a Progressive Web App (PWA), which means
                    you can install it on your device:
                  </Text>
                  <List spacing="xs">
                    <List.Item>
                      <strong>On Mobile:</strong> Use your browser&apos;s
                      &quot;Add to Home Screen&quot; option
                    </List.Item>
                    <List.Item>
                      <strong>On Desktop:</strong> Look for the install icon in
                      your browser&apos;s address bar
                    </List.Item>
                    <List.Item>
                      <strong>Benefits:</strong> Faster loading, offline access
                      to saved decks, and app-like experience
                    </List.Item>
                  </List>
                  <Text mt="sm" size="sm" c="dimmed">
                    Once installed, MagicSAK works just like a native app!
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="browser-support">
                <Accordion.Control>
                  Which browsers are supported?
                </Accordion.Control>
                <Accordion.Panel>
                  <Text mb="sm">MagicSAK works on all modern browsers:</Text>
                  <List spacing="xs">
                    <List.Item>Chrome/Edge (recommended)</List.Item>
                    <List.Item>Firefox</List.Item>
                    <List.Item>Safari</List.Item>
                    <List.Item>Opera</List.Item>
                  </List>
                  <Text mt="sm">
                    For the best experience, we recommend keeping your browser
                    up to date. Some features may not work properly on older
                    browser versions.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Box>

          {/* Support Section */}
          <Paper p="xl" radius="md" withBorder mt="xl">
            <Title order={3} size="h3" mb="md">
              Still have questions?
            </Title>
            <Text mb="md">
              We&apos;re here to help! If you couldn&apos;t find the answer you
              were looking for, please reach out to us.
            </Text>
            <Text size="sm" c="dimmed">
              Contact us through our support page or email us directly. We
              typically respond within 24-48 hours.
            </Text>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
