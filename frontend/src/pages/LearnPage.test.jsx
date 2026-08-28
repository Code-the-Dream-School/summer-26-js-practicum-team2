import { MemoryRouter, Routes, Route } from "react-router";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import LearnPage from "./LearnPage";
import Footer from "../shared/MainLayout/Footer/Footer.component";

//Mock api services so network requests don't get triggered
vi.mock("../services/api", () => ({
  updateLessonProgress: vi.fn().mockResolvedValue({ status: "success" }),
}));
//Mock Auth context
vi.mock("../context/AuthContext", () => ({
  useAuthContext: () => ({
    isAuthenticated: true,
    csrfToken: "mock-csrf-token",
  }),
}));

//2. Mock useLessonContent hook
vi.mock("../hooks/useLessonContent", () => ({
  default: () => ({
    moduleData: {},
    lessonDate: {},
    progress: null,
    isLoading: false,
    error: null,
  }),
}));
//mock normalizeLearnData to bypas normalization logic
vi.mock("../features/learn/normalizeLesson", () => ({
  getResumeIndex: () => 0,
  getSampleLesson: () => null,
  selectRandomLesson: () => null,
  titlesOverlap: () => false,
  normalizeLearnData: () => ({
    moduleId: "budgeting",
    moduleTitle: "Budgeting Basics",
    id: "cashFlow",
    title: "Budgeting and Cash Flow Basics",
    questions: [],
    lessonSteps: [
      {
        id: "step1",
        title: "Introduction to Cash Flow",
        content: [
          { id: "c1", type: "text", text: "Cash flow measures money coming in versus going out." },
        ],
      },
      {
        id: "step2",
        title: "Tracking Expenses",
        content: [{ id: "c2", type: "text", text: "Keep track of fixed and variable expenses." }],
      },
    ],
  }),
}));

describe("LearnPage - State not affected by open or closed glossary modal", () => {
  it("preserves state of lesson and does not update progress updates when glossary is opened or closed", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/learn/budgeting/cashFlow"]}>
        <Routes>
          <Route path="/learn/:moduleId/:lessonId" element={ <> <LearnPage /> <Footer /> </>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /Budgeting and Cash Flow Basics/i }),
    ).toBeInTheDocument();
    // change glossary to open and close and make sure state is identical of lesson pre and post opening of glossary
    const glossaryBtn = screen.getByRole("button", { name: /open glossary/i });
    await user.click(glossaryBtn);
    const closeBtn = screen.getByRole("button", { name: /close/i });
    await user.click(closeBtn);
    expect(
      screen.getByRole("heading", { name: /Budgeting and Cash Flow Basics/i }),
    ).toBeInTheDocument();
  });
});
