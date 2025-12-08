"use client";

import { Button, Container, Group, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DungeonTracker } from "~/components/DungeonTracker";
import { getDungeonById } from "~/lib/api/dungeons";
import { RootState } from "~/store/configureStore";
import { clearDungeonSelection } from "~/store/reducers/gameReducer";
import { DungeonCard } from "~/types/dungeon";
import { DungeonGameSelector } from "../DungeonGameSelector";

export default function DungeonGameInstancePage() {
  const dispatch = useDispatch();
  const [dungeon, setDungeon] = useState<DungeonCard | null>(null);
  const [loading, setLoading] = useState(false);
  const { dungeonId } = useSelector((state: RootState) => state.game);

  const handleBackToDungeonSelection = () => {
    dispatch(clearDungeonSelection());
    setDungeon(null);
  };

  useEffect(() => {
    console.log("dungeonId", dungeonId);
    console.log("dungeon", dungeon);
  }, [dungeonId, dungeon]);

  useEffect(() => {
    loadDungeon();
  }, [dungeonId]);

  const loadDungeon = async () => {
    if (!dungeonId) return;
    try {
      const data = await getDungeonById(dungeonId);
      setDungeon(data);
    } catch (error) {
      console.error("Failed to load dungeon:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load dungeon",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div>Loading dungeon...</div>
      </Container>
    );
  }

  // if (!dungeon) {
  //   return (
  //     <Container>
  //       <div>Dungeon not found</div>
  //     </Container>
  //   );
  // }

  return (
    // <Container size="lg" py="xl">
    <Stack gap="xl">
      {dungeon ? (
        <Stack>
          <Group>
            <Button
              leftSection={<IconArrowLeft size={16} />}
              variant="subtle"
              onClick={() => handleBackToDungeonSelection()}
            >
              Back to Dungeon Selection
            </Button>
          </Group>

          <DungeonTracker
            dungeon={dungeon}
            // onComplete={handleComplete}
          />
        </Stack>
      ) : (
        <DungeonGameSelector />
      )}
    </Stack>
    // </Container>
  );
}
