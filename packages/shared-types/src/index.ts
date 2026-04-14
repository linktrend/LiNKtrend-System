/** Core identity — immutable agent id in architecture terms. */
export type AgentId = string;

export type MissionId = string;

export type SkillId = string;

export type TraceId = string;

export type AgentStatus = "active" | "inactive" | "retired";

export type MissionStatus =
  | "draft"
  | "assigned"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type SkillStatus = "draft" | "approved" | "deprecated";

export interface AgentRecord {
  id: AgentId;
  display_name: string;
  status: AgentStatus;
  created_at: string;
  updated_at: string;
}

export interface MissionRecord {
  id: MissionId;
  title: string;
  status: MissionStatus;
  primary_agent_id: AgentId | null;
  created_at: string;
  updated_at: string;
}

export interface SkillRecord {
  id: SkillId;
  name: string;
  version: number;
  status: SkillStatus;
  body_markdown: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
