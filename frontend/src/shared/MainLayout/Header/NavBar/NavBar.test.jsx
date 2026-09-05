import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import NavBar from "./NavBar.component";

describe("NavBar", () => {
  it("opens the signed-out mobile menu and closes it after link activation", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    );

    // The mobile menu should start closed for a signed-out visitor
    const toggle = screen.getByRole("button", { name: "Open navigation menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-controls");
    expect(screen.getByRole("button", { name: "Close navigation menu" })).toBeInTheDocument();

    // Clicking a mobile navigation link should close the menu again
    const loginLinks = screen.getAllByRole("link", { name: "Login" });
    await user.click(loginLinks.at(-1));

    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("supports keyboard activation for the menu toggle", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <NavBar signedIn />
      </MemoryRouter>,
    );

    // Keyboard users should be able to open the menu with Enter
    const toggle = screen.getByRole("button", { name: "Open navigation menu" });
    toggle.focus();
    await user.keyboard("{Enter}");

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
