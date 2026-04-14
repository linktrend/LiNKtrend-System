import { loadEnv } from "@linktrend/shared-config";
import { log } from "@linktrend/observability";
import { resolveSkillByName } from "@linktrend/linklogic-sdk";

async function main() {
  const env = loadEnv();
  log("info", "bot-runtime started", { service: "bot-runtime" });

  try {
    const skill = await resolveSkillByName(env, {
      service: "bot-runtime",
      skillName: "bootstrap",
    });
    log("info", "bootstrap skill lookup", {
      service: "bot-runtime",
      found: Boolean(skill),
    });
  } catch (e) {
    log("warn", "bootstrap skill lookup skipped or failed (expected until DB is ready)", {
      service: "bot-runtime",
      error: String(e),
    });
  }
}

main();
