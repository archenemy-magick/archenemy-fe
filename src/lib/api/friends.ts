import { createClient } from "../supabase/client";
import { getPublicProfiles, type PublicProfile } from "./publicProfiles";

const supabase = createClient();

export type FriendshipStatus = "pending" | "accepted";

export type Friendship = {
  id: string;
  status: FriendshipStatus;
  created_at: string;
  /** The other person in the friendship. */
  friend: PublicProfile;
  /** True when the signed-in user sent the request. */
  sentByMe: boolean;
};

export type FriendLists = {
  friends: Friendship[];
  incoming: Friendship[];
  outgoing: Friendship[];
};

type FriendshipRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
};

async function requireUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function getFriendLists(): Promise<FriendLists> {
  const userId = await requireUserId();

  // RLS limits this to friendships the user is part of.
  const { data, error } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as FriendshipRow[];
  const otherId = (row: FriendshipRow) =>
    row.requester_id === userId ? row.addressee_id : row.requester_id;
  const profiles = await getPublicProfiles(rows.map(otherId));

  const lists: FriendLists = { friends: [], incoming: [], outgoing: [] };
  for (const row of rows) {
    const friend = profiles.get(otherId(row));
    // Deactivated accounts drop out of public_profiles.
    if (!friend) continue;

    const friendship: Friendship = {
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      friend,
      sentByMe: row.requester_id === userId,
    };
    if (row.status === "accepted") lists.friends.push(friendship);
    else if (friendship.sentByMe) lists.outgoing.push(friendship);
    else lists.incoming.push(friendship);
  }

  lists.friends.sort((a, b) =>
    a.friend.username.localeCompare(b.friend.username)
  );
  return lists;
}

/** Accepted friends only, for linking game seats. */
export async function getFriends(): Promise<PublicProfile[]> {
  const { friends } = await getFriendLists();
  return friends.map((friendship) => friendship.friend);
}

export async function sendFriendRequest(addresseeId: string): Promise<void> {
  const userId = await requireUserId();

  const { error } = await supabase.from("friendships").insert({
    requester_id: userId,
    addressee_id: addresseeId,
  });

  if (error) {
    // Unique pair index: a request already exists in one direction.
    if (error.code === "23505") {
      throw new Error("You already have a request or friendship with them.");
    }
    throw error;
  }
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", friendshipId);

  if (error) throw error;
}

/** Decline, cancel, or unfriend. */
export async function removeFriendship(friendshipId: string): Promise<void> {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  if (error) throw error;
}
