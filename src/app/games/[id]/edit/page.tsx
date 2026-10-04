"use client";

import { useEffect, useState } from "react";
import { Button, Container, Stack, Text, Title } from "@mantine/core";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RecordGameForm } from "~/components/RecordGameForm";
import { getRecordedGame } from "~/lib/api/recordedGames";
import type { RootState } from "~/store";
import type { RecordedGame } from "~/types/recordedGame";

export default function EditGamePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const userId = useSelector((state: RootState) => state.user.id);
  const [game, setGame] = useState<RecordedGame | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    getRecordedGame(id)
      .then((result) => {
        if (cancelled) return;
        setGame(result);
        setStatus(result ? "ready" : "missing");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const canEdit = game !== null && game.recorded_by === userId;

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>Edit game</Title>
          <Text c="dimmed">
            Changes update your stats and the stats of any linked friends.
          </Text>
        </div>
        {status === "loading" ? (
          <Text c="dimmed">Loading game…</Text>
        ) : !canEdit ? (
          <Stack gap="sm" align="flex-start">
            <Text>
              {status === "missing"
                ? "This game could not be found."
                : "Only the person who recorded this game can edit it."}
            </Text>
            <Button variant="light" onClick={() => router.push("/games")}>
              Back to game log
            </Button>
          </Stack>
        ) : (
          <RecordGameForm game={game} />
        )}
      </Stack>
    </Container>
  );
}
