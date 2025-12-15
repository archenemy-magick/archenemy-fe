// components/game/LifeTracker/LifeTrackerActionsMenu.tsx
"use client";

import { Menu, Button } from "@mantine/core";
import {
  IconPlus,
  IconMinus,
  IconRefresh,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";

interface Player {
  id: string;
  name: string;
}

interface LifeTrackerActionsMenuProps {
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: string) => void;
  onNewGame: () => void;
  onOpenSettings: () => void;
  players: Player[];
  maxPlayers?: number;
  disabled?: boolean;
}

export function LifeTrackerActionsMenu({
  onAddPlayer,
  onRemovePlayer,
  onNewGame,
  onOpenSettings,
  players,
  maxPlayers = 6,
  disabled = false,
}: LifeTrackerActionsMenuProps) {
  const currentPlayers = players.length;

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
        <Menu.Label>Life Tracker Controls</Menu.Label>

        <Menu.Item
          leftSection={<IconPlus size={16} />}
          onClick={onAddPlayer}
          disabled={currentPlayers >= maxPlayers}
          color="green"
        >
          Add Player{" "}
          {currentPlayers < maxPlayers && `(${currentPlayers}/${maxPlayers})`}
        </Menu.Item>

        {/* Remove Player Submenu */}
        {currentPlayers > 2 && (
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
          // <Menu trigger="hover" position="right-start" offset={2} withArrow>
          //   <Menu.Target>
          //     <Menu.Item
          //       leftSection={<IconMinus size={16} />}
          //       rightSection="›"
          //       color="red"
          //     >
          //       Remove Player
          //     </Menu.Item>
          //   </Menu.Target>
          //   <Menu.Dropdown>
          //     <Menu.Label>Select Player</Menu.Label>
          //     {players.map((player) => (
          //       <Menu.Item
          //         key={player.id}
          //         leftSection={<IconUser size={14} />}
          //         onClick={() => onRemovePlayer(player.id)}
          //         color="red"
          //       >
          //         {player.name}
          //       </Menu.Item>
          //     ))}
          //   </Menu.Dropdown>
          // </Menu>
        )}

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconRefresh size={16} />}
          onClick={onNewGame}
          color="orange"
        >
          New Game
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconSettings size={16} />}
          onClick={onOpenSettings}
        >
          Settings
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
