import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LearnPage from "./LearnPage";
import useLessonContent from "../hooks/useLessonContent";

const mockAuth = {
  isAuthenticated: false,
  csrfToken: null,
};

// Mock authentication so these tests can control whether the learner has a session.
vi.mock("../context/AuthContext", () => ({
  useAuthContext: () => mockAuth,
}));

// Mock the lesson hook so the page does not need to load real lesson data.
vi.mock("../hooks/useLessonContent", () => ({
  default: vi.fn(),
}));

describe("learn page", () => {
  beforeEach(() => {
    // Reset the mocks and start each test as an unauthenticated visitor.
    vi.clearAllMocks();
    mockAuth.isAuthenticated = false;
    mockAuth.csrfToken = null;
  });

  it("shows a sample lesson preview to visitors without a session", () => {
    // Return an empty lesson state since the sample preview does not need authenticated lesson data.
    useLessonContent.mockReturnValue({
      moduleData: null,
      lessonData: null,
      progress: null,
      isLoading: false,
      error: "",
    });

    // Use the sample query parameter so the lesson can be viewed without logging in.
    render(
      <MemoryRouter initialEntries={["/learn/cashFlow/1.1?sample=true"]}>
        <Routes>
          <Route path="/learn/:moduleId/:lessonId" element={<LearnPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("This is a sample of a lesson.")).toBeInTheDocument();
  });

  it("redirects unauthenticated visitors to the login page before a lesson loads", async () => {
    // Return an empty lesson state while the visitor has no authenticated session.
    useLessonContent.mockReturnValue({
      moduleData: null,
      lessonData: null,
      progress: null,
      isLoading: false,
      error: "",
    });

    // Start on a normal lesson route without the sample preview option.
    render(
      <MemoryRouter initialEntries={["/learn/cashFlow/1.1"]}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/learn/:moduleId/:lessonId" element={<LearnPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Visitors without a session should be sent to login instead of seeing the lesson.
    await waitFor(() => {
      expect(screen.getByText("Login page")).toBeInTheDocument();
    });
  });
});