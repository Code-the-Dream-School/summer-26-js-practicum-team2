import { describe, expect, it } from "vitest";
import { getProgressFavicon } from "./progressFavicon";

describe("getProgressFavicon", () => {
  it.each([
    [0, "plant_progress_0"],
    [24, "plant_progress_0"],
    [25, "plant_progress_25"],
    [50, "plant_progress_50"],
    [75, "plant_progress_75"],
    [100, "plant_progress_100"],
  ])("selects the %s%% plant icon", (percent, assetName) => {
    expect(getProgressFavicon(percent)).toContain(assetName);
  });
});
