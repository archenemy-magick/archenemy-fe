"use client";

import {
  AppShell,
  Stack,
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";

import Header from "../Header";
import { useDisclosure } from "@mantine/hooks";
import classes from "./MobileNavbar.module.css";
import LinkButton from "../common/LinkButton";
import { useEffect, useState } from "react";

const AppShellLayout = ({ children }: { children: React.ReactNode }) => {
  const [opened, { toggle: toggleMobileMenuOpen }] = useDisclosure();
  const { setColorScheme } = useMantineColorScheme({ keepTransitions: true });
  const computedColorScheme = useComputedColorScheme("light");
  const [backgroundColor, setBackgroundColor] = useState("#171717");

  console.log("computedColorScheme", computedColorScheme);

  const handleToggleColorScheme = () => {
    setColorScheme(computedColorScheme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    setBackgroundColor(computedColorScheme === "dark" ? "#171717" : "#ffffff");
  }, [computedColorScheme]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding={0}
    >
      <AppShell.Header bd="red" withBorder>
        <Header
          opened={opened}
          toggleMobileMenuOpen={toggleMobileMenuOpen}
          toggleColorScheme={handleToggleColorScheme}
        />
      </AppShell.Header>

      <AppShell.Navbar py="md" px={4}>
        <Stack justify="center" align="stretch" mx="md">
          <LinkButton href="/" className={classes.control}>
            Home
          </LinkButton>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ backgroundColor }}>{children}</AppShell.Main>
    </AppShell>
  );
};

export default AppShellLayout;
