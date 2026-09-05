import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    passWithNoTests: true,
    // restoreAllMocks leaves vi.fn() call history intact, so clear it between tests.
    clearMocks: true,
  },
});
