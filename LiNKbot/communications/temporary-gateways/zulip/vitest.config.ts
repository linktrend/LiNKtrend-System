import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "../../profiles/**/*.test.ts"],
  },
});
