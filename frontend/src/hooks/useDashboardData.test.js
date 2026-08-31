import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useDashboardData from "./useDashboardData";
import * as api from "../services/api";

// Mock the dashboard API so these tests can focus on the hook's loading and caching behavior.
vi.mock("../services/api", () => ({
  getDashboard: vi.fn(),
}));

describe("useDashboardData", () => {
  beforeEach(() => {
    // Start each test with an empty dashboard cache and fresh API mocks.
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("loads the dashboard for an authenticated user and caches the payload", async () => {
    const payload = {
      hero: { title: "Welcome back" },
      nextAction: { title: "Keep going", href: "/learn/cashFlow/1.1" },
      units: [{ id: "unit-1", completedLessons: 2 }],
      recentActivity: [{ label: "Lesson completed" }],
    };

    // Return a successful dashboard response without making a real API request.
    api.getDashboard.mockResolvedValue(payload);

    const { result } = renderHook(() =>
      useDashboardData({ userId: "user-123", isAuthenticated: true }),
    );

    // Wait for the hook to finish loading the dashboard data.
    await waitFor(() => {
      expect(result.current.dashboard).toEqual(payload);
    });

    expect(api.getDashboard).toHaveBeenCalledTimes(1);

    // The loaded dashboard should also be cached for this user.
    expect(JSON.parse(sessionStorage.getItem("sprout.dashboard.user-123"))).toMatchObject({
      payload,
    });
  });

  it("uses the cached dashboard when it is still fresh and refreshes on progress event", async () => {
    const cachedPayload = {
      hero: { title: "Cached" },
      nextAction: { title: "Resume" },
      units: [],
      recentActivity: [],
    };

    // Save a dashboard response that has not expired yet.
    sessionStorage.setItem(
      "sprout.dashboard.user-123",
      JSON.stringify({
        payload: cachedPayload,
        expiresAt: Date.now() + 30_000,
      }),
    );

    // This response should only be used after the progress update forces a refresh.
    api.getDashboard.mockResolvedValue({
      hero: { title: "Fresh" },
      nextAction: { title: "Fresh action" },
      units: [{ id: "u-1", completedLessons: 1 }],
      recentActivity: [],
    });

    const { result } = renderHook(() =>
      useDashboardData({ userId: "user-123", isAuthenticated: true }),
    );

    // A fresh cached dashboard should be used instead of calling the API.
    await waitFor(() => {
      expect(result.current.dashboard).toEqual(cachedPayload);
    });

    expect(api.getDashboard).not.toHaveBeenCalled();

    // Pretend lesson or quiz progress changed somewhere else in the app.
    act(() => {
      window.dispatchEvent(new Event("sprout:progress-updated"));
    });

    // Progress changes should cause the dashboard to refresh from the API.
    await waitFor(() => {
      expect(api.getDashboard).toHaveBeenCalledTimes(1);
    });
  });
});
