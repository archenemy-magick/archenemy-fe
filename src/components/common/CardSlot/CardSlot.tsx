import { Box } from "@mantine/core";
import { ScryfallCard } from "@scryfall/api-types";
import { ReactNode } from "react";
import SchemeCard from "../SchemeCard";

const CardSlot = ({
  card,
  emptyMessage,
}: {
  card?: ScryfallCard.Scheme | null;
  emptyMessage?: ReactNode;
}) => {
  return (
    card && (
      <Box style={{ width: "100%", height: 600 }}>
        {card ? <SchemeCard card={card} /> : <Box>{emptyMessage}</Box>}
      </Box>
    )
  );
};

export default CardSlot;
