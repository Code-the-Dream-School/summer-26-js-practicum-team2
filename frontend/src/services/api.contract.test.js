import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteProfile } from "./api";

describe("profile API contracts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits account deletion requests to the review endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ message: "Deletion request sent." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await deleteProfile({ email: "learner@example.com", csrfToken: "csrf-token" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/profile/request-deletion",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "learner@example.com" }),
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-token" }),
      }),
    );
  });
});
