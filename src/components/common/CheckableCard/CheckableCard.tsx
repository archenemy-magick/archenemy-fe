import { Checkbox, Image } from "@mantine/core";
import { ScryfallCard } from "@scryfall/api-types";
import { useState } from "react";
import classes from "./checkableCard.module.css";

const CheckableCard = ({
  card,
  onClick,
  cardSelected,
}: {
  card: ScryfallCard.Scheme;
  onClick: (card: ScryfallCard.Scheme) => void;
  cardSelected: boolean;
}) => {
  const [checked, setChecked] = useState(cardSelected);
  const handleOnSelect = () => {
    onClick(card);
    setChecked((c) => !c);
  };
  return (
    <Checkbox.Card
      className={classes.root}
      value={card.id}
      radius="md"
      checked={checked}
      onClick={handleOnSelect}
    >
      <Image src={card.image_uris?.normal} alt={card.name} />
    </Checkbox.Card>
  );
};

export default CheckableCard;
