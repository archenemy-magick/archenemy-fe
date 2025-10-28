import { Group, Burger, ActionIcon, Box } from "@mantine/core";
import { IconBrandMantine, IconMoon, IconSun } from "@tabler/icons-react";
import classes from "./MobileNavbar.module.css";
import Link from "next/link";
import { LinkButton } from "../common";
import clsx from "clsx";
import { UserMenu } from "~/components/UserMenu";
import { useSelector } from "react-redux";
import { RootState } from "~/store/configureStore";

const Header = ({
  opened,
  toggleMobileMenuOpen,
  toggleColorScheme,
}: {
  opened: boolean;
  toggleMobileMenuOpen: () => void;
  toggleColorScheme: () => void;
}) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  return (
    <Group h="100%" px="md">
      <Burger
        opened={opened}
        onClick={toggleMobileMenuOpen}
        hiddenFrom="sm"
        size="sm"
        data-testid="mobile-burger"
      />
      <Group
        justify="space-between"
        style={{ flex: 1 }}
        data-testid="desktop-header-group"
      >
        <Box visibleFrom="sm">
          <UserMenu />
        </Box>
        <Group ml="xl" visibleFrom="sm" gap={0}>
          <LinkButton
            variant="transparent"
            className={classes.control}
            href="/"
          >
            Home
          </LinkButton>
          {/* <LinkButton
            variant="transparent"
            className={classes.control}
            href="/articles"
          >
            Articles
          </LinkButton> */}
          <LinkButton
            variant="transparent"
            className={classes.control}
            href="/game/archenemy"
          >
            Archenemy Game
          </LinkButton>
          <LinkButton
            variant="transparent"
            className={classes.control}
            href="/popular-cards"
          >
            Popular Cards
          </LinkButton>
          <LinkButton
            variant="transparent"
            className={classes.control}
            href="/decks"
          >
            Decks
          </LinkButton>
        </Group>
      </Group>
      <ActionIcon
        onClick={toggleColorScheme}
        variant="default"
        size="lg"
        radius="md"
        aria-label="Toggle color scheme"
        data-testid="toggle-color-scheme"
      >
        <IconSun className={clsx(classes.icon, classes.light)} stroke={1.5} />
        <IconMoon className={clsx(classes.icon, classes.dark)} stroke={1.5} />
      </ActionIcon>
    </Group>
  );
};

export default Header;
