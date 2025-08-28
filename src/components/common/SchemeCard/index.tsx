import React from "react";
import { Card, Image, Button, Box } from "@mantine/core";
import { ScryfallCard } from "@scryfall/api-types";

interface SchemeCardProps {
  buttonText?: string;
  onButtonClick?: () => void;
  onOpenModal?: (card: ScryfallCard.Scheme) => void;
  card: ScryfallCard.Scheme;
}

const SchemeCard: React.FC<SchemeCardProps> = ({
  buttonText,
  onButtonClick,
  onOpenModal,
  card,
}) => {
  if (!card) {
    return null;
  }
  const { name, image_uris } = card;
  return (
    <Card style={{ width: 360, minHeight: 300 }}>
      <Card.Section
        onClick={() => onOpenModal && onOpenModal(card)}
        style={{ cursor: onOpenModal ? "pointer" : "default" }}
      >
        {image_uris ? (
          <Image src={image_uris?.normal} alt={name} style={{ height: 520 }} />
        ) : (
          <Box
            style={{
              width: "100%",
              height: 520,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Image not available
          </Box>
        )}
      </Card.Section>
      {buttonText && onButtonClick && (
        <Button size="small" mt="md" fullWidth onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </Card>
  );
};

export default SchemeCard;
