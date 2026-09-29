import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "./src/app"),
      "@shells": path.resolve(__dirname, "./src/shells"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@page-shells": path.resolve(__dirname, "./src/page-shells"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@portal": path.resolve(__dirname, "./src/portal"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "node_modules/**",
      "dist/**",
    ],
  },
});
