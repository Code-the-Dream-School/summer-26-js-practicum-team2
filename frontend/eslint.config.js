import js from "@eslint/js";
import globals from "globals";
import eslintReact from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import { reactRefresh } from "eslint-plugin-react-refresh";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { defineConfig, globalIgnores } from "eslint/config";

const vitestGlobals = {
  describe: "readonly",
  it: "readonly",
  test: "readonly",
  expect: "readonly",
  vi: "readonly",
  beforeAll: "readonly",
  afterAll: "readonly",
  beforeEach: "readonly",
  afterEach: "readonly",
};

export default defineConfig([
  globalIgnores(["dist", "coverage"]),

  // Core configuration block for JS and JSX files
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite(), // Modern object config format
      eslintReact.configs.recommended, // Modern ESLint 10 React rules
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Target context overrides
  {
    files: ["src/context/*.jsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },

  {
    files: ["src/pages/LearningPathPage.jsx"],
    rules: {
      "@eslint-react/set-state-in-effect": "off",
    },
  },

  // Test environment configuration
  {
    files: ["**/*.{test,spec}.{js,jsx}", "src/setupTests.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...vitestGlobals,
      },
    },
  },

  eslintConfigPrettier,
]);
