import { defineConfig } from "vite";
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
  server: {
    port: 3000,
  },
});
