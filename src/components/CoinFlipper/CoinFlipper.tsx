// components/game/CoinFlipper/CoinFlipper.tsx
"use client";

import { useState } from "react";
import {
  Stack,
  Title,
  Text,
  Button,
  Card,
  Group,
  Badge,
  Switch,
  NumberInput,
  Paper,
  Box,
  ScrollArea,
  Divider,
  SimpleGrid,
} from "@mantine/core";
import {
  IconCoin,
  IconRefresh,
  IconCheck,
  IconX,
  IconInfinity,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { MultiCoinDisplay } from "./AnimatedCoin";

interface CoinFlipProps {
  tabId?: string;
}

type FlipResult = "heads" | "tails";

interface SingleFlip {
  result: FlipResult;
  krarkFlip1?: FlipResult;
  krarkFlip2?: FlipResult;
  chosen?: FlipResult;
}

interface FlipHistory {
  id: string;
  flips: SingleFlip[];
  krarkActive: boolean;
  timestamp: number;
  mode: string;
}

interface CoinDisplay {
  id: string;
  result: FlipResult | null;
  label?: string;
}

const CoinFlipper = ({ tabId = "default" }: CoinFlipProps) => {
  const [krarkThumb, setKrarkThumb] = useState(false);
  const [flipCount, setFlipCount] = useState(1);
  const [history, setHistory] = useState<FlipHistory[]>([]);
  const [lastFlip, setLastFlip] = useState<FlipHistory | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation state
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [animatingCoins, setAnimatingCoins] = useState<CoinDisplay[]>([]);
  const [isSequential, setIsSequential] = useState(false);

  // Single coin flip
  const flipCoin = (): FlipResult => {
    return Math.random() < 0.5 ? "heads" : "tails";
  };

  // Flip N times
  const handleFlipN = (n: number, mode: string = "Manual") => {
    // Show animation for 1-2 flips
    if (n <= 2) {
      setIsAnimating(true);
      setShowCoinAnimation(true);
      setIsSequential(false);

      const coins: CoinDisplay[] = [];
      const flips: SingleFlip[] = [];

      for (let i = 0; i < n; i++) {
        if (krarkThumb) {
          const flip1 = flipCoin();
          const flip2 = flipCoin();
          const chosen =
            flip1 === "heads" || flip2 === "heads" ? "heads" : "tails";

          // Show both Krark flips
          coins.push(
            { id: `${i}-1`, result: flip1, label: "Flip 1" },
            { id: `${i}-2`, result: flip2, label: "Flip 2" },
          );

          flips.push({
            result: chosen,
            krarkFlip1: flip1,
            krarkFlip2: flip2,
            chosen,
          });
        } else {
          const result = flipCoin();
          coins.push({
            id: `${i}`,
            result,
            label: n > 1 ? `Coin ${i + 1}` : undefined,
          });
          flips.push({ result });
        }
      }

      setAnimatingCoins(coins);

      // Wait for all animations to complete
      const animationTime = 1300;
      setTimeout(() => {
        const flipRecord: FlipHistory = {
          id: Date.now().toString(),
          flips,
          krarkActive: krarkThumb,
          timestamp: Date.now(),
          mode,
        };

        setLastFlip(flipRecord);
        setHistory((prev) => [flipRecord, ...prev]);
        setIsAnimating(false);
        // Keep coins visible - don't hide them
      }, animationTime);
    } else {
      // Original logic for multiple flips (no animation)
      setIsAnimating(true);
      setShowCoinAnimation(false);

      setTimeout(() => {
        const flips: SingleFlip[] = [];

        for (let i = 0; i < n; i++) {
          if (krarkThumb) {
            const flip1 = flipCoin();
            const flip2 = flipCoin();
            const chosen =
              flip1 === "heads" || flip2 === "heads" ? "heads" : "tails";

            flips.push({
              result: chosen,
              krarkFlip1: flip1,
              krarkFlip2: flip2,
              chosen,
            });
          } else {
            flips.push({ result: flipCoin() });
          }
        }

        const flipRecord: FlipHistory = {
          id: Date.now().toString(),
          flips,
          krarkActive: krarkThumb,
          timestamp: Date.now(),
          mode,
        };

        setLastFlip(flipRecord);
        setHistory((prev) => [flipRecord, ...prev]);
        setIsAnimating(false);
      }, 300);
    }
  };

  // Flip until first loss (tails) - with animation
  const handleFlipUntilLose = () => {
    setIsAnimating(true);
    setShowCoinAnimation(true);
    setIsSequential(true);

    // Calculate all flips first
    const flips: SingleFlip[] = [];
    let result: FlipResult;

    do {
      if (krarkThumb) {
        const flip1 = flipCoin();
        const flip2 = flipCoin();
        const chosen =
          flip1 === "heads" || flip2 === "heads" ? "heads" : "tails";

        result = chosen;
        flips.push({
          result: chosen,
          krarkFlip1: flip1,
          krarkFlip2: flip2,
          chosen,
        });
      } else {
        result = flipCoin();
        flips.push({ result });
      }
    } while (result === "heads" && flips.length < 100);

    // Create coin displays for animation
    const coins: CoinDisplay[] = flips.map((flip, i) => ({
      id: `${i}`,
      result: flip.result,
      label: `Flip ${i + 1}`,
    }));

    setAnimatingCoins(coins);

    // Wait for sequential animations (each takes 1.1s)
    const totalTime = coins.length * 1100 + 200;
    setTimeout(() => {
      const flipRecord: FlipHistory = {
        id: Date.now().toString(),
        flips,
        krarkActive: krarkThumb,
        timestamp: Date.now(),
        mode: "Until First Loss",
      };

      setLastFlip(flipRecord);
      setHistory((prev) => [flipRecord, ...prev]);
      setIsAnimating(false);
    }, totalTime);
  };

  // Flip until two losses - with animation
  const handleFlipUntilTwoLosses = () => {
    setIsAnimating(true);
    setShowCoinAnimation(true);
    setIsSequential(true);

    // Calculate all flips first
    const flips: SingleFlip[] = [];
    let losses = 0;

    while (losses < 2 && flips.length < 100) {
      let result: FlipResult;

      if (krarkThumb) {
        const flip1 = flipCoin();
        const flip2 = flipCoin();
        const chosen =
          flip1 === "heads" || flip2 === "heads" ? "heads" : "tails";

        result = chosen;
        flips.push({
          result: chosen,
          krarkFlip1: flip1,
          krarkFlip2: flip2,
          chosen,
        });
      } else {
        result = flipCoin();
        flips.push({ result });
      }

      if (result === "tails") {
        losses++;
      }
    }

    // Create coin displays for animation
    const coins: CoinDisplay[] = flips.map((flip, i) => ({
      id: `${i}`,
      result: flip.result,
      label: `Flip ${i + 1}`,
    }));

    setAnimatingCoins(coins);

    // Wait for sequential animations
    const totalTime = coins.length * 1100 + 200;
    setTimeout(() => {
      const flipRecord: FlipHistory = {
        id: Date.now().toString(),
        flips,
        krarkActive: krarkThumb,
        timestamp: Date.now(),
        mode: "Until Two Losses",
      };

      setLastFlip(flipRecord);
      setHistory((prev) => [flipRecord, ...prev]);
      setIsAnimating(false);
    }, totalTime);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setLastFlip(null);
  };

  const countResults = (flips: SingleFlip[]) => {
    const heads = flips.filter((f) => f.result === "heads").length;
    const tails = flips.filter((f) => f.result === "tails").length;
    return { heads, tails, total: flips.length };
  };

  const stats = lastFlip ? countResults(lastFlip.flips) : null;

  return (
    <Stack gap="md" p="md">
      {/* Header */}
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2} size="h3">
            Coin Flipper
          </Title>
          <Text size="sm" c="dimmed">
            Flip coins for MTG effects
          </Text>
        </div>

        {/* Krark's Thumb Toggle */}
        <Paper p="sm" withBorder>
          <Switch
            label="Krark's Thumb"
            description="Flip two, choose one"
            checked={krarkThumb}
            onChange={(e) => setKrarkThumb(e.currentTarget.checked)}
            color="orange"
            size="md"
          />
        </Paper>
      </Group>

      {/* Animated Coin Display */}
      {showCoinAnimation && animatingCoins.length > 0 && (
        <Card withBorder p="xl">
          <MultiCoinDisplay
            coins={animatingCoins}
            isFlipping={isAnimating}
            sequential={isSequential}
            onFlipComplete={() => {}}
          />
        </Card>
      )}

      {/* Flip Controls */}
      <Card withBorder p="md">
        <Stack gap="md">
          <Text fw={600} size="sm">
            Flip Options
          </Text>

          <SimpleGrid cols={2}>
            <Button
              leftSection={<IconCoin size={18} />}
              onClick={() => handleFlipN(1, "Single Flip")}
              disabled={isAnimating}
              variant="light"
              color="blue"
            >
              Flip Once
            </Button>

            <Button
              leftSection={<IconCoin size={18} />}
              onClick={() => handleFlipN(2, "Double Flip")}
              disabled={isAnimating}
              variant="light"
              color="cyan"
            >
              Flip Twice
            </Button>
          </SimpleGrid>

          <Group align="flex-end">
            <NumberInput
              label="Custom Flip Count"
              value={flipCount}
              onChange={(val) => typeof val === "number" && setFlipCount(val)}
              min={1}
              max={100}
              style={{ flex: 1 }}
            />
            <Button
              leftSection={<IconPlayerPlay size={18} />}
              onClick={() => handleFlipN(flipCount, `Flip ${flipCount}x`)}
              disabled={isAnimating}
              variant="light"
              color="violet"
            >
              Flip
            </Button>
          </Group>

          <Divider label="Advanced" />

          <SimpleGrid cols={2}>
            <Button
              leftSection={<IconInfinity size={18} />}
              onClick={handleFlipUntilLose}
              disabled={isAnimating}
              variant="light"
              color="orange"
            >
              Until First Loss
            </Button>

            <Button
              leftSection={<IconInfinity size={18} />}
              onClick={handleFlipUntilTwoLosses}
              disabled={isAnimating}
              variant="light"
              color="red"
            >
              Until 2 Losses
            </Button>
          </SimpleGrid>
        </Stack>
      </Card>

      {/* Results Display */}
      {lastFlip && stats && (
        <Card
          withBorder
          p="lg"
          style={{
            background:
              "linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-cyan-5))",
            color: "white",
          }}
        >
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" c="gray.1" mb={4}>
                  {lastFlip.mode}
                  {lastFlip.krarkActive && " (Krark's Thumb)"}
                </Text>
                <Text size="xl" fw={700}>
                  Latest Result
                </Text>
              </div>
              <Badge
                size="lg"
                color="white"
                variant="filled"
                style={{ color: "#000" }}
              >
                {stats.total} flip{stats.total !== 1 ? "s" : ""}
              </Badge>
            </Group>

            <SimpleGrid cols={3}>
              <div>
                <Group gap="xs">
                  <IconCheck size={24} color="white" />
                  <Text size="2rem" fw={900} c="white">
                    {stats.heads}
                  </Text>
                </Group>
                <Text size="sm" c="gray.1">
                  Heads (Wins)
                </Text>
              </div>

              <div>
                <Group gap="xs">
                  <IconX size={24} color="white" />
                  <Text size="2rem" fw={900} c="white">
                    {stats.tails}
                  </Text>
                </Group>
                <Text size="sm" c="gray.1">
                  Tails (Losses)
                </Text>
              </div>

              <div>
                <Text size="xl" fw={700} c="white">
                  {stats.total > 0
                    ? ((stats.heads / stats.total) * 100).toFixed(1)
                    : 0}
                  %
                </Text>
                <Text size="sm" c="gray.1">
                  Win Rate
                </Text>
              </div>
            </SimpleGrid>

            {/* Visual flip sequence */}
            <Box>
              <Text size="xs" c="gray.1" mb="xs">
                Flip Sequence:
              </Text>
              <ScrollArea type="auto">
                <Group gap={4} wrap="nowrap">
                  {lastFlip.flips.map((flip, index) => (
                    <Badge
                      key={index}
                      size="lg"
                      color={flip.result === "heads" ? "green" : "red"}
                      variant="filled"
                      title={
                        flip.krarkFlip1
                          ? `Krark: ${flip.krarkFlip1}/${flip.krarkFlip2} → chose ${flip.chosen}`
                          : undefined
                      }
                    >
                      {flip.result === "heads" ? "H" : "T"}
                    </Badge>
                  ))}
                </Group>
              </ScrollArea>
              {lastFlip.krarkActive && (
                <Text
                  size="xs"
                  c="gray.1"
                  mt="xs"
                  style={{ fontStyle: "italic" }}
                >
                  Hover badges to see Krark&apos;s Thumb flips
                </Text>
              )}
            </Box>
          </Stack>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card withBorder p="md">
          <Group justify="space-between" mb="md">
            <Text fw={600} size="sm">
              Flip History ({history.length})
            </Text>
            <Button
              size="xs"
              variant="subtle"
              color="red"
              leftSection={<IconRefresh size={14} />}
              onClick={handleClearHistory}
            >
              Clear
            </Button>
          </Group>

          <ScrollArea h={300}>
            <Stack gap="xs">
              {history.map((flip) => {
                const flipStats = countResults(flip.flips);
                return (
                  <Paper
                    key={flip.id}
                    p="sm"
                    withBorder
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        lastFlip?.id === flip.id
                          ? "var(--mantine-color-blue-0)"
                          : undefined,
                    }}
                    onClick={() => setLastFlip(flip)}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Group gap="xs" wrap="nowrap">
                          <Text size="sm" fw={500} truncate>
                            {flip.mode}
                          </Text>
                          {flip.krarkActive && (
                            <Badge size="xs" color="orange">
                              Krark
                            </Badge>
                          )}
                        </Group>
                        <Group gap="xs" mt={4}>
                          <Badge size="xs" color="green" variant="light">
                            {flipStats.heads}H
                          </Badge>
                          <Badge size="xs" color="red" variant="light">
                            {flipStats.tails}T
                          </Badge>
                          <Text size="xs" c="dimmed">
                            ({flipStats.total} total)
                          </Text>
                        </Group>
                      </div>
                      <Text size="xs" c="dimmed">
                        {new Date(flip.timestamp).toLocaleTimeString()}
                      </Text>
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          </ScrollArea>
        </Card>
      )}

      {history.length === 0 && !lastFlip && (
        <Card withBorder p="xl">
          <Stack align="center" gap="md">
            <IconCoin size={48} stroke={1.5} style={{ opacity: 0.5 }} />
            <Text c="dimmed" ta="center">
              No flips yet. Choose a flip option above to get started!
            </Text>
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export default CoinFlipper;
