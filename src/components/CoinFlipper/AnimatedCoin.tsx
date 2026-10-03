// components/game/CoinFlipper/AnimatedCoin.tsx
"use client";

import { Box, Group, Text, Badge } from "@mantine/core";
import { useEffect, useState } from "react";

interface AnimatedCoinProps {
  isFlipping: boolean;
  result: "heads" | "tails" | null;
  onFlipComplete?: () => void;
  label?: string;
  delay?: number; // Delay before starting animation (for sequential flips)
}

export function AnimatedCoin({
  isFlipping,
  result,
  onFlipComplete,
  label,
  delay = 0,
}: AnimatedCoinProps) {
  const [showResult, setShowResult] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (isFlipping && !hasStarted) {
      setShowResult(false);

      // Delay start if specified
      const startTimer = setTimeout(() => {
        setHasStarted(true);

        // Show result after animation completes
        const completeTimer = setTimeout(() => {
          setShowResult(true);
          onFlipComplete?.();
        }, 1000);

        return () => clearTimeout(completeTimer);
      }, delay);

      return () => clearTimeout(startTimer);
    }

    // Reset when not flipping
    if (!isFlipping) {
      setHasStarted(false);
      if (result !== null) {
        setShowResult(true);
      }
    }
  }, [isFlipping, hasStarted, delay, onFlipComplete, result]);

  return (
    <Box>
      <style>
        {`
          @keyframes coinFlip {
            0% {
              transform: rotateY(0deg) translateY(0px);
            }
            25% {
              transform: rotateY(450deg) translateY(-50px);
            }
            50% {
              transform: rotateY(900deg) translateY(-80px);
            }
            75% {
              transform: rotateY(1350deg) translateY(-50px);
            }
            100% {
              transform: rotateY(1800deg) translateY(0px);
            }
          }

          @keyframes coinLand {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }

          .coin-container {
            perspective: 1000px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            height: 180px;
            justify-content: center;
          }

          .coin {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            position: relative;
            transform-style: preserve-3d;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          }

          .coin.flipping {
            animation: coinFlip 1s cubic-bezier(0.4, 0.0, 0.2, 1);
          }

          .coin.landed {
            animation: coinLand 0.3s ease;
          }

          .coin-face {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            backface-visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            font-weight: bold;
            border: 4px solid #ffd700;
          }

          .coin-heads {
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #8b4513;
            transform: rotateY(0deg);
          }

          .coin-tails {
            background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
            color: #4a4a4a;
            transform: rotateY(180deg);
          }

          .coin-heads.show-tails {
            transform: rotateY(180deg);
          }

          .coin-tails.show-tails {
            transform: rotateY(0deg);
          }
        `}
      </style>

      <Box className="coin-container">
        {label && (
          <Badge size="sm" variant="filled" color="gray">
            {label}
          </Badge>
        )}

        <Box
          className={`coin ${hasStarted && isFlipping ? "flipping" : ""} ${
            showResult && !isFlipping ? "landed" : ""
          }`}
        >
          <Box
            className={`coin-face coin-heads ${
              result === "tails" && showResult ? "show-tails" : ""
            }`}
          >
            H
          </Box>
          <Box
            className={`coin-face coin-tails ${
              result === "tails" && showResult ? "show-tails" : ""
            }`}
          >
            T
          </Box>
        </Box>

        {showResult && result && (
          <Text size="sm" fw={600} c={result === "heads" ? "green" : "red"}>
            {result === "heads" ? "Heads!" : "Tails!"}
          </Text>
        )}
      </Box>
    </Box>
  );
}

// Multi-coin wrapper component
interface MultiCoinDisplayProps {
  coins: Array<{
    id: string;
    result: "heads" | "tails" | null;
    label?: string;
  }>;
  isFlipping: boolean;
  sequential?: boolean; // Flip coins one at a time
  onFlipComplete?: () => void;
}

export function MultiCoinDisplay({
  coins,
  isFlipping,
  sequential = false,
  onFlipComplete,
}: MultiCoinDisplayProps) {
  const [completedFlips, setCompletedFlips] = useState(0);

  useEffect(() => {
    if (!isFlipping) {
      setCompletedFlips(0);
    }
  }, [isFlipping]);

  const handleCoinComplete = () => {
    setCompletedFlips((prev) => {
      const newCount = prev + 1;
      if (newCount === coins.length) {
        onFlipComplete?.();
      }
      return newCount;
    });
  };

  return (
    <Group justify="center" align="flex-start" gap="xl">
      {coins.map((coin, index) => (
        <AnimatedCoin
          key={coin.id}
          isFlipping={isFlipping}
          result={coin.result}
          label={coin.label}
          delay={sequential ? index * 1100 : 0} // Stagger by 1.1s for sequential
          onFlipComplete={handleCoinComplete}
        />
      ))}
    </Group>
  );
}
