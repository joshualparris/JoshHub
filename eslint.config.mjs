import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "node_modules/**",
      "public/games/**",
      "public/portal-adapter.js",
      "eslint.config.mjs",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },

  // P14 is a hard invariant: dependencies flow app -> features -> components -> lib -> data.
  // Stateful Platform screens were moved into their feature before this became blocking, so
  // a future reverse dependency now fails CI instead of becoming normalised architecture debt.
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: { import: importPlugin },
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
      },
    },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: "src",
          zones: [
            {
              target: "./components",
              from: "./features",
              message:
                "components is presentation-only and must not import from features; stateful feature UI belongs in the feature (P14).",
            },
            {
              target: "./lib",
              from: "./components",
              message: "lib must not import UI (P14).",
            },
            {
              target: "./lib",
              from: "./app",
              message: "lib must not import UI (P14).",
            },
            {
              target: "./data",
              from: "./lib",
              message: "data is static and must import nothing (P14).",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  }
);
