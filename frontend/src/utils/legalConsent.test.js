import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getConsentPreference,
  setConsentPreference,
  shouldTrackAnalytics,
  trackAnalyticsEvent,
} from "./legalConsent";

describe("legal consent utilities", () => {
  beforeEach(() => {
    // Start each test with no saved consent preference or previous mock calls
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("stores only supported preferences and gates analytics on acceptance", () => {
    // No preference should be saved before the learner makes a choice
    expect(getConsentPreference()).toBe(null);

    // Accepting consent should save the preference and allow analytics tracking
    expect(setConsentPreference("accepted")).toBe("accepted");
    expect(getConsentPreference()).toBe("accepted");
    expect(shouldTrackAnalytics("accepted")).toBe(true);
    expect(shouldTrackAnalytics("declined")).toBe(false);

    // Unsupported consent values should not be kept in storage
    setConsentPreference("unknown");
    expect(getConsentPreference()).toBe(null);
  });

  it("does not log declined events and logs accepted events with their payload", () => {
    // Use a mock logger so we can check whether an analytics event would be sent
    const logger = vi.fn();

    // Declined consent should prevent the event from being tracked.
    setConsentPreference("declined");
    expect(trackAnalyticsEvent("page_view", { path: "/" }, { logger })).toBe(false);
    expect(logger).not.toHaveBeenCalled();

    // Accepted consent should allow the event and pass along its payload.
    setConsentPreference("accepted");
    expect(trackAnalyticsEvent("page_view", { path: "/learn" }, { logger })).toBe(true);
    expect(logger).toHaveBeenCalledWith("page_view", { path: "/learn" });
  });
});
