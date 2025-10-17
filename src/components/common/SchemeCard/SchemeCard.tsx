import React from "react";
import { Card, Image, Button, Box } from "@mantine/core";
import { CustomArchenemyCard } from "~/types";

export interface SchemeCardProps {
  buttonText?: string;
  onButtonClick?: () => void;
  onOpenModal?: (card: CustomArchenemyCard) => void;
  card: CustomArchenemyCard;
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
  const { name, border_crop_image } = card;
  return (
    <Card style={{ width: 300, minHeight: 300 }}>
      <Card.Section
        onClick={() => onOpenModal && onOpenModal(card)}
        style={{ cursor: onOpenModal ? "pointer" : "default" }}
      >
        {border_crop_image ? (
          <Image
            src={border_crop_image}
            alt={name}
            style={{ height: 400 }}
            fit="contain"
          />
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
        <Button
          size="small"
          mt="md"
          variant="outline"
          fullWidth
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      )}
    </Card>
  );
};

export default SchemeCard;
