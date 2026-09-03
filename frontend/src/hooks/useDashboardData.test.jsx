import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDashboardMock } = vi.hoisted(() => ({
  getDashboardMock: vi.fn(),
}));

vi.mock("../services/api", () => ({
  getDashboard: getDashboardMock,
}));

import useDashboardData from "./useDashboardData";

const cachedDashboard = {
  hero: { greeting: "Welcome back, Learner" },
  progress: { completedLessons: 1, totalLessons: 4, overallPercent: 25 },
};

describe("useDashboardData", () => {
  beforeEach(() => {
    getDashboardMock.mockReset();
    window.sessionStorage.clear();
  });

  it("uses the current session cache without another dashboard request", async () => {
    window.sessionStorage.setItem(
      "sprout.dashboard.learner-1",
      JSON.stringify({
        payload: cachedDashboard,
        expiresAt: Date.now() + 30_000,
      }),
    );

    const { result } = renderHook(() =>
      useDashboardData({ userId: "learner-1", isAuthenticated: true }),
    );

    await waitFor(() => {
      expect(result.current.dashboard).toEqual(cachedDashboard);
    });
    expect(getDashboardMock).not.toHaveBeenCalled();
  });

  it("clears cached data and refetches after a completion event", async () => {
    const refreshedDashboard = {
      ...cachedDashboard,
      progress: { completedLessons: 2, totalLessons: 4, overallPercent: 50 },
    };
    getDashboardMock
      .mockResolvedValueOnce(cachedDashboard)
      .mockResolvedValueOnce(refreshedDashboard);
    const { result } = renderHook(() =>
      useDashboardData({ userId: "learner-1", isAuthenticated: true }),
    );

    await waitFor(() => {
      expect(result.current.dashboard).toEqual(cachedDashboard);
    });

    act(() => {
      window.dispatchEvent(new Event("sprout:progress-updated"));
    });

    await waitFor(() => {
      expect(result.current.dashboard).toEqual(refreshedDashboard);
    });
    expect(getDashboardMock).toHaveBeenCalledTimes(2);
  });
});
