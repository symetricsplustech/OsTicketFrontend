import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "./src/app"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react")) {
              return "vendor-react";
            }
            if (id.includes("redux") || id.includes("react-redux")) {
              return "vendor-redux";
            }
            if (id.includes("lucide-react")) {
              return "vendor-lucide";
            }
            if (id.includes("framer-motion")) {
              return "vendor-framer";
            }
            if (id.includes("recharts")) {
              return "vendor-recharts";
            }
            if (id.includes("axios")) {
              return "vendor-axios";
            }
            if (id.includes("clsx") || id.includes("tailwind-merge")) {
              return "vendor-utils";
            }
            return "vendor";
          }

          // App chunks by feature area
          if (id.includes("/screens/auth/")) {
            return "feature-auth";
          }
          if (id.includes("/screens/organization-admin/")) {
            return "feature-org-admin";
          }
          if (id.includes("/screens/saas-admin/")) {
            return "feature-saas-admin";
          }
          if (id.includes("/components/common/")) {
            return "feature-common-ui";
          }
          if (id.includes("/navigation/")) {
            return "feature-navigation";
          }
          if (id.includes("/services/")) {
            return "feature-services";
          }
          if (id.includes("/store/")) {
            return "feature-store";
          }
        },
      },
    },
  },
});
