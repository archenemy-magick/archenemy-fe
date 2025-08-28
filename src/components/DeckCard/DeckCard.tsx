import { Badge, Button, Card, Group, Image, Text } from "@mantine/core";
const DeckCard = ({ selectDeck }: { selectDeck: () => void }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
          height={160}
          alt="Norway"
        />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>All Archenemy Cards</Text>
        <Badge color="pink">Popular</Badge>
      </Group>

      <Text size="sm" c="dimmed">
        This deck includes all 100+ Archenemy Cards, and will choose from them
        randomly!
      </Text>

      <Button color="blue" fullWidth mt="md" radius="md" onClick={selectDeck}>
        Start Game
      </Button>
    </Card>
  );
};

export default DeckCard;
