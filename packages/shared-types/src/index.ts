/** Core identity — immutable agent id in architecture terms. */
export type AgentId = string;

/** Canonical project identifier (LiNKaios tenant work unit). */
export type ProjectId = string;

/** @deprecated Use {@link ProjectId} — removed in Phase D when DB/RPC columns migrate. */
export type MissionId = ProjectId;

export type SkillId = string;

export type ToolId = string;

export type TraceId = string;

export type AgentStatus = "active" | "inactive" | "retired";

/** Canonical project lifecycle status. */
export type ProjectStatus =
  | "draft"
  | "assigned"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

/** @deprecated Use {@link ProjectStatus}. */
export type MissionStatus = ProjectStatus;

export type SkillStatus = "draft" | "approved" | "deprecated";

export type ToolStatus = "draft" | "approved" | "archived";

export type ToolType =
  | "executable_bundle"
  | "http"
  | "registry_reference"
  | "plugin"
  | "mcp_server";

export interface AgentRecord {
  id: AgentId;
  display_name: string;
  status: AgentStatus;
  /** Programmable policy JSON from `linkaios.agents.runtime_settings`. */
  runtime_settings?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Canonical LiNKaios project row (Supabase `linkaios.missions` until Phase D). */
export interface ProjectRecord {
  id: ProjectId;
  title: string;
  status: ProjectStatus;
  primary_agent_id: AgentId | null;
  /** Project head for dual tool-governance approvals (Supabase `project_head_user_id`). */
  project_head_user_id?: string | null;
  created_at: string;
  updated_at: string;
}

/** @deprecated Use {@link ProjectRecord}. */
export interface MissionRecord extends ProjectRecord {
  id: MissionId;
  status: MissionStatus;
}

/**
 * Top-level key on `SkillRecord.metadata` (LiNKskills PRD): catalog `linkaios.tools.name` values.
 * @see SkillDeclaredToolsMetadata
 */
export const SKILL_METADATA_DECLARED_TOOLS_KEY = "declared_tools" as const;

/** Structured slice of skill metadata consumed by LiNKskills / governance. */
export type SkillDeclaredToolsMetadata = {
  [K in typeof SKILL_METADATA_DECLARED_TOOLS_KEY]?: string[];
};

export interface SkillRecord {
  id: SkillId;
  name: string;
  version: number;
  status: SkillStatus;
  body_markdown: string;
  /** Includes `declared_tools` (see {@link SKILL_METADATA_DECLARED_TOOLS_KEY}) and `linkaios_admin`. */
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  /** Progressive disclosure: FK to `linkaios.skill_categories`. */
  category_id?: string | null;
  default_model?: string | null;
  skill_mode?: "simple" | "stepped";
  /** Ordered step definitions when `skill_mode` is `stepped`. */
  step_recipe?: unknown;
  /** Authoritative declared tool names (simple + stepped defaults). */
  default_declared_tools?: string[];
  tags?: string[];
}

/** Row from `linkaios.tools` (PostgREST uses snake_case column names). */
export interface ToolRecord {
  id: ToolId;
  name: string;
  version: number;
  status: ToolStatus;
  tool_type: ToolType;
  category: string;
  description: string;
  implementation: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type {
  BuildLinktrendGovernanceResult,
  LinktrendBootstrapAuthorization,
  LinktrendGovernanceApprovedTools,
  LinktrendGovernanceBootstrap,
  LinktrendGovernanceMission,
  LinktrendGovernancePayload,
  LinktrendGovernanceRuntimeInstructions,
  LinktrendGovernanceSkillDeclaredTools,
  LinktrendRuntimeInstructionSegment,
  ToolGovernanceBlock,
} from "./linktrend-governance.js";
