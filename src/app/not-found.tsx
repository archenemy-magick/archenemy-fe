"use client";

import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Paper,
  Box,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import {
  IconHome,
  IconCards,
  IconSearch,
  IconSparkles,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    // Trigger floating animation after component mounts
    setIsFloating(true);
  }, []);

  // MTG-themed 404 messages
  const messages = [
    "This page has been exiled",
    "Counter target page",
    "Page not found in library",
    "This spell has been countered",
    "No valid targets",
  ];

  const flavorTexts = [
    '"Try, if you must."',
    '"Shame we\'ll never see what all the fuss was about."',
    '"What you are attempting is not against the law. It is, however, extremely foolish."',
    "\"The Knowledge Pool has all the answers--especially 'No.'\"",
    '"It\'s good to learn from your failures, but I prefer to learn from the failures of others." - Jace Beleren',
    '"Masters of the Arcane savor a delicious irony. Their study of deep and complex arcana leads to such a simple end: the ability to say merely yes or no."',
    '"I think not." - Flekon the Mindcensor',
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <Container
      size="md"
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack align="center" gap="xl">
        {/* Animated 404 with MTG theme */}
        <Box style={{ position: "relative", textAlign: "center" }}>
          {/* Floating card effect */}
          <Box
            style={{
              position: "relative",
              display: "inline-block",
              animation: isFloating ? "float 3s ease-in-out infinite" : "none",
            }}
          >
            <Title
              order={1}
              style={{
                fontSize: "120px",
                fontWeight: 900,
                background:
                  "linear-gradient(45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #667eea 75%, #764ba2 100%)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradient 3s ease infinite",
                textShadow: "0 0 30px rgba(102, 126, 234, 0.3)",
              }}
            >
              404
            </Title>

            {/* Sparkle effects */}
            <IconSparkles
              size={24}
              style={{
                position: "absolute",
                top: "10%",
                right: "-10%",
                animation: "sparkle 2s ease-in-out infinite",
                opacity: 0,
              }}
            />
            <IconSparkles
              size={20}
              style={{
                position: "absolute",
                bottom: "20%",
                left: "-5%",
                animation: "sparkle 2s ease-in-out infinite 0.5s",
                opacity: 0,
              }}
            />
            <IconSparkles
              size={18}
              style={{
                position: "absolute",
                top: "50%",
                right: "5%",
                animation: "sparkle 2s ease-in-out infinite 1s",
                opacity: 0,
              }}
            />
          </Box>
        </Box>

        {/* MTG-themed message */}
        <Stack align="center" gap="md">
          <Title order={2} ta="center" style={{ fontSize: "32px" }}>
            {randomMessage}
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={500}>
            The page you&apos;re looking for doesn&apos;t exist in this plane.
            It may have been removed, exiled to another dimension, or the spell
            fizzled.
          </Text>
        </Stack>

        {/* Navigation buttons */}
        <Group gap="md" mt="md">
          <Button
            size="lg"
            leftSection={<IconHome size={20} />}
            onClick={() => router.push("/")}
            variant="gradient"
            gradient={{ from: "violet", to: "pink", deg: 45 }}
          >
            Return Home
          </Button>

          <Button
            size="lg"
            leftSection={<IconCards size={20} />}
            onClick={() => router.push("/decks/public")}
            variant="light"
            color="violet"
          >
            Browse Decks
          </Button>

          <Button
            size="lg"
            leftSection={<IconSearch size={20} />}
            onClick={() => router.push("/decks/builder")}
            variant="light"
            color="pink"
          >
            Deck Builder
          </Button>
        </Group>

        {/* Fun MTG reference */}
        <Text size="xs" c="dimmed" ta="center" mt="xl">
          {flavorTexts[Math.floor(Math.random() * flavorTexts.length)]}
        </Text>
      </Stack>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }
      `}</style>
    </Container>
  );
}
