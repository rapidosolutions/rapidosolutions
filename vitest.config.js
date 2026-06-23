import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./frontend/src/test/setup.js"],
    include: ["backend/**/*.test.js", "frontend/src/**/*.test.{js,jsx}"],
    coverage: { reporter: ["text", "html"] }
  }
});
