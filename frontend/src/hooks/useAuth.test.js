import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "./useAuth";
import * as api from "../services/api";

// Mock the API functions so these tests only focus on how useAuth handles auth state.
vi.mock("../services/api", () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  verifyUserEmail: vi.fn(),
  forgotPasswordRequest: vi.fn(),
  resetPasswordRequest: vi.fn(),
}));

describe("useAuth", () => {
  beforeEach(() => {
    // Start each test with clean storage and fresh API mocks.
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("hydrates a remembered session from storage on mount", async () => {
    const storedAuth = {
      user: { id: "user-123", email: "learner@example.com" },
      csrfToken: "stored-csrf-token",
    };

    // Pretend the user already has an authenticated session saved in the browser.
    sessionStorage.setItem("sprout.auth", JSON.stringify(storedAuth));

    const { result } = renderHook(() => useAuth());

    // Wait for the hook to finish reading the stored session and updating its state.
    await waitFor(() => {
      expect(result.current.user).toEqual(storedAuth.user);
      expect(result.current.csrfToken).toBe(storedAuth.csrfToken);
      expect(result.current.isHydrating).toBe(false);
    });
  });

  it("logs in, persists the session, and updates auth state", async () => {
    const payload = {
      user: { id: "user-123", email: "learner@example.com" },
      csrfToken: "csrf-token-123",
    };

    // Return a successful login response without making a real API request.
    api.loginUser.mockResolvedValue(payload);

    const { result } = renderHook(() => useAuth());

    // Wrap the login in act because it causes the hook's state to update.
    await act(async () => {
      await result.current.login({
        email: "learner@example.com",
        password: "SecurePass123!",
        remember: true,
      });
    });

    expect(api.loginUser).toHaveBeenCalledWith({
      email: "learner@example.com",
      password: "SecurePass123!",
      remember: true,
    });
    expect(result.current.user).toEqual(payload.user);
    expect(result.current.csrfToken).toBe(payload.csrfToken);

    // Remembering the user should save auth in localStorage instead of sessionStorage.
    expect(JSON.parse(localStorage.getItem("sprout.auth"))).toMatchObject(payload);
    expect(sessionStorage.getItem("sprout.auth")).toBeNull();
  });

  it("logs out through the API and clears the stored auth state", async () => {
    const storedAuth = {
      user: { id: "user-123", email: "learner@example.com" },
      csrfToken: "csrf-token-456",
    };

    // Start with an existing session so the hook has auth state to clear.
    sessionStorage.setItem("sprout.auth", JSON.stringify(storedAuth));
    api.logoutUser.mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useAuth());

    // Wait for the stored session to hydrate before trying to log out.
    await waitFor(() => {
      expect(result.current.csrfToken).toBe("csrf-token-456");
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(api.logoutUser).toHaveBeenCalledWith("csrf-token-456");
    expect(result.current.user).toBeNull();
    expect(result.current.csrfToken).toBeNull();

    // Logging out should remove auth from either storage location.
    expect(sessionStorage.getItem("sprout.auth")).toBeNull();
    expect(localStorage.getItem("sprout.auth")).toBeNull();
  });
});
