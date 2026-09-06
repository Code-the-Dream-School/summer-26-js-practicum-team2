import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LearnPage from "./LearnPage";
import { ROUTES } from "../app/router/routes";
import { useAuthContext } from "../context/AuthContext";
import useLessonContent from "../hooks/useLessonContent";
import * as api from "../services/api";
import MainLayout from "../shared/MainLayout/MainLayout.component";

vi.mock("../services/api", () => ({
  restartLessonProgress: vi.fn(),
  startQuiz: vi.fn(),
  submitQuiz: vi.fn(),
  updateLessonProgress: vi.fn(),
}));

// Mock auth so each test can control whether the user's session is still loading.
vi.mock("../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// Keep lesson loading out of these tests so they can focus only on refresh and redirect behavior.
vi.mock("../hooks/useLessonContent", () => ({
  default: vi.fn(),
}));

vi.mock("../shared/MainLayout/Header/Header.component", () => ({ default: () => <header /> }));
vi.mock("../features/legal/ConsentBanner/ConsentBanner.component", () => ({ default: () => null }));

// Render the lesson route along with login so redirects can be checked in one place.
function renderLearnPage() {
  useLessonContent.mockReturnValue({
    moduleData: null,
    lessonData: null,
    progress: null,
    isLoading: false,
    error: "",
    refresh: vi.fn(),
  });
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

const moduleData = {
  id: "module-two",
  title: "Module Two",
  glossary: [{ id: "module-term", term: "Module term", definition: "Only in this module." }],
  worksCited: [
    {
      id: "module-source",
      title: "Module source",
      citation: "Source for module two.",
      url: "https://example.test/module-source",
    },
  ],
  lessons: [{ id: "lesson-one" }],
};

const lessonData = {
  id: "lesson-one",
  title: "Lesson One",
  learningGoal: "Learn the basics.",
  passingScore: 70,
  microLessons: [
    {
      id: "step-one",
      title: "First step",
      microLessonContent: [{ id: "first", type: "paragraph", text: "First lesson step." }],
    },
    {
      id: "step-two",
      title: "Second step",
      microLessonContent: [{ id: "second", type: "paragraph", text: "Second lesson step." }],
    },
  ],
};

function renderLesson({ omitGlossary = false, ...moduleOverrides } = {}) {
  const activeModule = { ...moduleData, ...moduleOverrides };
  if (omitGlossary) delete activeModule.glossary;

  useLessonContent.mockReturnValue({
    moduleData: activeModule,
    lessonData,
    progress: { currentMicroLessonId: "step-two", currentChunkIndex: 0 },
    isLoading: false,
    error: "",
  });

  return render(
    <MemoryRouter initialEntries={["/learn/module-two/lesson-one"]}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/learn/:moduleId/:lessonId" element={<LearnPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("LearnPage glossary integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthContext.mockReturnValue({
      isAuthenticated: true,
      isHydrating: false,
      csrfToken: "csrf-token",
      user: { name: "Test learner" },
      logout: vi.fn(),
    });
    api.updateLessonProgress.mockResolvedValue({});
  });

  it("keeps the learner on the same step without creating progress or quiz side effects", async () => {
    const user = userEvent.setup();
    renderLesson();

    await waitFor(() =>
      expect(api.updateLessonProgress).toHaveBeenCalledWith({
        moduleId: "module-two",
        lessonId: "lesson-one",
        microLessonId: "step-two",
        currentChunkIndex: 0,
        csrfToken: "csrf-token",
      }),
    );
    api.updateLessonProgress.mockClear();

    expect(screen.getByRole("heading", { name: "Second step" })).toBeInTheDocument();
    const opener = screen.getByRole("button", { name: "Open glossary and references" });
    await user.click(opener);
    expect(screen.getByText("Module term")).toBeInTheDocument();
    expect(screen.getByText("Only in this module.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Works Cited" }));
    expect(screen.getByText("Module source")).toBeInTheDocument();

    const dialog = screen.getByRole("dialog", { name: "Glossary and References" });
    fireEvent(dialog, new Event("cancel", { cancelable: true }));

    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    expect(opener).toHaveFocus();
    expect(screen.getByRole("heading", { name: "Second step" })).toBeInTheDocument();
    expect(api.updateLessonProgress).not.toHaveBeenCalled();
    expect(api.startQuiz).not.toHaveBeenCalled();
    expect(api.submitQuiz).not.toHaveBeenCalled();
  });

  it.each([{ omitGlossary: true }, { glossary: [] }])(
    "shows the empty state when the active module has no glossary data",
    async (moduleOverrides) => {
      const user = userEvent.setup();
      renderLesson(moduleOverrides);

      await waitFor(() => expect(api.updateLessonProgress).toHaveBeenCalled());
      await user.click(screen.getByRole("button", { name: "Open glossary and references" }));

      expect(screen.getByText("No glossary terms available")).toBeInTheDocument();
      expect(screen.queryByText("Module term")).not.toBeInTheDocument();
    },
  );
});
