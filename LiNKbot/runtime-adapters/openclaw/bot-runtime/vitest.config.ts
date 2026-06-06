import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "src/**/*.test.ts",
      "../../../roles/suites/**/openclaw-mapping.test.ts",
    ],
  },
});
