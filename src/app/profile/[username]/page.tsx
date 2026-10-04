"use client";

import { Container } from "@mantine/core";
import { useParams } from "next/navigation";
import { PlayerProfile } from "~/components/PlayerProfile";

export default function PlayerProfilePage() {
  const { username } = useParams<{ username: string }>();

  return (
    <Container size="lg" py="xl">
      <PlayerProfile username={decodeURIComponent(username)} />
    </Container>
  );
}
