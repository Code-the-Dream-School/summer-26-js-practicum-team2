import { describe, expect, it, vi } from "vitest";
import { AUTH_EXPIRED_EVENT, getProfile } from "./api";

describe("apiRequest", () => {
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
});
