import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import LearnPage from "./LearnPage";
import { ROUTES } from "../app/router/routes";
import { useAuthContext } from "../context/AuthContext";

// Mock auth so each test can control whether the user's session is still loading.
vi.mock("../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// Keep lesson loading out of these tests so they can focus only on refresh and redirect behavior.
vi.mock("../hooks/useLessonContent", () => ({
  default: vi.fn(() => ({
    moduleData: null,
    lessonData: null,
    progress: null,
    isLoading: false,
    error: "",
    refresh: vi.fn(),
  })),
}));

// Render the lesson route along with login so redirects can be checked in one place.
function renderLearnPage() {
  return render(
    <MemoryRouter initialEntries={["/learn/cashFlow/1.1"]}>
      <Routes>
        <Route path={ROUTES.LEARN_LESSON} element={<LearnPage />} />
        <Route path={ROUTES.LOGIN} element={<h1>Login Page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LearnPage refresh behavior", () => {
  it("does not redirect to login while auth is still hydrating from storage", () => {
    // Pretend the page refreshed and auth has not finished restoring the saved session yet.
    useAuthContext.mockReturnValue({
      isAuthenticated: false,
      isHydrating: true,
      csrfToken: null,
    });

    renderLearnPage();

    // The learner should stay on the lesson route while authentication is still being restored.
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });

  it("renders lesson content once hydration confirms the user is authenticated", () => {
    // Pretend hydration finished and confirmed the learner still has a valid session.
    useAuthContext.mockReturnValue({
      isAuthenticated: true,
      isHydrating: false,
      csrfToken: "token",
    });

    renderLearnPage();

    // An authenticated learner should remain on the lesson instead of being sent to login.
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });
});
