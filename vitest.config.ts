import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],
    include: ["./__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary"],
      include: [
        "app/**/*.{ts,tsx}",
        "components/landing/**/*.{ts,tsx}",
        "app/lib/utils.ts",
      ],
      exclude: [
        "**/*.d.ts",
        "node_modules/**",
        ".next/**",
        "app/favicon.ico",
        "components/ui/**",
        "app/lib/firebase-config.ts",
      ],
    },
  },
});
