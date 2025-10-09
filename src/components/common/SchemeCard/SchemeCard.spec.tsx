import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import SchemeCard from "./SchemeCard";
import { render, mockCustomScheme } from "../../../testUtils";
import type { SchemeCardProps } from "./SchemeCard";

const renderCard = ({
  card = mockCustomScheme,
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
    renderCard({ card: mockCustomScheme });
    const imageAlt = screen.getByAltText(mockCustomScheme.name);
    expect(imageAlt).toBeInTheDocument();
  });

  // it("does not render the card image if the card has no normal_image", () => {
  //   renderCard({
  //     card: {
  //       ...mockCustomScheme,
  //       normal_image: undefined,
  //     },
  //   });
  //   const imageAlt = screen.queryByAltText(mockCustomScheme.name);
  //   expect(imageAlt).not.toBeInTheDocument();
  // });

  it("renders a button if button text and handler are provided", () => {
    renderCard({
      buttonText: "Click Me",
      onButtonClick: jest.fn(),
      card: mockCustomScheme,
    });

    const buttonText = screen.getByText("Click Me");
    expect(buttonText).toBeInTheDocument();
  });
});
