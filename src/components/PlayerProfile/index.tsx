"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconShare,
  IconUserCheck,
  IconUserMinus,
  IconUserPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { StatsDashboard } from "~/components/StatsDashboard";
import {
  acceptFriendRequest,
  getFriendLists,
  removeFriendship,
  sendFriendRequest,
  type FriendLists,
  type Friendship,
} from "~/lib/api/friends";
import {
  getPublicProfileByUsername,
  type PublicProfile,
} from "~/lib/api/publicProfiles";
import {
  getFriendRecordedGames,
  getRecordedGames,
} from "~/lib/api/recordedGames";
import { DEFAULT_STATS_FILTERS, type GameStatsFilters } from "~/lib/gameStats";
import { profileHref } from "~/lib/profileLinks";
import type { RootState } from "~/store";
import type { RecordedGame } from "~/types/recordedGame";

type Relation =
  | { kind: "self" }
  | { kind: "friend"; friendship: Friendship }
  | { kind: "incoming"; friendship: Friendship }
  | { kind: "outgoing"; friendship: Friendship }
  | { kind: "none" };

function relationTo(
  profileId: string,
  userId: string | null,
  lists: FriendLists
): Relation {
  if (profileId === userId) return { kind: "self" };
  const find = (list: Friendship[]) =>
    list.find((friendship) => friendship.friend.id === profileId);
  const friend = find(lists.friends);
  if (friend) return { kind: "friend", friendship: friend };
  const incoming = find(lists.incoming);
  if (incoming) return { kind: "incoming", friendship: incoming };
  const outgoing = find(lists.outgoing);
  if (outgoing) return { kind: "outgoing", friendship: outgoing };
  return { kind: "none" };
}

function showError(title: string, error: unknown) {
  notifications.show({
    title,
    message: (error as Error).message || "Try again.",
    color: "red",
  });
}

