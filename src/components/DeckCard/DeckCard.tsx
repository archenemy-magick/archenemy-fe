import { Badge, Button, Card, Group, Image, Text } from "@mantine/core";
import { CustomArchenemyDeck } from "~/types";
const DeckCard = ({
  selectDeck,
  deck,
}: {
  selectDeck: () => void;
  deck: CustomArchenemyDeck;
}) => {
  console.log("deck in DeckCard", deck);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={deck.deck_cards[0]?.normal_image}
          height={160}
          alt="Norway"
        />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>{deck.name}</Text>
        <Badge color="pink">Popular</Badge>
      </Group>

      <Text size="sm" c="dimmed">
        {deck.description}
      </Text>

      <Button color="blue" fullWidth mt="md" radius="md" onClick={selectDeck}>
        Start Game
      </Button>
    </Card>
  );
};

export default DeckCard;
