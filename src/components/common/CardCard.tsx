import React from "react";
import { Card, Image, Button, Group } from "@mantine/core";

interface CardCardProps {
  imageUrl?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const CardCard: React.FC<CardCardProps> = ({
  imageUrl,
  buttonText,
  onButtonClick,
}) => {
  return (
    <Card style={{ width: 357, height: 700 }}>
      <Card.Section>
        {imageUrl ? (
          <Image src={imageUrl} alt="Card Image" style={{ maxWidth: "100%" }} />
        ) : (
          "Image not available"
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

export default CardCard;
