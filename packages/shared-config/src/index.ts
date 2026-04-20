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
  /** OpenClaw POST upper bound (ms). Default 30_000 when unset or invalid. */
  BOT_RUNTIME_HTTP_TIMEOUT_MS: optionalNonEmpty(),
  /** Zulip governance notify POST (ms). Falls back to HTTP timeout, then 10_000. */
  BOT_RUNTIME_NOTIFY_TIMEOUT_MS: optionalNonEmpty(),
  ZULIP_GATEWAY_PORT: optionalNonEmpty(),
  PRISM_HEARTBEAT_MS: optionalNonEmpty(),
  /** Delete `sidecar_heartbeat` rows older than this many days (prism-defender). Default 14 when unset. */
  PRISM_RETENTION_DAYS: optionalNonEmpty(),
  /** Set to "0" to disable residue sweep (default on). */
  PRISM_RESIDUE_SWEEP: optionalNonEmpty(),
  /** Max closed sessions to acknowledge per sweep cycle. */
  PRISM_RESIDUE_BATCH: optionalNonEmpty(),
  /** Comma-separated absolute directory roots PRISM may clean (empty ⇒ no FS cleanup). */
  PRISM_RESIDUE_ROOTS: optionalNonEmpty(),
  /** `1` to allow real unlink; default off (`0` or unset). */
  PRISM_FS_CLEANUP: optionalNonEmpty(),
  /**
   * `1` = log intended deletes only (default when unset — safer).
   * `0` = allow real deletes when `PRISM_FS_CLEANUP=1`.
   */
  PRISM_FS_DRY_RUN: optionalNonEmpty(),
  /** Max file deletes per FS cleanup invocation (default 100). */
  PRISM_FS_MAX_FILES_PER_TICK: optionalNonEmpty(),
  /** Only delete files older than this many seconds by mtime (default 300). */
  PRISM_FS_MIN_AGE_SEC: optionalNonEmpty(),
  /** Comma-separated absolute path prefixes never deleted under roots. */
  PRISM_FS_DENY_PREFIXES: optionalNonEmpty(),
  /** Max directory depth from each root when walking (default 6). */
  PRISM_FS_MAX_DEPTH: optionalNonEmpty(),
  /** Optional comma list of paths the worker advertises at session end (correlation only). */
  BOT_RUNTIME_RESIDUE_ROOTS: optionalNonEmpty(),
  /** Default 8789. Local OpenClaw ingress mock for bot-runtime. */
  OPENCLAW_SHIM_PORT: optionalNonEmpty(),
  /** Google AI Studio / Gemini API key for text embeddings (LiNKbrain). Optional until embedding jobs run. */
  GEMINI_API_KEY: optionalNonEmpty(),
  /** Shared secret for `POST /api/brain/*` routes (OpenClaw / bot-runtime virtual file bridge). */
  BOT_BRAIN_API_SECRET: optionalNonEmpty(),
  /** Cron / internal routes (`/api/internal/brain-embed`, librarian). Vercel Cron may use `CRON_SECRET` instead. */
  LINKAIOS_CRON_SECRET: optionalNonEmpty(),
  CRON_SECRET: optionalNonEmpty(),
  /** Optional: POST target for tool-governance Zulip notify (`apps/zulip-gateway` internal route). */
  ZULIP_GATEWAY_NOTIFY_URL: optionalNonEmpty(),
  /** Shared secret header `x-linktrend-internal-secret` for gateway internal routes. */
  ZULIP_GATEWAY_INTERNAL_SECRET: optionalNonEmpty(),
  /** Public LiNKaios base URL for approval deep links (no trailing slash required). */
  LINKTREND_PUBLIC_BASE_URL: optionalNonEmpty(),
  /** Zulip bot API key (outbound messages from zulip-gateway). */
  ZULIP_BOT_API_KEY: optionalNonEmpty(),
  /** Zulip bot email address. */
  ZULIP_BOT_EMAIL: optionalNonEmpty(),
  /** Zulip realm URL, e.g. https://chat.example.com */
  ZULIP_SITE_URL: optionalNonEmpty(),
  /** Fallback Zulip stream id when mission cannot be resolved (org-wide blocks). */
  ZULIP_FALLBACK_STREAM_ID: optionalNonEmpty(),
  /** Topic for governance notify messages (optional). */
  ZULIP_GOVERNANCE_TOPIC: optionalNonEmpty(),
  /** If set, inbound `POST /webhooks/zulip` must send matching query `zulip_webhook_secret` or header `x-linktrend-zulip-inbound-secret`. */
  ZULIP_INBOUND_WEBHOOK_SECRET: optionalNonEmpty(),
  /** Set to `0` to disable automated librarian cron. */
  LINKBRAIN_LIBRARIAN_ENABLED: z.string().optional(),
  LINKBRAIN_LIBRARIAN_MAX_FILES: z.string().optional(),
  LINKBRAIN_LIBRARIAN_MODEL: optionalNonEmpty(),
  /**
   * `1` / `true` / `yes` enables LiNKaios web UI fixture pack + banner (server-side only).
   * Unset or `0` = production behaviour (no merged demo rows).
   */
  LINKAIOS_UI_MOCKS: z.string().optional(),
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

