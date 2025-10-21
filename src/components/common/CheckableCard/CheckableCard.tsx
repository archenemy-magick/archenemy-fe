// ============================================
// Improved CheckableCard - Remove weird corner brackets
// src/components/common/CheckableCard/CheckableCard.tsx
// ============================================

import { Box, Image } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { CustomArchenemyCard } from "~/types";

interface CheckableCardProps {
  card: CustomArchenemyCard;
  onClick: () => void;
  cardSelected: boolean;
}

const CheckableCard = ({ card, onClick, cardSelected }: CheckableCardProps) => {
  return (
    <Box
      onClick={onClick}
      style={{
        position: "relative",
        borderRadius: "var(--mantine-radius-md)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s ease",
        ...(cardSelected && {
          boxShadow:
            "0 0 0 3px var(--mantine-color-magenta-5), 0 8px 24px rgba(132, 94, 247, 0.4)",
          transform: "translateY(-4px)",
        }),
      }}
      className="card-hover"
    >
      <Image
        src={card.border_crop_image || card.normal_image}
        alt={card.name}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
        }}
      />

      {/* Selection Indicator */}
      {cardSelected && (
        <Box
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--mantine-color-magenta-6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          <IconCheck size={20} color="white" stroke={3} />
        </Box>
      )}

      {/* Hover Overlay */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          background: cardSelected
            ? "rgba(132, 94, 247, 0.15)"
            : "rgba(0, 0, 0, 0)",
          transition: "background 0.2s ease",
          pointerEvents: "none",
        }}
        className="card-overlay"
      />
    </Box>
  );
};

export default CheckableCard;
