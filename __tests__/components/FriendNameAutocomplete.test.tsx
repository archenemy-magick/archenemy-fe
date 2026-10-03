import { findFriendByName } from "~/components/RecordGameForm/FriendNameAutocomplete";

const friends = [
  { id: "f1", username: "SamTheMage", avatar_url: null },
  { id: "f2", username: "alex", avatar_url: null },
];

describe("findFriendByName", () => {
  it("matches usernames case-insensitively and ignores whitespace", () => {
    expect(findFriendByName(friends, "  samthemage ")?.id).toBe("f1");
  });

  it("does not link partial or unknown names", () => {
    expect(findFriendByName(friends, "sam")).toBeNull();
    expect(findFriendByName(friends, "Jordan")).toBeNull();
    expect(findFriendByName(friends, "")).toBeNull();
  });
});
