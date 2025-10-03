import { Box, Center, Text } from "@mantine/core";
import { ReactNode } from "react";
import SchemeCard from "../SchemeCard";
import { CustomArchenemyCard } from "~/types";

const CardSlot = ({
  card,
  emptyMessage,
}: {
  card?: CustomArchenemyCard | null;
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