export function PlayerProfile({ username }: { username: string }) {
  const { id: userId, username: myUsername } = useSelector(
    (state: RootState) => state.user
  );

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [lists, setLists] = useState<FriendLists | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading"
  );
  const [games, setGames] = useState<RecordedGame[] | null>(null);
  const [filters, setFilters] = useState<GameStatsFilters>(
    DEFAULT_STATS_FILTERS
  );
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const refreshLists = useCallback(async () => {
    setLists(await getFriendLists());
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    Promise.all([getPublicProfileByUsername(username), getFriendLists()])
      .then(([found, friendLists]) => {
        if (cancelled) return;
        setProfile(found);
        setLists(friendLists);
        setStatus(found ? "ready" : "missing");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  const relation: Relation | null =
    profile && lists ? relationTo(profile.id, userId, lists) : null;
  const canSeeStats = relation?.kind === "self" || relation?.kind === "friend";

  useEffect(() => {
    if (!profile || !canSeeStats) {
      setGames(null);
      return;
    }
    let cancelled = false;
    const load =
      profile.id === userId
        ? getRecordedGames()
        : getFriendRecordedGames(profile.id);
    load
      .then((result) => {
        if (!cancelled) setGames(result);
      })
      .catch((error) => {
        if (!cancelled) showError("Could not load stats", error);
      });
    return () => {
      cancelled = true;
    };
  }, [profile, canSeeStats, userId]);

  // Names that should link to a profile: the viewer and their friends.
  const profileUsernames = useMemo(() => {
    const map = new Map<string, string>();
    for (const friendship of lists?.friends ?? []) {
      map.set(friendship.friend.id, friendship.friend.username);
    }
    if (userId && myUsername) map.set(userId, myUsername);
    return map;
  }, [lists, userId, myUsername]);

  const run = async (action: () => Promise<void>, errorTitle: string) => {
    try {
      setBusy(true);
      await action();
      await refreshLists();
    } catch (error) {
      showError(errorTitle, error);
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    if (!profile) return;
    const url = `${window.location.origin}${profileHref(profile.username)}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.username} on MagicSAK`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      notifications.show({
        title: "Link copied",
        message: url,
        color: "green",
      });
    } catch (error) {
      // Closing the native share sheet rejects with AbortError.
      if ((error as Error).name !== "AbortError") {
        showError("Could not share link", error);
      }
    }
  };

  if (status === "loading") {
    return <Text c="dimmed">Loading profile…</Text>;
  }

  if (status === "missing" || !profile || !relation) {
    return (
      <Stack gap="sm" align="flex-start">
        <Text>No player named &quot;{username}&quot;.</Text>
        <Button variant="light" component={Link} href="/friends">
          Find friends
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Card withBorder padding="lg">
        <Group justify="space-between" wrap="wrap" gap="md">
          <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
            <Avatar src={profile.avatar_url} size={72} radius="xl">
              {profile.username.slice(0, 2).toUpperCase()}
            </Avatar>
            <Stack gap={4} style={{ minWidth: 0 }}>
              <Title order={1} style={{ overflowWrap: "anywhere" }}>
                {profile.username}
              </Title>
              {relation.kind === "friend" ? (
                <Badge
                  color="green"
                  variant="light"
                  leftSection={<IconUserCheck size={12} />}
                >
                  Friend
                </Badge>
              ) : relation.kind === "self" ? (
                <Text size="sm" c="dimmed">
                  This is how your profile looks to friends.
                </Text>
              ) : null}
            </Stack>
          </Group>

          <Group gap="xs">
            <Button
              variant="light"
              leftSection={<IconShare size={16} />}
              onClick={handleShare}
            >
              Share profile
            </Button>
            {relation.kind === "self" ? (
              <Button variant="default" component={Link} href="/profile">
                Edit profile
              </Button>
            ) : relation.kind === "friend" ? (
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconUserMinus size={16} />}
                onClick={() => setConfirmRemove(true)}
              >
                Remove friend
              </Button>
            ) : relation.kind === "incoming" ? (
              <>
                <Button
                  loading={busy}
                  onClick={() =>
                    run(
                      () => acceptFriendRequest(relation.friendship.id),
                      "Could not accept"
                    )
                  }
                >
                  Accept request
                </Button>
                <Button
                  variant="subtle"
                  color="gray"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () => removeFriendship(relation.friendship.id),
                      "Could not decline"
                    )
                  }
                >
                  Decline
                </Button>
              </>
            ) : relation.kind === "outgoing" ? (
              <Button
                variant="default"
                loading={busy}
                onClick={() =>
                  run(
                    () => removeFriendship(relation.friendship.id),
                    "Could not cancel request"
                  )
                }
              >
                Cancel request
              </Button>
            ) : (
              <Button
                leftSection={<IconUserPlus size={16} />}
                loading={busy}
                onClick={() =>
                  run(
                    () => sendFriendRequest(profile.id),
                    "Could not send request"
                  )
                }
              >
                Add friend
              </Button>
            )}
          </Group>
        </Group>
      </Card>

      {canSeeStats ? (
        games === null ? (
          <Text c="dimmed">Loading stats…</Text>
        ) : (
          <StatsDashboard
            games={games}
            filters={filters}
            onFiltersChange={setFilters}
            subjectName={
              relation.kind === "self" ? undefined : profile.username
            }
            profileUsernames={profileUsernames}
          />
        )
      ) : (
        <Card withBorder padding="xl" ta="center">
          <Text c="dimmed">
            {relation.kind === "outgoing"
              ? `Friend request sent. Once ${profile.username} accepts, you can see each other's stats.`
              : relation.kind === "incoming"
              ? `${profile.username} wants to be friends. Accept to see each other's stats.`
              : `Become friends with ${profile.username} to see each other's stats.`}
          </Text>
        </Card>
      )}

      <Modal
        opened={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        title={`Remove ${profile.username} as a friend?`}
        centered
      >
        <Text size="sm" mb="lg">
          You will no longer see each other&apos;s stats, and you won&apos;t be
          able to link them to new games. Games you already recorded together
          are kept.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirmRemove(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            loading={busy}
            onClick={async () => {
              if (relation.kind !== "friend") return;
              await run(
                () => removeFriendship(relation.friendship.id),
                "Could not remove friend"
              );
              setConfirmRemove(false);
            }}
          >
            Remove friend
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
