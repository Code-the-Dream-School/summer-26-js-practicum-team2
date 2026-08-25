import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LastLessonRedirect from "./LastLessonRedirect";

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    getLastLesson: vi.fn(),
  },
}));

vi.mock("../services/api", () => ({
  getLastLesson: mockApi.getLastLesson,
}));

describe("last lesson redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("redirects to the saved last lesson path when the API returns one", async () => {
    mockApi.getLastLesson.mockResolvedValue({ lastLessonPath: "/learn/cashFlow/1.2" });

    render(
      <MemoryRouter initialEntries={["/learn/last-lesson"]}>
        <Routes>
          <Route path="/learn/last-lesson" element={<LastLessonRedirect />} />
          <Route path="/learn/cashFlow/1.2" element={<div>Resume lesson</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Resume lesson")).toBeInTheDocument();
    });

    expect(localStorage.getItem("lastLessonPath")).toBe("/learn/cashFlow/1.2");
  });

  it("falls back to the cached path when the API request fails", async () => {
    localStorage.setItem("lastLessonPath", "/learn/cashFlow/3.1");
    mockApi.getLastLesson.mockRejectedValue(new Error("Failed to fetch"));

    render(
      <MemoryRouter initialEntries={["/learn/last-lesson"]}>
        <Routes>
          <Route path="/learn/last-lesson" element={<LastLessonRedirect />} />
          <Route path="/learn/cashFlow/3.1" element={<div>Cached resume</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Cached resume")).toBeInTheDocument();
    });
  });
});
