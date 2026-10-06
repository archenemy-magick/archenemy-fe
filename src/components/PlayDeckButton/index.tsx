"use client";

import { Button, type ButtonProps } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";
import { playArchenemyDeckHref } from "~/lib/gameLinks";

type PlayDeckButtonProps = Omit<ButtonProps, "component"> & {
  deckId: string;
};

/**
 * Opens Game Utilities with an Archenemy tab playing this deck. Works for
 * user decks and built-in decks, signed in or not.
 */
export function PlayDeckButton({
  deckId,
  ...buttonProps
}: PlayDeckButtonProps) {
  return (
    <Button
      component={Link}
      href={playArchenemyDeckHref(deckId)}
      leftSection={<IconPlayerPlay size={16} />}
      // Decks often sit inside clickable cards (preview on click).
      onClick={(event) => event.stopPropagation()}
      {...buttonProps}
    >
      Play with this deck
    </Button>
  );
}
