// app/game/page.tsx - Mobile-friendly with prominent buttons
"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "~/store";
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Card,
  Group,
  Tabs,
  ActionIcon,
  Box,
  Menu,
} from "@mantine/core";
import {
  IconSword,
  IconMapSearch,
  IconHeart,
  IconX,
  IconPlus,
} from "@tabler/icons-react";
import {
  addTab,
  removeTab,
  setActiveTab,
} from "~/store/reducers/gameTabsReducer";
import ArchenemyGame from "~/components/ArchenemyGame";
import DungeonContainer from "~/components/DungeonContainer";
import LifeTracker from "~/components/LifeTracker";

export default function GamePage() {
  const dispatch = useDispatch();
  const { tabs, activeTabId } = useSelector(
    (state: RootState) => state.gameTabs
  );

  const handleAddArchenemy = () => {
    dispatch(
      addTab({
        type: "archenemy",
        label: "Archenemy Game",
        config: { deckId: "placeholder" },
      })
    );
  };

  const handleAddDungeon = () => {
    dispatch(
      addTab({
        type: "dungeons",
        label: "Dungeon Tracker",
        config: { dungeonId: "placeholder" },
      })
    );
  };

  const handleAddLifeTracker = () => {
    dispatch(
      addTab({
        type: "life-tracker",
        label: "Life Tracker",
      })
    );
  };

  const handleCloseTab = (tabId: string) => {
    dispatch(removeTab(tabId));
  };

  const renderTabContent = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return null;

    switch (tab.type) {
      case "archenemy":
        return <ArchenemyGame tabId={tab.id} />;
      case "dungeons":
        return <DungeonContainer tabId={tab.id} />;
      case "life-tracker":
        return <LifeTracker tabId={tab.id} />;
      default:
        return null;
    }
  };

  const checkIfTabExists = (type: string) => {
    return tabs.some((tab) => tab.type === type);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header with Add Button */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>Game Utilities</Title>
          </div>

          {/* Add Utility Menu */}
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button
                leftSection={<IconPlus size={18} />}
                variant="light"
                color="grape"
                size="sm"
              >
                New Utility
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Select Utility</Menu.Label>
              <Menu.Item
                leftSection={<IconSword size={16} />}
                onClick={handleAddArchenemy}
                disabled={checkIfTabExists("archenemy")}
                color="violet"
              >
                Archenemy
              </Menu.Item>
              <Menu.Item
                leftSection={<IconMapSearch size={16} />}
                onClick={handleAddDungeon}
                disabled={checkIfTabExists("dungeons")}
                color="blue"
              >
                Dungeons
              </Menu.Item>
              <Menu.Item
                leftSection={<IconHeart size={16} />}
                onClick={handleAddLifeTracker}
                disabled={checkIfTabExists("life-tracker")}
                color="red"
              >
                Life Tracker
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {tabs.length === 0 ? (
          /* Empty State */
          <Card withBorder p="xl">
            <Box ta="center">
              <Title order={3} mb="xs">
                No Active Tabs
              </Title>
              <Text c="dimmed">
                Click &quot;New Utility&quot; above to get started
              </Text>
            </Box>
          </Card>
        ) : (
          /* Tabs Interface */
          <Card withBorder p={0}>
            <Tabs
              value={activeTabId}
              onChange={(value) => value && dispatch(setActiveTab(value))}
              variant="default"
            >
              <Tabs.List style={{ flexWrap: "nowrap", overflowX: "auto" }}>
                {tabs.map((tab) => (
                  <Tabs.Tab
                    key={tab.id}
                    value={tab.id}
                    leftSection={
                      tab.type === "archenemy" ? (
                        <IconSword size={16} />
                      ) : tab.type === "dungeons" ? (
                        <IconMapSearch size={16} />
                      ) : (
                        <IconHeart size={16} />
                      )
                    }
                    rightSection={
                      <Box
                        component="span"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 16,
                          height: 16,
                          cursor: "pointer",
                          opacity: 0.6,
                          transition: "opacity 0.15s ease",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseTab(tab.id);
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.opacity =
                            "0.6";
                        }}
                      >
                        <IconX size={12} />
                      </Box>
                    }
                  >
                    {tab.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>

              {tabs.map((tab) => (
                <Tabs.Panel key={tab.id} value={tab.id} pt="md">
                  {/* Only render content if this is the active tab */}
                  {activeTabId === tab.id && renderTabContent(tab.id)}
                </Tabs.Panel>
              ))}
            </Tabs>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
