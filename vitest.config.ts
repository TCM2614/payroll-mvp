import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest runs on Node — no browser or React rendering here. We only test
 * pure domain / library modules. UI components are covered separately by
 * Next's build (Route/Type checks) and by manual review.
 */
export default defineConfig({
  test: {
    environment: "node",
    // Enable Jest-style globals so pre-existing spec files that were
    // written for Jest (describe / it / expect used without imports)
    // work under Vitest without a rewrite.
    globals: true,
    include: [
      "src/**/*.spec.ts",
      "src/**/__tests__/**/*.spec.ts",
      "src/**/__tests__/**/*.test.ts",
    ],
    exclude: [
      "**/node_modules/**",
      ".next/**",
      // The historical periodTaxCodeOverride file is a compile-only
      // "documentation" style test (no assertions); keep it out of the
      // runner so it doesn't produce empty test failures.
      "src/components/tabs/__tests__/periodTaxCodeOverride.test.ts",
      // A pre-existing empty test placeholder — no assertions yet.
      "src/lib/__tests__/incomePercentile.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
