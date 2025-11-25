// app/game/dungeon/page.tsx
"use client";

import { Container, Title, Stack } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { DungeonGameSelector } from "~/components/DungeonGameSelector";
import { RootState } from "~/store/configureStore";
import { clearDungeonSelection } from "~/store/reducers";
import DungeonGameInstancePage from "./[id]/page";
import { useEffect } from "react";

export default function DungeonGamePage() {
  const { dungeonId } = useSelector((state: RootState) => state.game);
  const dispatch = useDispatch();
  console.log("dungeonId:", dungeonId);

  useEffect(() => {
    console.log("Dungeon ID changed:", dungeonId);
  }, [dungeonId]);

  const handleBackToDungeonSelection = () => {
    dispatch(clearDungeonSelection());
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {dungeonId ? (
          <DungeonGameInstancePage
            dungeonId={dungeonId}
            handleBackToDungeonSelection={handleBackToDungeonSelection}
          />
        ) : (
          <DungeonGameSelector />
        )}
      </Stack>
    </Container>
  );
}
