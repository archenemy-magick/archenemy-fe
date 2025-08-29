import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import SchemeCard from "./SchemeCard";
import { render, mockScryfallScheme } from "../../../testUtils";
import type { SchemeCardProps } from "./SchemeCard";

const renderCard = ({
  card = mockScryfallScheme,
  buttonText,
  onButtonClick,
}: SchemeCardProps) => {
  render(
    <SchemeCard
      card={card}
      buttonText={buttonText}
      onButtonClick={onButtonClick}
    />
  );
};
describe("SchemeCard", () => {
  it("renders the card image if the image is present", () => {
    renderCard({ card: mockScryfallScheme });
    const imageAlt = screen.getByAltText(mockScryfallScheme.name);
    expect(imageAlt).toBeInTheDocument();
  });

  it("does not render the card image if the card has no image_uris", () => {
    renderCard({
      card: {
        ...mockScryfallScheme,
        image_uris: undefined,
      },
    });
    const imageAlt = screen.queryByAltText(mockScryfallScheme.name);
    expect(imageAlt).not.toBeInTheDocument();
  });

  it("renders a button if button text and handler are provided", () => {
    renderCard({
      buttonText: "Click Me",
      onButtonClick: jest.fn(),
      card: mockScryfallScheme,
    });

    const buttonText = screen.getByText("Click Me");
    expect(buttonText).toBeInTheDocument();
  });
});
