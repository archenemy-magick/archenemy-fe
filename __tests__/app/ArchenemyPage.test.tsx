import { render as testingLibraryRender, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import ArchenemyPage from "~/app/archenemy/page";

const render = (ui: React.ReactElement) =>
  testingLibraryRender(<MantineProvider>{ui}</MantineProvider>);

describe("ArchenemyPage", () => {
  it("links each section box to its page", () => {
    render(<ArchenemyPage />);

    const href = (title: string) =>
      screen.getByText(title).closest("a")?.getAttribute("href");

    expect(href("Popular Cards")).toBe("/archenemy/popular-cards");
    expect(href("Community Archenemy Decks")).toBe("/archenemy/decks/public");
    expect(href("My Archenemy Decks")).toBe("/archenemy/decks");
  });

  it("keeps shortcuts to play and build", () => {
    render(<ArchenemyPage />);

    expect(screen.getByText("Play Archenemy").closest("a")).toHaveAttribute(
      "href",
      "/game?utility=archenemy"
    );
    expect(screen.getByText("Build a deck").closest("a")).toHaveAttribute(
      "href",
      "/archenemy/decks/builder"
    );
  });
});
