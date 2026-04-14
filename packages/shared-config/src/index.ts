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
  /** POST target: shim that forwards to LiNKbot-core gateway `agent` RPC, or custom handler. */
  OPENCLAW_AGENT_RUN_URL: optionalNonEmpty(),
  OPENCLAW_RUN_AUTH_BEARER: optionalNonEmpty(),
  /**
   * `agent_params` (default): POST flat `agent` params including `message`, `idempotencyKey`, `linktrendGovernance`.
   * `governance_only`: POST `{ linktrendGovernance }` only.
   */
  OPENCLAW_AGENT_RUN_BODY: z.enum(["agent_params", "governance_only"]).optional(),
  /** Required non-empty user/agent line when using agent_params (fork validates `message`). */
  OPENCLAW_AGENT_INGRESS_MESSAGE: optionalNonEmpty(),
  OPENCLAW_AGENT_SESSION_KEY: optionalNonEmpty(),
  OPENCLAW_AGENT_ID: optionalNonEmpty(),
  BOT_RUNTIME_MISSION_ID: optionalNonEmpty(),
  BOT_RUNTIME_SKILL_NAME: optionalNonEmpty(),
  ZULIP_GATEWAY_PORT: optionalNonEmpty(),
  PRISM_HEARTBEAT_MS: optionalNonEmpty(),
  /** Set to "0" to disable residue sweep (default on). */
  PRISM_RESIDUE_SWEEP: optionalNonEmpty(),
  /** Max closed sessions to acknowledge per sweep cycle. */
  PRISM_RESIDUE_BATCH: optionalNonEmpty(),
  /** Default 8789. Local OpenClaw ingress mock for bot-runtime. */
  OPENCLAW_SHIM_PORT: optionalNonEmpty(),
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
