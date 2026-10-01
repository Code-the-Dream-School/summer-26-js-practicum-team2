import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./HomePage";
import { getPublicLessonModules } from "../services/api";

vi.mock("../context/AuthContext", () => ({
  useAuthContext: () => ({ isAuthenticated: false }),
}));

vi.mock("../services/api", () => ({
  getPublicLessonModules: vi.fn(),
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("links guests to the first installed lesson preview", async () => {
    getPublicLessonModules.mockResolvedValue({
      modules: [{ id: "finance-basics", firstLessonId: "lesson 1" }],
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const previewLink = await screen.findByRole("link", { name: "Explore lessons" });
    expect(previewLink).toHaveAttribute("href", "/learn/finance-basics/lesson%201?sample=true");
  });

  it("disables lesson exploration when the instance has no previewable modules", async () => {
    getPublicLessonModules.mockResolvedValue({ modules: [] });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "No lessons available" })).toBeDisabled();
    });
  });
});
