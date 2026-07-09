import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "..", "");
  const apiTarget =
    process.env.API_PROXY_TARGET ??
    env.API_PROXY_TARGET ??
    `http://localhost:${env.PORT || "3000"}`;

  return {
    envDir: "..",
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": apiTarget,
        "/uploads": apiTarget,
      },
    },
    preview: {
      port: 4173,
      proxy: {
        "/api": apiTarget,
        "/uploads": apiTarget,
      },
    },
  };
});
