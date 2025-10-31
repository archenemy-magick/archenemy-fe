import { Modal, Image, Title, Text, Stack, Badge, Group } from "@mantine/core";
import { CustomArchenemyCard } from "~/types";

interface CardPreviewModalProps {
  card: CustomArchenemyCard | null;
  opened: boolean;
  onClose: () => void;
}

export function CardPreviewModal({
  card,
  opened,
  onClose,
}: CardPreviewModalProps) {
  if (!card) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="auto"
      centered
      withCloseButton
      padding="md"
    >
      <Stack gap="md">
        <Image
          src={card.border_crop_image || card.normal_image}
          alt={card.name}
          width={400}
          style={{ borderRadius: 8 }}
        />

        <Stack gap="xs">
          <Title order={3}>{card.name}</Title>
          <Badge>{card.type_line}</Badge>
          {card.oracle_text && (
            <Text size="sm" style={{ whiteSpace: "pre-line" }}>
              {card.oracle_text}
            </Text>
          )}
        </Stack>
      </Stack>
    </Modal>
  );
}
