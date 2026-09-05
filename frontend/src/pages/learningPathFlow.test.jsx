import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LearningPathPage from "./LearningPathPage";
import * as api from "../services/api";

const mockAuth = { isAuthenticated: true };

// Mock authentication so the page always starts with a signed-in learner.
vi.mock("../context/AuthContext", () => ({
  useAuthContext: () => mockAuth,
}));

// Mock the lesson APIs so these tests can control the progress and lesson data.
vi.mock("../services/api", () => ({
  getLesson: vi.fn(),
  getLessonProgress: vi.fn(),
}));

// Use one small module so the tests can focus on step status and navigation.
const moduleData = {
  id: "cashFlow",
  title: "Cash Flow",
  lessons: [
    {
      id: "1.1",
      title: "Budget basics",
      learningGoal: "Understand budgets.",
      microLessons: [
        {
          id: "1.1.1",
          title: "Start here",
          microLessonContent: [{ type: "paragraph", text: "Begin with a plan." }],
        },
        {
          id: "1.1.2",
          title: "Keep going",
          microLessonContent: [{ type: "paragraph", text: "Track your expenses." }],
        },
        {
          id: "1.1.3",
          title: "Finish strong",
          microLessonContent: [{ type: "paragraph", text: "Review your progress." }],
        },
      ],
    },
  ],
};

describe("learning path page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock scrollIntoView since it is not available in the test browser environment.
    HTMLElement.prototype.scrollIntoView = vi.fn();

    // Start with the first step completed and the second step as the learner's current position.
    api.getLessonProgress.mockResolvedValue({
      currentModule: "cashFlow",
      currentLessonId: "1.1",
      currentMicroLessonId: "1.1.2",
      completedMicroLessons: ["1.1.1"],
      isModuleCompleted: false,
    });

    // Return the lesson structure without making a real API request.
    api.getLesson.mockResolvedValue({ moduleData });
  });

  it("loads progress and marks completed, current, and locked learning steps", async () => {
    render(
      <MemoryRouter initialEntries={["/learn"]}>
        <Routes>
          <Route path="/learn" element={<LearningPathPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Wait for the learning path to finish loading before checking step states.
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /1\.1\.1: Start here/i })).toBeInTheDocument();
    });

    // Completed and current steps should be available, while future steps stay locked.
    expect(screen.getByRole("button", { name: /1\.1\.1: Start here/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /1\.1\.2: Keep going/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /1\.1\.3: Finish strong/i })).toBeDisabled();
    expect(screen.getByText("Tap a step to jump straight into the lesson.")).toBeInTheDocument();
  });

  it("navigates to the selected lesson", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/learn"]}>
        <Routes>
          <Route path="/learn" element={<LearningPathPage />} />
          <Route path="/learn/:moduleId/:lessonId" element={<div>Selected lesson</div>} />
        </Routes>
      </MemoryRouter>,
    );

    // Choose the learner's current step from the path.
    const currentNode = await screen.findByRole("button", { name: /1\.1\.2: Keep going/i });
    await user.click(currentNode);

    // Clicking an available step should open its lesson and use the expected API data.
    expect(screen.getByText("Selected lesson")).toBeInTheDocument();
    expect(api.getLessonProgress).toHaveBeenCalledWith("cashFlow");
    expect(api.getLesson).toHaveBeenCalledWith("cashFlow", "1.1");
  });
});
