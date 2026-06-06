import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@linktrend/agent-zero-runtime": path.resolve(
        rootDir,
        "../../agent-zero/bot-runtime/src/index.ts",
      ),
    },
  },
  test: {
    include: [
      "src/**/*.test.ts",
      "../../../roles/platform/**/*.test.ts",
      "../../../roles/suites/**/agent-zero-mapping.test.ts",
      "../../../roles/suites/**/openclaw-mapping.test.ts",
    ],
  },
});
