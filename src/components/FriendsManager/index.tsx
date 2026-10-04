"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconSearch, IconUserPlus } from "@tabler/icons-react";
import Link from "next/link";
import { profileHref } from "~/lib/profileLinks";
import {
  acceptFriendRequest,
  getFriendLists,
  removeFriendship,
  sendFriendRequest,
  type FriendLists,
  type Friendship,
} from "~/lib/api/friends";
import {
  searchPublicProfiles,
  type PublicProfile,
} from "~/lib/api/publicProfiles";

const EMPTY_LISTS: FriendLists = { friends: [], incoming: [], outgoing: [] };

function showError(title: string, error: unknown) {
  notifications.show({
    title,
    message: (error as Error).message || "Try again.",
    color: "red",
  });
}

function ProfileRow({
  profile,
  children,
}: {
  profile: PublicProfile;
  children?: React.ReactNode;
}) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Anchor
        component={Link}
        href={profileHref(profile.username)}
        underline="hover"
        c="inherit"
        style={{ minWidth: 0 }}
      >
        <Group gap="sm" wrap="nowrap">
          <Avatar src={profile.avatar_url} radius="xl" size="md">
            {profile.username.slice(0, 2).toUpperCase()}
          </Avatar>
          <Text fw={600} truncate>
            {profile.username}
          </Text>
        </Group>
      </Anchor>
      <Group gap="xs" wrap="nowrap">
        {children}
      </Group>
    </Group>
  );
}

export function FriendsManager() {
  const [lists, setLists] = useState<FriendLists>(EMPTY_LISTS);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [results, setResults] = useState<PublicProfile[]>([]);
  const [searching, setSearching] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLists(await getFriendLists());
    } catch (error) {
      showError("Could not load friends", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    if (debouncedQuery.trim().length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchPublicProfiles(debouncedQuery)
      .then((profiles) => {
        if (!cancelled) setResults(profiles);
      })
      .catch((error) => {
        if (!cancelled) showError("Search failed", error);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const run = async (
    id: string,
    action: () => Promise<void>,
    title: string
  ) => {
    try {
      setBusyId(id);
      await action();
      await refresh();
    } catch (error) {
      showError(title, error);
    } finally {
      setBusyId(null);
    }
  };

  // Every profile id the user already has a relationship with, by state.
  const relationFor = (profileId: string) => {
    const match = (list: Friendship[]) =>
      list.find((friendship) => friendship.friend.id === profileId);
    const friend = match(lists.friends);
    if (friend) return { kind: "friend" as const, friendship: friend };
    const incoming = match(lists.incoming);
    if (incoming) return { kind: "incoming" as const, friendship: incoming };
    const outgoing = match(lists.outgoing);
    if (outgoing) return { kind: "outgoing" as const, friendship: outgoing };
    return null;
  };

  return (
    <Stack gap="lg">
      <Card withBorder padding="lg">
        <Stack gap="sm">
          <Title order={4}>Add a friend</Title>
          <TextInput
            placeholder="Search by username"
            leftSection={<IconSearch size={16} />}
            rightSection={searching ? <Loader size="xs" /> : null}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            aria-label="Search by username"
          />
          {query.trim().length > 0 && query.trim().length < 3 ? (
            <Text size="sm" c="dimmed">
              Type at least 3 characters.
            </Text>
          ) : null}
          {debouncedQuery.trim().length >= 3 &&
          !searching &&
          results.length === 0 ? (
            <Text size="sm" c="dimmed">
              No users found.
            </Text>
          ) : null}
          {results.map((profile) => {
            const relation = relationFor(profile.id);
            return (
              <ProfileRow key={profile.id} profile={profile}>
                {relation?.kind === "friend" ? (
                  <Badge variant="light" color="green">
                    Friends
                  </Badge>
                ) : relation?.kind === "outgoing" ? (
                  <Badge variant="light" color="gray">
                    Requested
                  </Badge>
                ) : relation?.kind === "incoming" ? (
                  <Button
                    size="xs"
                    loading={busyId === relation.friendship.id}
                    onClick={() =>
                      run(
                        relation.friendship.id,
                        () => acceptFriendRequest(relation.friendship.id),
                        "Could not accept"
                      )
                    }
                  >
                    Accept
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconUserPlus size={14} />}
                    loading={busyId === profile.id}
                    onClick={() =>
                      run(
                        profile.id,
                        () => sendFriendRequest(profile.id),
                        "Could not send request"
                      )
                    }
                  >
                    Add
                  </Button>
                )}
              </ProfileRow>
            );
          })}
        </Stack>
      </Card>

      {lists.incoming.length > 0 ? (
        <Card withBorder padding="lg">
          <Stack gap="sm">
            <Title order={4}>Requests for you</Title>
            {lists.incoming.map((request) => (
              <ProfileRow key={request.id} profile={request.friend}>
                <Button
                  size="xs"
                  loading={busyId === request.id}
                  onClick={() =>
                    run(
                      request.id,
                      () => acceptFriendRequest(request.id),
                      "Could not accept"
                    )
                  }
                >
                  Accept
                </Button>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  disabled={busyId === request.id}
                  onClick={() =>
                    run(
                      request.id,
                      () => removeFriendship(request.id),
                      "Could not decline"
                    )
                  }
                >
                  Decline
                </Button>
              </ProfileRow>
            ))}
          </Stack>
        </Card>
      ) : null}

      <Card withBorder padding="lg">
        <Stack gap="sm">
          <Title order={4}>Your friends</Title>
          {loading ? (
            <Text c="dimmed" size="sm">
              Loading…
            </Text>
          ) : lists.friends.length === 0 ? (
            <Text c="dimmed" size="sm">
              No friends yet. Search for someone&apos;s username above.
            </Text>
          ) : (
            lists.friends.map((friendship) => (
              <ProfileRow key={friendship.id} profile={friendship.friend}>
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  loading={busyId === friendship.id}
                  onClick={() =>
                    run(
                      friendship.id,
                      () => removeFriendship(friendship.id),
                      "Could not remove friend"
                    )
                  }
                >
                  Remove
                </Button>
              </ProfileRow>
            ))
          )}
        </Stack>
      </Card>

      {lists.outgoing.length > 0 ? (
        <Card withBorder padding="lg">
          <Stack gap="sm">
            <Title order={4}>Sent requests</Title>
            {lists.outgoing.map((request) => (
              <ProfileRow key={request.id} profile={request.friend}>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  loading={busyId === request.id}
                  onClick={() =>
                    run(
                      request.id,
                      () => removeFriendship(request.id),
                      "Could not cancel request"
                    )
                  }
                >
                  Cancel
                </Button>
              </ProfileRow>
            ))}
          </Stack>
        </Card>
      ) : null}
    </Stack>
  );
}
