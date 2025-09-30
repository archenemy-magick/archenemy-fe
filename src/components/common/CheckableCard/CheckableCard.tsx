import { Checkbox, Image } from "@mantine/core";
import { ScryfallCard } from "@scryfall/api-types";
import { useState } from "react";
import classes from "./checkableCard.module.css";
import { CustomArchenemyCard } from "../../../types";

const CheckableCard = ({
  card,
  onClick,
  cardSelected,
}: {
  card: CustomArchenemyCard;
  onClick: (card: CustomArchenemyCard) => void;
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
      <Image src={card.normalImage} alt={card.name} />
    </Checkbox.Card>
  );
};

export default CheckableCard;
