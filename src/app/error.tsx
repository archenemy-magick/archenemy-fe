"use client";

import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Box,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import {
  IconHome,
  IconRefresh,
  IconAlertTriangle,
  IconFlame,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function Error500() {
  const router = useRouter();
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    // Trigger shake animation after component mounts
    setIsShaking(true);
  }, []);

  // MTG-themed 500 messages
  const messages = [
    "Critical mass achieved",
    "Catastrophic malfunction",
    "The plane is collapsing",
    "Reality is fracturing",
    "A planar chaos has occurred",
  ];

  const flavorTexts = [
    '"When the spell went awry, Jace realized too late that some knowledge is better left buried."',
    '"The ritual backfired spectacularly. The mages didn\'t even have time to scream."',
    '"Mistakes in the arcane are rarely second chances." - Teferi',
    '"The explosion was visible from three planes away."',
    "\"Sometimes the greatest danger isn't the spell that fails—it's the one that succeeds.\"",
    '"I\'ve made a terrible mistake." - Last words of Apprentice Kael',
    '"When magic goes wrong, it goes *very* wrong."',
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  const randomFlavorText =
    flavorTexts[Math.floor(Math.random() * flavorTexts.length)];

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
        {/* Animated 500 with MTG theme */}
        <Box style={{ position: "relative", textAlign: "center" }}>
          {/* Shaking/glitching effect */}
          <Box
            style={{
              position: "relative",
              display: "inline-block",
              animation: isShaking
                ? "shake 0.5s ease-in-out infinite, glitch 3s ease-in-out infinite"
                : "none",
            }}
          >
            <Title
              order={1}
              style={{
                fontSize: "120px",
                fontWeight: 900,
                background:
                  "linear-gradient(45deg, #dc2626 0%, #ea580c 25%, #f59e0b 50%, #dc2626 75%, #ea580c 100%)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation:
                  "gradient 3s ease infinite, pulse 2s ease-in-out infinite",
                textShadow: "0 0 40px rgba(220, 38, 38, 0.4)",
              }}
            >
              500
            </Title>

            {/* Flame/explosion effects */}
            <IconFlame
              size={28}
              style={{
                position: "absolute",
                top: "5%",
                right: "-12%",
                animation: "flame 1.5s ease-in-out infinite",
                color: "#dc2626",
                opacity: 0.8,
              }}
            />
            <IconFlame
              size={24}
              style={{
                position: "absolute",
                bottom: "15%",
                left: "-8%",
                animation: "flame 1.5s ease-in-out infinite 0.3s",
                color: "#ea580c",
                opacity: 0.8,
              }}
            />
            <IconFlame
              size={20}
              style={{
                position: "absolute",
                top: "45%",
                right: "2%",
                animation: "flame 1.5s ease-in-out infinite 0.6s",
                color: "#f59e0b",
                opacity: 0.8,
              }}
            />
            <IconAlertTriangle
              size={32}
              style={{
                position: "absolute",
                top: "50%",
                left: "-15%",
                animation: "warning 2s ease-in-out infinite",
                color: "#fbbf24",
                opacity: 0.6,
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
            Something went catastrophically wrong on our end. The servers have
            been struck by a lightning bolt, and our wizards are working to
            restore order to the chaos.
          </Text>
        </Stack>

        {/* Action box with red glow */}
        <Box
          style={(theme) => ({
            padding: theme.spacing.lg,
            borderRadius: theme.radius.md,
            border: "2px solid",
            borderColor: "rgba(220, 38, 38, 0.3)",
            boxShadow: "0 0 30px rgba(220, 38, 38, 0.2)",
          })}
        >
          <Stack gap="xs" align="center">
            <Text fw={600} size="sm" c="red.6">
              Error Reference
            </Text>
            <Text size="xs" c="dimmed" ta="center">
              Our team has been notified and is investigating the issue.
              <br />
              Try refreshing the page or returning home.
            </Text>
          </Stack>
        </Box>

        {/* Navigation buttons */}
        <Group gap="md" mt="md">
          <Button
            size="lg"
            leftSection={<IconRefresh size={20} />}
            onClick={() => window.location.reload()}
            variant="gradient"
            gradient={{ from: "red", to: "orange", deg: 45 }}
          >
            Try Again
          </Button>

          <Button
            size="lg"
            leftSection={<IconHome size={20} />}
            onClick={() => router.push("/")}
            variant="light"
            color="red"
          >
            Return Home
          </Button>
        </Group>

        {/* Fun MTG reference */}
        <Text size="xs" c="dimmed" ta="center" mt="xl" fs="italic" maw={600}>
          {randomFlavorText}
        </Text>
      </Stack>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-2px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(2px);
          }
        }

        @keyframes glitch {
          0%,
          100% {
            text-shadow: 0 0 40px rgba(220, 38, 38, 0.4);
          }
          25% {
            text-shadow: -2px 0 40px rgba(220, 38, 38, 0.4),
              2px 0 40px rgba(234, 88, 12, 0.4);
          }
          50% {
            text-shadow: 2px 0 40px rgba(220, 38, 38, 0.4),
              -2px 0 40px rgba(234, 88, 12, 0.4);
          }
          75% {
            text-shadow: 0 -2px 40px rgba(220, 38, 38, 0.4),
              0 2px 40px rgba(234, 88, 12, 0.4);
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

        @keyframes pulse {
          0%,
          100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }

        @keyframes flame {
          0%,
          100% {
            opacity: 0.4;
            transform: translateY(0px) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-15px) scale(1.1);
          }
        }

        @keyframes warning {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </Container>
  );
}
