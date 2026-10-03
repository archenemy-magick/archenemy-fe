import {
  fireEvent,
  render as testingLibraryRender,
  screen,
  within,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { StatsDashboard } from "~/components/StatsDashboard";
import { DEFAULT_STATS_FILTERS, type GameStatsFilters } from "~/lib/gameStats";
import type { RecordedGame, RecordedGamePlayer } from "~/types/recordedGame";

function seat(
  overrides: Partial<RecordedGamePlayer> & Pick<RecordedGamePlayer, "id">
): RecordedGamePlayer {
  return {
    game_id: "g",
    user_id: null,
    display_name: "Sam",
    is_recorder: false,
    commander_name: "Krenko, Mob Boss",
    deck_name: null,
    colors: ["R"],
    is_winner: false,
    seat_order: 1,
    ending_life: 0,
    created_at: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

function game(id: string, iWon: boolean, myCommander: string): RecordedGame {
  return {
    id,
    recorded_by: "me",
    played_at: "2026-09-01T12:00:00.000Z",
    format: "commander",
    ended_on_turn: 9,
    win_condition: "combat",
    notes: null,
    created_at: "2026-09-01T12:00:00.000Z",
    updated_at: "2026-09-01T12:00:00.000Z",
    players: [
      seat({
        id: `${id}-me`,
        display_name: "Me",
        is_recorder: true,
        commander_name: myCommander,
        colors: ["U", "B"],
        is_winner: iWon,
        seat_order: 0,
      }),
      seat({ id: `${id}-sam`, is_winner: !iWon }),
    ],
  };
}

// The dashboard has no Redux dependency, so skip the shared store wrapper.
function render(ui: React.ReactElement) {
  return testingLibraryRender(<MantineProvider>{ui}</MantineProvider>);
}

const games = [
  game("g1", true, "Yuriko, the Tiger's Shadow"),
  game("g2", true, "Yuriko, the Tiger's Shadow"),
  game("g3", false, "Atraxa, Praetors' Voice"),
];

describe("StatsDashboard", () => {
  it("shows an empty state with no games", () => {
    render(
      <StatsDashboard
        games={[]}
        filters={DEFAULT_STATS_FILTERS}
        onFiltersChange={jest.fn()}
      />
    );
    expect(screen.getByText("No games yet")).toBeInTheDocument();
  });

  it("renders headline stats, head-to-head, and decks", () => {
    render(
      <StatsDashboard
        games={games}
        filters={DEFAULT_STATS_FILTERS}
        onFiltersChange={jest.fn()}
      />
    );

    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(screen.getByText("2W / 1L / 0D")).toBeInTheDocument();
    expect(screen.getByText("Head-to-head")).toBeInTheDocument();
    expect(screen.getByText("Usually Krenko, Mob Boss")).toBeInTheDocument();
    expect(screen.getByText("Yuriko, the Tiger's Shadow")).toBeInTheDocument();
  });

  it("sorts the deck table when a column header is clicked", () => {
    render(
      <StatsDashboard
        games={games}
        filters={DEFAULT_STATS_FILTERS}
        onFiltersChange={jest.fn()}
      />
    );

    const deckTable = screen
      .getByText("Winningest decks")
      .closest("div")!
      .querySelector("table")!;
    const firstCommander = () =>
      within(deckTable).getAllByRole("row")[1].textContent;

    expect(firstCommander()).toContain("Yuriko");
    fireEvent.click(screen.getByLabelText("Sort by Commander"));
    expect(firstCommander()).toContain("Atraxa");
  });

  it("filters to a deck when its row is clicked", () => {
    const onFiltersChange = jest.fn<void, [GameStatsFilters]>();
    render(
      <StatsDashboard
        games={games}
        filters={DEFAULT_STATS_FILTERS}
        onFiltersChange={onFiltersChange}
      />
    );

    fireEvent.click(screen.getByText("Atraxa, Praetors' Voice"));
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ deckKey: expect.stringContaining("atraxa") })
    );
  });
});
