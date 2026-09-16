import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: ["dist/**", "node_modules/**"],
  },

  {
    files: ["**/*.{js,ts}"],

    plugins: {
      unicorn,
    },

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      "unicorn/recommended",
    ],

    linterOptions: {
      noInlineConfig: true,
    },

    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
]);
