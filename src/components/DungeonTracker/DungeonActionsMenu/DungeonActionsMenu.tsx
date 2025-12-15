// components/DungeonTracker/DungeonActionsMenu.tsx
"use client";

import { Button, Menu } from "@mantine/core";
import {
  IconArrowLeft,
  IconPlus,
  IconRefresh,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";

interface Player {
  id: string;
  name: string;
}

interface DungeonActionsMenuProps {
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: string) => void;
  onReset: () => void;
  onBack?: () => void;
  players: Player[];
  maxPlayers?: number;
  disabled?: boolean;
}

export function DungeonActionsMenu({
  onAddPlayer,
  onRemovePlayer,
  onReset,
  onBack,
  players,
  maxPlayers = 9,
  disabled = false,
}: DungeonActionsMenuProps) {
  const currentPlayerCount = players.length;

  console.log("players", players);

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <Button
          leftSection={<IconSettings size={18} />}
          variant="light"
          color="gray"
          size="sm"
          disabled={disabled}
        >
          Actions
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Dungeon Controls</Menu.Label>

        <Menu.Item
          leftSection={<IconPlus size={16} />}
          onClick={onAddPlayer}
          disabled={currentPlayerCount >= maxPlayers}
          color="green"
        >
          Add Player{" "}
          {currentPlayerCount < maxPlayers &&
            `(${currentPlayerCount}/${maxPlayers})`}
        </Menu.Item>
        <Menu.Sub closeDelay={150}>
          <Menu.Sub.Target>
            <Menu.Sub.Item>Remove Player</Menu.Sub.Item>
          </Menu.Sub.Target>

          <Menu.Sub.Dropdown>
            {players.map((player) => (
              <Menu.Sub.Item
                key={player.id}
                leftSection={<IconUser size={14} />}
                onClick={() => onRemovePlayer(player.id)}
                color="red"
              >
                {player.name}
              </Menu.Sub.Item>
            ))}
          </Menu.Sub.Dropdown>
        </Menu.Sub>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconRefresh size={16} />}
          onClick={onReset}
          color="orange"
        >
          Reset Dungeon
        </Menu.Item>

        {onBack && (
          <>
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconArrowLeft size={16} />}
              onClick={onBack}
              color="pink"
            >
              Back to Selection
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
