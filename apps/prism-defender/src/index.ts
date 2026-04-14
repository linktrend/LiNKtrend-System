import { loadEnv } from "@linktrend/shared-config";
import { log } from "@linktrend/observability";

async function main() {
  loadEnv();
  log("info", "prism-defender sidecar ready (cleanup rules not yet wired)", {
    service: "prism-defender",
  });
}

main();
