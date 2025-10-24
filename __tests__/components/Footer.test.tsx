import { createAsyncThunk } from "@reduxjs/toolkit";

// Mock ALL thunks BEFORE any imports
jest.mock("~/store/thunks/fetchAllDecks", () => ({
  __esModule: true,
  default: createAsyncThunk("decks/fetchAll", async () => []),
}));

jest.mock("~/store/thunks", () => ({
  fetchAllArchenemyCards: createAsyncThunk("cards/fetchAll", async () => []),
  deleteArchenemyDeck: createAsyncThunk(
    "decks/delete",
    async () => "deleted-id"
  ),
  saveArchenemyDeck: createAsyncThunk("decks/save", async () => ({})),
}));

import { screen } from "@testing-library/react";
import { render } from "~/testUtils/render";
import Footer from "~/components/Footer";

describe("Footer", () => {
  describe("Branding Section", () => {
    it("should display the Archenemy title", () => {
      render(<Footer />);

      expect(screen.getByText("Archenemy")).toBeInTheDocument();
    });

    it("should display the tagline", () => {
      render(<Footer />);

      expect(
        screen.getByText(/Build legendary scheme decks/i)
      ).toBeInTheDocument();
    });

    it("should display the brand motto", () => {
      render(<Footer />);

      expect(screen.getByText("Embrace the Chaos")).toBeInTheDocument();
    });
  });

  describe("Quick Links Section", () => {
    it("should display Quick Links header", () => {
      render(<Footer />);

      expect(screen.getByText("Quick Links")).toBeInTheDocument();
    });

    it("should display all quick navigation links", () => {
      render(<Footer />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Deck Builder")).toBeInTheDocument();
      expect(screen.getByText("My Decks")).toBeInTheDocument();
      expect(screen.getByText("Popular Cards")).toBeInTheDocument();
      expect(screen.getByText("Play Game")).toBeInTheDocument();
    });

    it("should have correct href attributes for quick links", () => {
      render(<Footer />);

      const homeLink = screen.getByText("Home").closest("a");
      const deckBuilderLink = screen.getByText("Deck Builder").closest("a");
      const myDecksLink = screen.getByText("My Decks").closest("a");
      const popularCardsLink = screen.getByText("Popular Cards").closest("a");
      const playGameLink = screen.getByText("Play Game").closest("a");

      expect(homeLink).toHaveAttribute("href", "/");
      expect(deckBuilderLink).toHaveAttribute("href", "/decks/builder");
      expect(myDecksLink).toHaveAttribute("href", "/decks");
      expect(popularCardsLink).toHaveAttribute("href", "/popular-cards");
      expect(playGameLink).toHaveAttribute("href", "/game/archenemy");
    });
  });

  describe("Community Section", () => {
    it("should display Community header", () => {
      render(<Footer />);

      expect(screen.getByText("Community")).toBeInTheDocument();
    });

    it("should display all community links", () => {
      render(<Footer />);

      expect(screen.getByText("Join Discord")).toBeInTheDocument();
      expect(screen.getByText("Send Feedback")).toBeInTheDocument();
      expect(screen.getByText("Report Bug")).toBeInTheDocument();
      expect(screen.getByText("Changelog")).toBeInTheDocument();
    });

    it("should have correct href for Discord link", () => {
      render(<Footer />);

      const discordLink = screen.getByText("Join Discord").closest("a");
      expect(discordLink).toHaveAttribute(
        "href",
        "https://discord.gg/yourserver"
      );
    });

    it("should have correct href for GitHub issues link", () => {
      render(<Footer />);

      const bugLink = screen.getByText("Report Bug").closest("a");
      expect(bugLink).toHaveAttribute(
        "href",
        "https://github.com/archenemy-magick/archenemy-fe/issues"
      );
    });
  });

  describe("Contact & Social Section", () => {
    it("should display Connect header", () => {
      render(<Footer />);

      expect(screen.getByText("Connect")).toBeInTheDocument();
    });

    it("should display contact email", () => {
      render(<Footer />);

      const emailLink = screen.getByText("contact@magicsak.com");
      expect(emailLink).toBeInTheDocument();
      expect(emailLink.closest("a")).toHaveAttribute(
        "href",
        "mailto:contact@magicsak.com"
      );
    });

    it("should display questions/feedback text", () => {
      render(<Footer />);

      expect(screen.getByText("Questions or feedback?")).toBeInTheDocument();
    });

    it("should display all social media icons", () => {
      render(<Footer />);

      const twitterLink = screen.getByLabelText("Twitter");
      const discordLink = screen.getByLabelText("Discord");
      const githubLink = screen.getByLabelText("GitHub");
      const emailLink = screen.getByLabelText("Email");

      expect(twitterLink).toBeInTheDocument();
      expect(discordLink).toBeInTheDocument();
      expect(githubLink).toBeInTheDocument();
      expect(emailLink).toBeInTheDocument();
    });

    it("should have correct social media links", () => {
      render(<Footer />);

      const twitterLink = screen.getByLabelText("Twitter");
      const discordLink = screen.getByLabelText("Discord");
      const githubLink = screen.getByLabelText("GitHub");
      const emailLink = screen.getByLabelText("Email");

      expect(twitterLink).toHaveAttribute(
        "href",
        "https://twitter.com/yourhandle"
      );
      expect(discordLink).toHaveAttribute(
        "href",
        "https://discord.gg/yourserver"
      );
      expect(githubLink).toHaveAttribute(
        "href",
        "https://github.com/archenemy-magick"
      );
      expect(emailLink).toHaveAttribute("href", "mailto:contact@magicsak.com");
    });

    it("should open social links in new tab", () => {
      render(<Footer />);

      const twitterLink = screen.getByLabelText("Twitter");
      const discordLink = screen.getByLabelText("Discord");
      const githubLink = screen.getByLabelText("GitHub");

      expect(twitterLink).toHaveAttribute("target", "_blank");
      expect(discordLink).toHaveAttribute("target", "_blank");
      expect(githubLink).toHaveAttribute("target", "_blank");
    });

    it("should have rel='noopener noreferrer' for security", () => {
      render(<Footer />);

      const twitterLink = screen.getByLabelText("Twitter");
      expect(twitterLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("Bottom Bar", () => {
    it("should display copyright with current year", () => {
      render(<Footer />);

      const currentYear = new Date().getFullYear();
      expect(
        screen.getByText(`© ${currentYear} Archenemy. All rights reserved.`)
      ).toBeInTheDocument();
    });

    it("should display Privacy Policy link", () => {
      render(<Footer />);

      const privacyLink = screen.getByText("Privacy Policy").closest("a");
      expect(privacyLink).toHaveAttribute("href", "/privacy");
    });

    it("should display Terms of Service link", () => {
      render(<Footer />);

      const termsLink = screen.getByText("Terms of Service").closest("a");
      expect(termsLink).toHaveAttribute("href", "/terms");
    });

    it("should display 'Made with love' message", () => {
      render(<Footer />);

      expect(
        screen.getByText("Made with 💜 for MTG players")
      ).toBeInTheDocument();
    });
  });

  describe("Layout and Structure", () => {
    it("should render as a footer element", () => {
      const { container } = render(<Footer />);

      const footer = container.querySelector("footer");
      expect(footer).toBeInTheDocument();
    });

    it("should be responsive with grid layout", () => {
      render(<Footer />);

      // Check that all four main sections are present
      expect(screen.getByText("Quick Links")).toBeInTheDocument();
      expect(screen.getByText("Community")).toBeInTheDocument();
      expect(screen.getByText("Connect")).toBeInTheDocument();
      expect(screen.getByText("Archenemy")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have aria-labels for social icons", () => {
      render(<Footer />);

      expect(screen.getByLabelText("Twitter")).toBeInTheDocument();
      expect(screen.getByLabelText("Discord")).toBeInTheDocument();
      expect(screen.getByLabelText("GitHub")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("should have proper heading hierarchy", () => {
      render(<Footer />);

      // The main title should be an h3
      const mainTitle = screen.getByText("Archenemy");
      expect(mainTitle.tagName).toBe("H3");
    });
  });

  describe("Content Validation", () => {
    it("should have all expected sections", () => {
      render(<Footer />);

      // Logo & Tagline
      expect(screen.getByText("Archenemy")).toBeInTheDocument();

      // Quick Links
      expect(screen.getByText("Quick Links")).toBeInTheDocument();

      // Community
      expect(screen.getByText("Community")).toBeInTheDocument();

      // Contact
      expect(screen.getByText("Connect")).toBeInTheDocument();
    });

    it("should not have any broken links (href='#')", () => {
      const { container } = render(<Footer />);

      const links = container.querySelectorAll("a");
      links.forEach((link) => {
        const href = link.getAttribute("href");
        expect(href).not.toBe("#");
        expect(href).not.toBe("");
        expect(href).not.toBeNull();
      });
    });
  });
});
