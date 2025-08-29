import { Box, Center, Text } from "@mantine/core";
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
    <Box style={{ width: "100%", minHeight: 320 }}>
      {card ? (
        <SchemeCard card={card} />
      ) : (
        <Center style={{ height: "100%" }}>
          <Box>
            <Text>{emptyMessage}</Text>
          </Box>
        </Center>
      )}
    </Box>
  );
};

export default CardSlot;
