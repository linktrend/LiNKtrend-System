import { z } from "zod";

function optionalNonEmpty() {
  return z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().min(1).optional(),
  );
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  NEXT_PUBLIC_SUPABASE_URL: optionalNonEmpty(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalNonEmpty(),
  SUPABASE_SECRET_KEY: optionalNonEmpty(),
  DATABASE_URL: optionalNonEmpty(),
  /** POST target for `{ linktrendGovernance }` JSON (OpenClaw gateway / custom shim). */
  OPENCLAW_AGENT_RUN_URL: optionalNonEmpty(),
  OPENCLAW_RUN_AUTH_BEARER: optionalNonEmpty(),
  BOT_RUNTIME_MISSION_ID: optionalNonEmpty(),
  BOT_RUNTIME_SKILL_NAME: optionalNonEmpty(),
  ZULIP_GATEWAY_PORT: optionalNonEmpty(),
  PRISM_HEARTBEAT_MS: optionalNonEmpty(),
});

export type Env = z.infer<typeof envSchema>;

/** Reads process.env for Node services; browser code should only rely on NEXT_PUBLIC_* via Next. */
export function loadEnv(
  env: NodeJS.ProcessEnv = process.env,
): Env {
  return envSchema.parse(env);
}

export function getSupabasePublicOrThrow(env: Env): {
  url: string;
  publishableKey: string;
} {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }
  return { url, publishableKey };
}
