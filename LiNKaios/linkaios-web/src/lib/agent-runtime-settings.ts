/** Typed JSON stored in `linkaios.agents.runtime_settings`. */

export type ModelCategoryId =
  | "heartbeat"
  | "context_lt_100k"
  | "context_gt_100k"
  | "execution"
  | "fallback";

export const MODEL_CATEGORY_LABELS: Record<ModelCategoryId, string> = {
  heartbeat: "Heartbeat",
  context_lt_100k: "Context <100k",
  context_gt_100k: "Context >100k",
  execution: "Execution",
  fallback: "Fallback",
};

export type ModelBillingKind = "cloud" | "local";

export type ApprovedModelEntry = {
  id: string;
  label: string;
  kind: ModelBillingKind;
};

export const APPROVED_MODEL_CATALOG: ApprovedModelEntry[] = [
  { id: "claude-sonnet-4", label: "Claude Sonnet 4", kind: "cloud" },
  { id: "claude-3-5-haiku", label: "Claude 3.5 Haiku", kind: "cloud" },
  { id: "gpt-4.1", label: "GPT-4.1", kind: "cloud" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 mini", kind: "cloud" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", kind: "cloud" },
  { id: "llama-3.1-8b-instruct-local", label: "Llama 3.1 8B Instruct (local)", kind: "local" },
  { id: "qwen2.5-7b-instruct-local", label: "Qwen2.5 7B Instruct (local)", kind: "local" },
];

const CATALOG_IDS = new Set(APPROVED_MODEL_CATALOG.map((m) => m.id));

export function isApprovedModelId(id: string): boolean {
  return CATALOG_IDS.has(id);
}

export function modelEntryById(id: string): ApprovedModelEntry | undefined {
  return APPROVED_MODEL_CATALOG.find((m) => m.id === id);
}

export type AgentRuntimeModels = {
  primary: Record<ModelCategoryId, string>;
  fallbackOnline: string | null;
  fallbackLocal: string | null;
};

/** Rolling cloud (API) token counters — enforcement lives in runtime; UI stores thresholds. */
export type AgentRuntimeCloudSpend = {
  tokenAlertThreshold: number | null;
  tokenHardCap: number | null;
};

export type AgentRuntimeBehavior = {
  autoFallbackOnlineOnPrimaryError: boolean;
  forceLocalOnHardCap: boolean;
  cascadeToLocalOnCloudFailure: boolean;
};

/** Optional LiNKbot workplace profile stored inside `agents.runtime_settings` JSON. */
export type AgentLinkaiosProfile = {
  title: string;
  description: string;
  reportsToAgentId: string | null;
};

export type AgentRuntimeSettings = {
  models: AgentRuntimeModels;
  cloudSpend: AgentRuntimeCloudSpend;
  behavior: AgentRuntimeBehavior;
  linkaiosProfile: AgentLinkaiosProfile;
};

const AGENT_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DEFAULT_PRIMARY: Record<ModelCategoryId, string> = {
  heartbeat: "claude-3-5-haiku",
  context_lt_100k: "claude-sonnet-4",
  context_gt_100k: "claude-sonnet-4",
  execution: "claude-sonnet-4",
  fallback: "gpt-4.1-mini",
};

export function defaultAgentRuntimeSettings(): AgentRuntimeSettings {
  return {
    models: {
      primary: { ...DEFAULT_PRIMARY },
      fallbackOnline: "gpt-4.1-mini",
      fallbackLocal: "llama-3.1-8b-instruct-local",
    },
    cloudSpend: { tokenAlertThreshold: null, tokenHardCap: null },
    behavior: {
      autoFallbackOnlineOnPrimaryError: true,
      forceLocalOnHardCap: true,
      cascadeToLocalOnCloudFailure: true,
    },
    linkaiosProfile: { title: "", description: "", reportsToAgentId: null },
  };
}

function parseLinkaiosProfile(raw: unknown): AgentLinkaiosProfile {
  const def = defaultAgentRuntimeSettings().linkaiosProfile;
  if (!raw || typeof raw !== "object") return { ...def };
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const description = typeof o.description === "string" ? o.description.trim() : "";
  let reportsToAgentId: string | null = null;
  const rt = o.reports_to_agent_id;
  if (typeof rt === "string" && AGENT_ID_RE.test(rt)) reportsToAgentId = rt;
  return { title, description, reportsToAgentId };
}

function pickModelId(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !isApprovedModelId(value)) return fallback;
  return value;
}

function pickNullableModelId(value: unknown, fallback: string | null): string | null {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string" || !isApprovedModelId(value)) return fallback;
  return value;
}

