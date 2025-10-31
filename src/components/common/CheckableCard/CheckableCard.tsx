import { Card, Image, Badge, Stack, Tooltip, ActionIcon } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { CustomArchenemyCard } from "~/types";
import { useMediaQuery } from "@mantine/hooks";

interface CheckableCardProps {
  card: CustomArchenemyCard;
  onClick: () => void;
  onPreview?: () => void;
  cardSelected: boolean;
}

export default function CheckableCard({
  card,
  onClick,
  onPreview,
  cardSelected,
}: CheckableCardProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleClick = (e: React.MouseEvent) => {
    if ((e.ctrlKey || e.metaKey) && !isMobile) {
      e.preventDefault();
      onPreview?.();
    } else {
      onClick();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onPreview?.();
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    onPreview?.();
  };

  const cardContent = (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={{
        cursor: "pointer",
        border: cardSelected
          ? "2px solid var(--mantine-color-blue-6)"
          : undefined,
        transition: "all 0.2s ease",
        position: "relative",
      }}
    >
      {/* Mobile Preview Button */}
      {isMobile && (
        <ActionIcon
          variant="filled"
          color="blue"
          size="lg"
          radius="xl"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
          }}
          onClick={handlePreviewClick}
        >
          <IconEye size={18} />
        </ActionIcon>
      )}

      <Card.Section>
        <Image
          src={card.border_crop_image || card.normal_image}
          alt={card.name}
          height={280}
          fit="contain"
        />
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Badge variant={cardSelected ? "filled" : "light"}>
          {card.type_line}
        </Badge>
      </Stack>
    </Card>
  );

  // Desktop: Show tooltip on hover
  if (!isMobile) {
    return (
      <Tooltip
        label={
          <Image
            src={card.border_crop_image || card.normal_image}
            alt={card.name}
            width={300}
            style={{ borderRadius: 8 }}
          />
        }
        position="right"
        withArrow
        openDelay={300}
        closeDelay={100}
        transitionProps={{ transition: "fade", duration: 200 }}
        styles={{
          tooltip: {
            padding: 0,
            background: "transparent",
            border: "none",
          },
        }}
      >
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
}
