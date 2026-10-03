"use client";

import { Autocomplete, Avatar, Group, Text, Tooltip } from "@mantine/core";
import { IconLink } from "@tabler/icons-react";
import type { PublicProfile } from "~/lib/api/publicProfiles";

type FriendNameAutocompleteProps = {
  value: string;
  linkedFriendId: string | null;
  friends: PublicProfile[];
  /** Friends already linked to other seats; hidden from suggestions. */
  takenFriendIds: string[];
  onChange: (displayName: string, friendId: string | null) => void;
};

export function findFriendByName(friends: PublicProfile[], name: string) {
  const needle = name.trim().toLowerCase();
  if (!needle) return null;
  return (
    friends.find((friend) => friend.username.toLowerCase() === needle) ?? null
  );
}

/**
 * Player name input that suggests friends. Picking (or typing the exact
 * username of) a friend links the seat to their account; anything else is
 * saved as a plain name.
 */
export function FriendNameAutocomplete({
  value,
  linkedFriendId,
  friends,
  takenFriendIds,
  onChange,
}: FriendNameAutocompleteProps) {
  const available = friends.filter(
    (friend) =>
      friend.id === linkedFriendId || !takenFriendIds.includes(friend.id)
  );
  const byUsername = new Map(
    available.map((friend) => [friend.username, friend])
  );
  const linked = friends.find((friend) => friend.id === linkedFriendId);

  const handleChange = (next: string) => {
    onChange(next, findFriendByName(available, next)?.id ?? null);
  };

  return (
    <Autocomplete
      label="Name"
      placeholder={friends.length > 0 ? "Friend or player name" : "Player name"}
      required
      value={value}
      onChange={handleChange}
      data={available.map((friend) => friend.username)}
      limit={8}
      renderOption={({ option }) => {
        const friend = byUsername.get(option.value);
        return (
          <Group gap="xs" wrap="nowrap">
            <Avatar src={friend?.avatar_url} size="sm" radius="xl">
              {option.value.slice(0, 2).toUpperCase()}
            </Avatar>
            <Text size="sm">{option.value}</Text>
          </Group>
        );
      }}
      rightSection={
        linked ? (
          <Tooltip
            label={`Linked to ${linked.username}. This game will appear in their stats.`}
            withArrow
            multiline
            w={220}
          >
            <IconLink
              size={16}
              color="var(--mantine-color-green-6)"
              aria-label={`Linked to ${linked.username}`}
            />
          </Tooltip>
        ) : null
      }
      comboboxProps={{ withinPortal: true }}
    />
  );
}
