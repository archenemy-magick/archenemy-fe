"use client";

import {
  AppShell,
  Stack,
  useMantineColorScheme,
  useComputedColorScheme,
  NavLink,
  Divider,
  Group,
  Avatar,
  Text,
  Button,
  Box,
} from "@mantine/core";
import {
  IconHome,
  IconCards,
  IconTrophy,
  IconWand,
  IconUser,
  IconLogout,
  IconLogin,
  IconUserPlus,
  IconWorld,
  IconPlayerPlay,
} from "@tabler/icons-react";
import Header from "../Header";
import { useDisclosure } from "@mantine/hooks";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "~/store/configureStore";
import { signOut } from "~/store/reducers";

const AppShellLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const [opened, { toggle: toggleMobileMenuOpen, close }] = useDisclosure();
  const { setColorScheme } = useMantineColorScheme({ keepTransitions: true });
  const computedColorScheme = useComputedColorScheme("light");

  const { username, email, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const handleToggleColorScheme = () => {
    setColorScheme(computedColorScheme === "dark" ? "light" : "dark");
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    close(); // Close menu after navigation
  };

  const handleSignOut = async () => {
    await dispatch(signOut());
    router.push("/");
    close();
  };

  const displayName = username || email?.split("@")[0] || "User";

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
      <AppShell.Header withBorder>
        <Header
          opened={opened}
          toggleMobileMenuOpen={toggleMobileMenuOpen}
          toggleColorScheme={handleToggleColorScheme}
        />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs" style={{ height: "100%" }}>
          {/* User Section */}
          {isAuthenticated ? (
            <Box
              p="md"
              style={{
                borderRadius: "var(--mantine-radius-md)",
                background: "var(--mantine-color-dark-6)",
              }}
            >
              <Group>
                <Avatar radius="xl" color="violet">
                  {displayName[0].toUpperCase()}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={600}>
                    {displayName}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {email}
                  </Text>
                </div>
              </Group>
            </Box>
          ) : (
            <Stack gap="xs">
              <Button
                leftSection={<IconLogin size={16} />}
                onClick={() => handleNavigation("/signin")}
                variant="light"
                fullWidth
              >
                Sign In
              </Button>
              <Button
                leftSection={<IconUserPlus size={16} />}
                onClick={() => handleNavigation("/signup")}
                variant="gradient"
                gradient={{ from: "violet", to: "grape" }}
                fullWidth
              >
                Sign Up
              </Button>
            </Stack>
          )}

          <Divider my="sm" />

          {/* Main Navigation */}
          <Stack gap={4} style={{ flex: 1 }}>
            <NavLink
              label="Game"
              leftSection={<IconPlayerPlay size={20} />}
              onClick={() => handleNavigation("/game/archenemy")}
              active={pathname === "/game/archenemy"}
              variant="subtle"
            />

            <NavLink
              label="Popular Cards"
              leftSection={<IconTrophy size={20} />}
              onClick={() => handleNavigation("/popular-cards")}
              active={pathname === "/popular-cards"}
              variant="subtle"
            />

            <NavLink
              label="Deck Builder"
              leftSection={<IconWand size={20} />}
              onClick={() => handleNavigation("/decks/builder")}
              active={pathname === "/decks/builder"}
              variant="subtle"
            />

            <NavLink
              label="My Decks"
              leftSection={<IconCards size={20} />}
              onClick={() => handleNavigation("/decks")}
              active={pathname === "/decks"}
              variant="subtle"
            />

            <NavLink
              label="Public Decks"
              leftSection={<IconWorld size={20} />}
              onClick={() => handleNavigation("/decks/public")}
              active={pathname === "/decks/public"}
              variant="subtle"
            />
          </Stack>

          {/* Bottom Section */}
          {isAuthenticated && (
            <>
              <Divider my="sm" />

              <Stack gap={4}>
                <NavLink
                  label="Profile"
                  leftSection={<IconUser size={20} />}
                  onClick={() => handleNavigation("/profile")}
                  active={pathname === "/profile"}
                  variant="subtle"
                />

                <NavLink
                  label="Sign Out"
                  leftSection={<IconLogout size={20} />}
                  onClick={handleSignOut}
                  variant="subtle"
                  color="red"
                />
              </Stack>
            </>
          )}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main
        style={{
          backgroundColor:
            computedColorScheme === "dark" ? "#141414" : "#ffffff",
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
};

export default AppShellLayout;
