import { describe, expect, it } from "vitest";
import { ROUTES } from "../app/router/routes";
import { getPostLoginDestination, isSafeLocalPath } from "./postLoginRouting";

describe("post-login routing", () => {
  it("routes users to their role-specific dashboard when next is absent", () => {
    expect(getPostLoginDestination({ user: { role: "learner" } })).toBe(ROUTES.DASHBOARD);
    expect(getPostLoginDestination({ user: { role: "admin" } })).toBe(ROUTES.ADMIN_DASHBOARD);
  });

  it("prefers a valid local destination for any authenticated user", () => {
    const next = "/learn/cashFlow/1.1?review=true#quiz";
    expect(getPostLoginDestination({ user: { role: "admin" }, next })).toBe(next);
  });

  it.each([
    ["absolute URL", "https://example.com/phishing"],
    ["protocol-relative URL", "//example.com/phishing"],
    ["backslash authority URL", "/\\example.com/phishing"],
    ["malformed URL", "/%zz"],
    ["non-string value", { pathname: "/learn" }],
  ])("rejects an unsafe %s", (_description, next) => {
    expect(isSafeLocalPath(next)).toBe(false);
    expect(getPostLoginDestination({ user: { role: "admin" }, next })).toBe(ROUTES.ADMIN_DASHBOARD);
  });
});
