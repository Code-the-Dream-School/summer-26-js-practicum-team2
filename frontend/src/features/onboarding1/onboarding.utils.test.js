import { describe, expect, it } from "vitest";
import { getOnboardingPageName } from "./onboarding.utils";

describe("getOnboardingPageName", () => {
  it.each([
    ["/dashboard", "dashboardPage"],
    ["/profile", "profilePage"],
    ["/learn", "learningPath"],
    ["/learn/cashFlow/1.1", "lessonPage"],
    ["/settings", ""],
  ])("maps %s to %s", (pathname, expectedPageName) => {
    expect(getOnboardingPageName(pathname)).toBe(expectedPageName);
  });
});
