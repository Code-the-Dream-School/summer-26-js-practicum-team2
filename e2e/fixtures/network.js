import { test as base, expect } from "@playwright/test";

const MBPS = (1024 * 1024) / 8;

// Chrome DevTools "Network" presets plus a CPU slowdown multiplier.
export const NETWORK_PROFILES = {
  none: null,
  "slow-3g": {
    latency: 2000,
    download: 400 * 1024 * 0.8,
    upload: 400 * 1024 * 0.8,
    cpuThrottlingRate: 4,
  },
  "fast-3g": {
    latency: 562.5,
    download: 1.6 * MBPS * 0.9,
    upload: 750 * 1024 * 0.9,
    cpuThrottlingRate: 4,
  },
  "slow-4g": {
    latency: 150,
    download: 3 * MBPS,
    upload: 1.5 * MBPS,
    cpuThrottlingRate: 2,
  },
};

/**
 * Applies Chrome DevTools style network + CPU throttling for the rest of the test.
 * Chromium only; other browsers silently run at full speed.
 */
export async function throttlePage(page, profileName) {
  const profile = NETWORK_PROFILES[profileName];
  if (!profile) return null;

  const client = await page.context().newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: profile.latency,
    downloadThroughput: profile.download,
    uploadThroughput: profile.upload,
  });
  if (profile.cpuThrottlingRate && profile.cpuThrottlingRate > 1) {
    await client.send("Emulation.setCPUThrottlingRate", {
      rate: profile.cpuThrottlingRate,
    });
  }
  return client;
}

export const test = base.extend({
  // Set per project in playwright.config.js: use: { networkProfile: "slow-3g" }.
  networkProfile: ["none", { option: true }],

  page: async ({ page, browserName, networkProfile }, use) => {
    if (browserName === "chromium") {
      await throttlePage(page, networkProfile);
    }
    await use(page);
  },
});

export { expect };
