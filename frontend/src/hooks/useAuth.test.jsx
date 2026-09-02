import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "./useAuth";
import { AUTH_EXPIRED_EVENT } from "../services/api";
import * as api from "../services/api";

vi.mock("../services/api", () => ({
  AUTH_EXPIRED_EVENT: "sprout:auth-expired",
  CSRF_TOKEN_UPDATED_EVENT: "sprout:csrf-token-updated",
  clearCsrfToken: vi.fn(),
  getProfile: vi.fn(),
  setCsrfToken: vi.fn(),
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("clears stale stored authentication after a 401 during hydration", async () => {
    sessionStorage.setItem(
      "sprout.auth",
      JSON.stringify({
        user: { id: "user-id", email: "maya@example.com", role: "learner" },
        csrfToken: "csrf-token",
      }),
    );
    api.getProfile.mockRejectedValueOnce(Object.assign(new Error("Unauthorized"), { status: 401 }));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isHydrating).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.csrfToken).toBeNull();
    expect(sessionStorage.getItem("sprout.auth")).toBeNull();
  });

  it("logs out when the API reports an expired authentication session", async () => {
    sessionStorage.setItem(
      "sprout.auth",
      JSON.stringify({
        user: { id: "user-id", email: "maya@example.com", role: "learner" },
        csrfToken: "csrf-token",
      }),
    );
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isHydrating).toBe(false));

    act(() => {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.csrfToken).toBeNull();
    expect(sessionStorage.getItem("sprout.auth")).toBeNull();
  });

  it("updates the persisted CSRF token after a stale-token recovery", async () => {
    sessionStorage.setItem(
      "sprout.auth",
      JSON.stringify({
        user: { id: "user-id", email: "maya@example.com", role: "learner" },
        csrfToken: "stale-csrf-token",
      }),
    );
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isHydrating).toBe(false));

    act(() => {
      window.dispatchEvent(
        new CustomEvent("sprout:csrf-token-updated", { detail: { csrfToken: "fresh-csrf-token" } }),
      );
    });

    expect(result.current.csrfToken).toBe("fresh-csrf-token");
    expect(JSON.parse(sessionStorage.getItem("sprout.auth"))).toEqual(
      expect.objectContaining({ csrfToken: "fresh-csrf-token" }),
    );
  });
});
