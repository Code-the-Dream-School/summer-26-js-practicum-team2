import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "./useAuth";
import * as api from "../services/api";

vi.mock("../services/api", () => ({
  getProfile: vi.fn(),
}));

describe("useAuth", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    api.getProfile.mockResolvedValue({
      user: {
        id: "user-id",
        name: "Maya",
        email: "maya@example.com",
      },
    });
  });

  it("refreshes an incomplete stored user from the authenticated profile", async () => {
    sessionStorage.setItem(
      "sprout.auth",
      JSON.stringify({
        user: { id: "user-id", email: "maya@example.com", role: "learner" },
        csrfToken: "csrf-token",
      }),
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isHydrating).toBe(false));

    expect(api.getProfile).toHaveBeenCalledTimes(1);
    expect(result.current.user).toEqual(expect.objectContaining({ name: "Maya", role: "learner" }));
    expect(JSON.parse(sessionStorage.getItem("sprout.auth"))).toEqual(
      expect.objectContaining({
        csrfToken: "csrf-token",
        user: expect.objectContaining({ name: "Maya", role: "learner" }),
      }),
    );
  });
});
