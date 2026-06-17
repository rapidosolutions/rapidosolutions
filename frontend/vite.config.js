import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:4174"
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
