"use client";

import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import {
  IconHeart,
  IconMapSearch,
  IconSword,
  //   sad;lfkja;dflkas;dlkjf;aslkdjf;lasdf;lasdf
  // NEED TO UPDATE THIS SO THAT ROUTES DON'T AUTO LINK TO ARCHENEMY, AND WE CAN START WITH NO "TABS" OPENEDx
  //   ad;flkasd;lkjas;dlkjfsdf
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import ArchenemyGame from "../../components/ArchenemyGame";
// import { DungeonGameSelector } from "~/components/DungeonGameSelector";
import DungeonContainer from "~/components/DungeonContainer";

// import { DungeonTracker } from '~/components/game/DungeonTracker';
// import { LifeTracker } from '~/components/game/LifeTracker';

type GameUtility = "archenemy" | "dungeons" | "life-tracker";

interface GameTab {
  id: string;
  type: GameUtility;
  label: string;
  icon: React.ReactNode;
}

const utilityConfig: Record<
  GameUtility,
  { label: string; icon: React.ReactNode }
> = {
  archenemy: { label: "Archenemy", icon: <IconSword size={16} /> },
  dungeons: { label: "Dungeons", icon: <IconMapSearch size={16} /> },
  "life-tracker": { label: "Life Tracker", icon: <IconHeart size={16} /> },
};

export default function GamePage() {
  const [tabs, setTabs] = useState<GameTab[]>([
    {
      id: "1",
      type: "archenemy",
      label: "Archenemy",
      icon: <IconSword size={16} />,
    },
  ]);
  const [activeTab, setActiveTab] = useState<string>("1");
  const [nextId, setNextId] = useState(2);

  const addTab = (type: GameUtility) => {
    const config = utilityConfig[type];
    const newTab: GameTab = {
      id: String(nextId),
      type,
      label: config.label,
      icon: config.icon,
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
    setNextId(nextId + 1);
  };

  const removeTab = (tabId: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    // If we removed the active tab, switch to the last remaining tab
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1].id);
    }
  };

  const renderTabContent = (tab: GameTab) => {
    switch (tab.type) {
      case "archenemy":
        return (
          <Box p="md">
            <ArchenemyGame />
          </Box>
        );
      case "dungeons":
        return (
          <Box p="md">
            {/* <DungeonGameSelector /> */}
            {/* <DungeonGameInstancePage /> */}
            <DungeonContainer />
          </Box>
        );
      case "life-tracker":
        return (
          <Box p="md">
            {/* Replace this with your LifeTracker component when you build it */}
            <Text>Life Tracker Component Goes Here</Text>
            <Text size="sm" c="dimmed" mt="xs">
              This will be your new life tracker utility
            </Text>
          </Box>
        );
      default:
        return null;
    }
  };

  // Check which utilities are already open
  const openUtilities = new Set(tabs.map((tab) => tab.type));

  return (
    <Container size="100%" p={0} fluid>
      <Stack gap={0}>
        <Box
          p="md"
          style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
        >
          <Group justify="space-between">
            <div>
              <Title order={2}>Game Utilities</Title>
              <Text c="dimmed" size="sm">
                Open multiple game utilities in tabs
              </Text>
            </div>
            <Group gap="xs">
              {!openUtilities.has("archenemy") && (
                <Button
                  variant="light"
                  size="lg"
                  onClick={() => addTab("archenemy")}
                  title="Add Archenemy"
                >
                  <IconSword size={18} /> &nbsp; Archenemy
                </Button>
              )}
              {!openUtilities.has("dungeons") && (
                <Button
                  variant="light"
                  size="lg"
                  onClick={() => addTab("dungeons")}
                  title="Add Dungeon Tracker"
                >
                  <IconMapSearch size={18} /> &nbsp; Dungeons
                </Button>
              )}
              {/* {!openUtilities.has("life-tracker") && (
                <Button
                  variant="light"
                  size="lg"
                  onClick={() => addTab("life-tracker")}
                  title="Add Life Tracker"
                >
                  <IconHeart size={18} />
                </Button>
              )} */}
            </Group>
          </Group>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(value) => value && setActiveTab(value)}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <Tabs.List>
            {tabs.map((tab) => (
              <Tabs.Tab
                key={tab.id}
                value={tab.id}
                leftSection={tab.icon}
                rightSection={
                  tabs.length > 1 ? (
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTab(tab.id);
                      }}
                      title="Close tab"
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  ) : null
                }
              >
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {tabs.map((tab) => (
            <Tabs.Panel
              key={tab.id}
              value={tab.id}
              style={{ flex: 1, overflow: "auto" }}
            >
              {renderTabContent(tab)}
            </Tabs.Panel>
          ))}
        </Tabs>
      </Stack>
    </Container>
  );
}
