export const PRODUCT_MODEL_HIERARCHY = [
  "Module",
  "Project Type",
  "Project",
  "Workflow",
  "Issue",
  "Run",
  "Trace",
] as const;

export type ProductModelLevel = (typeof PRODUCT_MODEL_HIERARCHY)[number];

/**
 * Internal terms can remain in storage/schema for compatibility, but UI copy
 * in touched surfaces should use the approved product model wording.
 */
export const USER_FACING_TERM_OVERRIDES: Readonly<Record<string, string>> = {
  mission: "Project",
  missions: "Projects",
};

export function toUserFacingTerm(term: string): string {
  const key = term.trim().toLowerCase();
  return USER_FACING_TERM_OVERRIDES[key] ?? term;
}

export type ProductVisibilityMarkerId =
  | "vendor_only"
  | "client_visible"
  | "licensed"
  | "protected_ip_hidden"
  | "client_company_memory"
  | "anonymized_vendor_learning";

export type ProductVisibilityMarker = {
  id: ProductVisibilityMarkerId;
  label: string;
  audience: "vendor" | "client" | "both";
  description: string;
};

export const PRODUCT_VISIBILITY_MARKERS: readonly ProductVisibilityMarker[] = [
  {
    id: "vendor_only",
    label: "Vendor-only",
    audience: "vendor",
    description: "Visible to vendor operators only.",
  },
  {
    id: "client_visible",
    label: "Client-visible",
    audience: "client",
    description: "Safe to show in client-facing views.",
  },
  {
    id: "licensed",
    label: "Licensed",
    audience: "both",
    description: "Controlled by contract/license scope.",
  },
  {
    id: "protected_ip_hidden",
    label: "Protected IP hidden",
    audience: "client",
    description: "Protected project-type and workflow internals are not shown.",
  },
  {
    id: "client_company_memory",
    label: "Client company memory",
    audience: "client",
    description: "Scoped to the client company context.",
  },
  {
    id: "anonymized_vendor_learning",
    label: "Anonymized vendor learning",
    audience: "vendor",
    description: "Vendor learning uses anonymized client details.",
  },
] as const;

export type ProductStatusDomain =
  | "project_type"
  | "project"
  | "workflow"
  | "issue"
  | "run"
  | "approval"
  | "lease"
  | "provider_tool"
  | "linkbot"
  | "sync";

export type StatusTone = "ok" | "progress" | "attention" | "risk" | "neutral";

export type ProductStatusStyle = {
  tone: StatusTone;
  className: string;
  guidance: string;
};

const STATUS_TONE_STYLES: Readonly<Record<StatusTone, string>> = {
  ok: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  progress: "bg-sky-50 text-sky-800 ring-sky-200",
  attention: "bg-amber-50 text-amber-900 ring-amber-200",
  risk: "bg-red-100 text-red-900 ring-red-200",
  neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200",
};

export const PRODUCT_STATUS_TONE_GUIDANCE: Readonly<Record<ProductStatusDomain, ProductStatusStyle>> = {
  project_type: {
    tone: "neutral",
    className: STATUS_TONE_STYLES.neutral,
    guidance: "Use neutral styling in client view; do not expose protected internals.",
  },
  project: {
    tone: "progress",
    className: STATUS_TONE_STYLES.progress,
    guidance: "Show active lifecycle movement without percentage completion.",
  },
  workflow: {
    tone: "progress",
    className: STATUS_TONE_STYLES.progress,
    guidance: "Emphasize step state and blockers, not hidden implementation detail.",
  },
  issue: {
    tone: "attention",
    className: STATUS_TONE_STYLES.attention,
    guidance: "Highlight triage needed; reserve risk for hard failures.",
  },
  run: {
    tone: "progress",
    className: STATUS_TONE_STYLES.progress,
    guidance: "Represent run lifecycle state; do not derive completion percentage.",
  },
  approval: {
    tone: "attention",
    className: STATUS_TONE_STYLES.attention,
    guidance: "Pending approvals require operator visibility.",
  },
  lease: {
    tone: "attention",
    className: STATUS_TONE_STYLES.attention,
    guidance: "Use attention tone for nearing expiry or required renewal action.",
  },
  provider_tool: {
    tone: "neutral",
    className: STATUS_TONE_STYLES.neutral,
    guidance: "Show readiness/access posture without exposing secret/config internals.",
  },
  linkbot: {
    tone: "ok",
    className: STATUS_TONE_STYLES.ok,
    guidance: "Use ok/progress/attention transitions as role execution changes.",
  },
  sync: {
    tone: "progress",
    className: STATUS_TONE_STYLES.progress,
    guidance: "Represent sync movement and retry state; escalate hard stops to risk.",
  },
};