function parsePrimary(raw: unknown, defaults: Record<ModelCategoryId, string>): Record<ModelCategoryId, string> {
  if (!raw || typeof raw !== "object") return { ...defaults };
  const o = raw as Record<string, unknown>;
  const out = { ...defaults };
  (Object.keys(MODEL_CATEGORY_LABELS) as ModelCategoryId[]).forEach((k) => {
    out[k] = pickModelId(o[k], defaults[k]);
  });
  return out;
}

function parseCloudSpend(raw: unknown): AgentRuntimeCloudSpend {
  const def = defaultAgentRuntimeSettings().cloudSpend;
  if (!raw || typeof raw !== "object") return { ...def };
  const o = raw as Record<string, unknown>;
  const numOrNull = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.floor(n);
  };
  return {
    tokenAlertThreshold: numOrNull(o.tokenAlertThreshold),
    tokenHardCap: numOrNull(o.tokenHardCap),
  };
}

function parseBehavior(raw: unknown): AgentRuntimeBehavior {
  const def = defaultAgentRuntimeSettings().behavior;
  if (!raw || typeof raw !== "object") return { ...def };
  const o = raw as Record<string, unknown>;
  const bool = (v: unknown, d: boolean) => (typeof v === "boolean" ? v : d);
  return {
    autoFallbackOnlineOnPrimaryError: bool(o.autoFallbackOnlineOnPrimaryError, def.autoFallbackOnlineOnPrimaryError),
    forceLocalOnHardCap: bool(o.forceLocalOnHardCap, def.forceLocalOnHardCap),
    cascadeToLocalOnCloudFailure: bool(o.cascadeToLocalOnCloudFailure, def.cascadeToLocalOnCloudFailure),
  };
}

/** Normalise arbitrary JSON from Postgres into a full settings object. */
export function parseRuntimeSettings(raw: unknown): AgentRuntimeSettings {
  const base = defaultAgentRuntimeSettings();
  if (!raw || typeof raw !== "object") return base;
  const root = raw as Record<string, unknown>;
  const modelsRaw = root.models;
  const m =
    modelsRaw && typeof modelsRaw === "object"
      ? (modelsRaw as Record<string, unknown>)
      : {};

  const primary = parsePrimary(m.primary, base.models.primary);

  return {
    models: {
      primary,
      fallbackOnline: pickNullableModelId(m.fallbackOnline, base.models.fallbackOnline),
      fallbackLocal: pickNullableModelId(m.fallbackLocal, base.models.fallbackLocal),
    },
    cloudSpend: parseCloudSpend(root.cloudSpend),
    behavior: parseBehavior(root.behavior),
    linkaiosProfile: parseLinkaiosProfile(root.linkaios_profile),
  };
}

export type DeepPartialAgentRuntimeSettings = {
  models?: Partial<AgentRuntimeModels> & {
    primary?: Partial<Record<ModelCategoryId, string>>;
  };
  cloudSpend?: Partial<AgentRuntimeCloudSpend>;
  behavior?: Partial<AgentRuntimeBehavior>;
  linkaiosProfile?: Partial<AgentLinkaiosProfile>;
};

export function mergeRuntimeSettings(
  base: AgentRuntimeSettings,
  patch: DeepPartialAgentRuntimeSettings,
): AgentRuntimeSettings {
  return {
    models: {
      primary: { ...base.models.primary, ...patch.models?.primary },
      fallbackOnline:
        patch.models?.fallbackOnline === undefined ? base.models.fallbackOnline : patch.models.fallbackOnline,
      fallbackLocal:
        patch.models?.fallbackLocal === undefined ? base.models.fallbackLocal : patch.models.fallbackLocal,
    },
    cloudSpend: { ...base.cloudSpend, ...patch.cloudSpend },
    behavior: { ...base.behavior, ...patch.behavior },
    linkaiosProfile: { ...base.linkaiosProfile, ...patch.linkaiosProfile },
  };
}

export function serialiseRuntimeSettings(s: AgentRuntimeSettings): Record<string, unknown> {
  return {
    models: {
      primary: { ...s.models.primary },
      fallbackOnline: s.models.fallbackOnline,
      fallbackLocal: s.models.fallbackLocal,
    },
    cloudSpend: { ...s.cloudSpend },
    behavior: { ...s.behavior },
    linkaios_profile: {
      title: s.linkaiosProfile.title,
      description: s.linkaiosProfile.description,
      reports_to_agent_id: s.linkaiosProfile.reportsToAgentId,
    },
  };
}
