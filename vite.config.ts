import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const PONTE = {
  "/api": {
    target: "http://127.0.0.1:8788",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    cssTarget: "safari14",
  },
  server: {
    host: true,
    port: 5173,
    proxy: PONTE,
  },
  preview: {
    proxy: PONTE,
  },
});
