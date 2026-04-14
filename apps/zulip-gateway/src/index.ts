import { loadEnv } from "@linktrend/shared-config";
import { log } from "@linktrend/observability";

async function main() {
  loadEnv();
  log("info", "zulip-gateway process up (Zulip app DB is separate; this uses Supabase gateway schema)", {
    service: "zulip-gateway",
  });
}

main();
