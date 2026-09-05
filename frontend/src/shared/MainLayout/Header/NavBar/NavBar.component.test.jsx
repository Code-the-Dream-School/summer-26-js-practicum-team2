import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import NavBar from "./NavBar.component";

const renderNavBar = (avatarLabel) =>
  render(
    <MemoryRouter>
      <NavBar signedIn avatarLabel={avatarLabel} />
    </MemoryRouter>,
  );

describe("NavBar", () => {
  it("uses the authenticated user's avatar label after hydration", () => {
    const { rerender } = renderNavBar("A");

    expect(screen.getByRole("link", { name: "A" })).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <NavBar signedIn avatarLabel="M" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "M" })).toBeInTheDocument();
  });

  it("renders a saved avatar URL and falls back to initials when the image fails", () => {
    render(
      <MemoryRouter>
        <NavBar signedIn avatarLabel="M" avatarUrl="https://example.com/maya.png" />
      </MemoryRouter>,
    );

    const image = screen.getByAltText("M avatar");
    expect(image).toHaveAttribute("src", "https://example.com/maya.png");

    fireEvent.error(image);

    expect(screen.getByRole("link", { name: "M" })).toBeInTheDocument();
  });
});
