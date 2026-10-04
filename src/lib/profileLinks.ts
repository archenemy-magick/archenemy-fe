/** Path to a player's profile page. */
export function profileHref(username: string): string {
  return `/profile/${encodeURIComponent(username)}`;
}
