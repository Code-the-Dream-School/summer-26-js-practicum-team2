import { afterEach, describe, expect, it, vi } from "vitest";
import { AUTH_EXPIRED_EVENT, clearCsrfToken, getProfile, startQuiz } from "./api";

describe("apiRequest", () => {
  afterEach(() => {
    clearCsrfToken();
    vi.unstubAllGlobals();
  });

  it("notifies the app when an API request is unauthorized", async () => {
    const onAuthExpired = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: { get: () => "application/json" },
        json: vi.fn().mockResolvedValue({ message: "No user is authenticated." }),
      }),
    );

    await expect(getProfile()).rejects.toMatchObject({
      message: "No user is authenticated.",
      status: 401,
    });

    expect(onAuthExpired).toHaveBeenCalledTimes(1);
    window.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
  });

  it("refreshes a stale CSRF token and retries a quiz start once", async () => {
    const freshCsrfToken = "a4a76cac-cc8e-4b82-8d79-3184dc3a9804";
    const headers = (csrfToken = null) => ({
      get: (name) => {
        if (name === "content-type") return "application/json";
        if (name === "x-csrf-token") return csrfToken;
        return null;
      },
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: headers(freshCsrfToken),
        json: async () => ({ message: "Invalid CSRF token." }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: headers(),
        json: async () => ({ success: true }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      startQuiz({
        moduleId: "cashFlow",
        microLessonId: "1.1.1",
        csrfToken: "stale-csrf-token",
      }),
    ).resolves.toEqual({ success: true });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1].headers).toEqual(
      expect.objectContaining({ "X-CSRF-TOKEN": "stale-csrf-token" }),
    );
    expect(fetchMock.mock.calls[1][1].headers).toEqual(
      expect.objectContaining({ "X-CSRF-TOKEN": freshCsrfToken }),
    );
  });
});
