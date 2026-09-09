import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { describe, expect, it, vi } from "vitest";
import MainLayout from "./MainLayout.component";

// Mock auth so the layout renders without depending on a real user session.
vi.mock("../../context/AuthContext", () => ({
  useAuthContext: () => ({ isAuthenticated: false, user: null, logout: vi.fn() }),
}));

describe("MainLayout", () => {
  it("provides a skip link targeting the main content", () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("renders the profile route content inside the layout", () => {
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<div data-testid="profile">Profile</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("profile")).toBeInTheDocument();
  });
});
