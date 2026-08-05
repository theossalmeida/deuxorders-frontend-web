import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    name: "unit",
    environment: "node",
    // Pin the timezone so date-formatting tests are deterministic across
    // machines/CI runners regardless of their local system timezone.
    env: { TZ: "America/Sao_Paulo", NEXT_PUBLIC_API_URL: "https://api.test.local" },
    include: ["tests/unit/**/*.test.ts"],
    reporters: process.env.CI ? ["default", "junit"] : ["default"],
    outputFile: { junit: "TestResults/unit-tests.xml" },
    coverage: {
      provider: "v8",
      reportsDirectory: "TestResults/coverage/unit",
      reporter: ["text", "cobertura"],
      include: ["src/lib/**"],
    },
  },
});
