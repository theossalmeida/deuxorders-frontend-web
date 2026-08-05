import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    name: "integration",
    environment: "jsdom",
    env: {
      BACKEND_URL: "https://backend.test.local",
      NEXT_PUBLIC_API_URL: "https://api.test.local",
    },
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/integration/**/*.test.{ts,tsx}"],
    reporters: process.env.CI ? ["default", "junit"] : ["default"],
    outputFile: { junit: "TestResults/integration-tests.xml" },
    coverage: {
      provider: "v8",
      reportsDirectory: "TestResults/coverage/integration",
      reporter: ["text", "cobertura"],
      include: ["src/**"],
    },
  },
});