/** Split comma-separated non-empty trimmed entries (paths, URLs, etc.). */
export function parseCommaSeparatedList(raw: string | undefined): string[] {
  if (raw == null || raw.trim() === "") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** `PRISM_RESIDUE_ROOTS` as list of trimmed non-empty segments. */
export function parsePrismResidueRoots(env: Env): string[] {
  return parseCommaSeparatedList(env.PRISM_RESIDUE_ROOTS);
}

/** `BOT_RUNTIME_RESIDUE_ROOTS` for `worker_session_end.detail.residue_roots`. */
export function parseBotRuntimeResidueRoots(env: Env): string[] {
  return parseCommaSeparatedList(env.BOT_RUNTIME_RESIDUE_ROOTS);
}

const DEFAULT_BOT_RUNTIME_OPENCLAW_TIMEOUT_MS = 30_000;
const DEFAULT_BOT_RUNTIME_NOTIFY_TIMEOUT_MS = 10_000;
const MAX_BOT_RUNTIME_HTTP_TIMEOUT_MS = 3_600_000;

function parseOptionalPositiveTimeoutMs(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === "") return null;
  const n = Number(raw.trim());
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(Math.floor(n), MAX_BOT_RUNTIME_HTTP_TIMEOUT_MS);
}

/** Upper bound for OpenClaw governance POST (`BOT_RUNTIME_HTTP_TIMEOUT_MS`). */
export function botRuntimeOpenClawTimeoutMs(env: Env): number {
  return parseOptionalPositiveTimeoutMs(env.BOT_RUNTIME_HTTP_TIMEOUT_MS) ?? DEFAULT_BOT_RUNTIME_OPENCLAW_TIMEOUT_MS;
}

/**
 * Zulip notify POST timeout: `BOT_RUNTIME_NOTIFY_TIMEOUT_MS`, else same as OpenClaw timeout env, else 10s.
 */
export function botRuntimeNotifyTimeoutMs(env: Env): number {
  return (
    parseOptionalPositiveTimeoutMs(env.BOT_RUNTIME_NOTIFY_TIMEOUT_MS) ??
    parseOptionalPositiveTimeoutMs(env.BOT_RUNTIME_HTTP_TIMEOUT_MS) ??
    DEFAULT_BOT_RUNTIME_NOTIFY_TIMEOUT_MS
  );
}

/** `PRISM_FS_DENY_PREFIXES` as list of trimmed path prefixes. */
export function parsePrismFsDenyPrefixes(env: Env): string[] {
  return parseCommaSeparatedList(env.PRISM_FS_DENY_PREFIXES);
}

function parseEnvBool01(raw: string | undefined, defaultWhenUnset: boolean): boolean {
  if (raw == null || raw.trim() === "") return defaultWhenUnset;
  const v = raw.trim();
  if (v === "1" || v === "true" || v === "yes") return true;
  if (v === "0" || v === "false" || v === "no") return false;
  return defaultWhenUnset;
}

/** Master switch for filesystem deletion (`PRISM_FS_CLEANUP=1`). Default false. */
export function prismFsCleanupApplyEnabled(env: Env): boolean {
  return parseEnvBool01(env.PRISM_FS_CLEANUP, false);
}

/**
 * When true, only emit `fs_cleanup_would_delete` events; no unlink.
 * Default true when unset (fail-safe).
 */
export function prismFsDryRun(env: Env): boolean {
  return parseEnvBool01(env.PRISM_FS_DRY_RUN, true);
}

export function prismFsMaxFilesPerTick(env: Env): number {
  const n = Number(env.PRISM_FS_MAX_FILES_PER_TICK);
  if (!Number.isFinite(n) || n < 1) return 100;
  return Math.min(Math.floor(n), 1_000_000);
}

export function prismFsMinAgeSec(env: Env): number {
  const n = Number(env.PRISM_FS_MIN_AGE_SEC);
  if (!Number.isFinite(n) || n < 0) return 300;
  return Math.min(Math.floor(n), 86_400 * 365);
}

export function prismFsMaxDepth(env: Env): number {
  const n = Number(env.PRISM_FS_MAX_DEPTH);
  if (!Number.isFinite(n) || n < 0) return 6;
  return Math.min(Math.floor(n), 64);
}

/**
 * LiNKaios web UI mock/fixture mode. Reads only `LINKAIOS_UI_MOCKS` — safe without `loadEnv()`.
 * Default false when unset.
 */
export function linkaiosUiMocksEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return parseEnvBool01(env.LINKAIOS_UI_MOCKS, false);
}
