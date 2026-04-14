import "server-only";

import { createSupabaseServiceClient } from "@linktrend/db";
import { loadEnv } from "@linktrend/shared-config";

export function getSupabaseAdmin() {
  return createSupabaseServiceClient(loadEnv());
}
