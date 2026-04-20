import type { ToolRecord } from "@linktrend/shared-types";

import { mergeSkillMetadata } from "@/lib/skills-admin";

export type ToolAdminFlags = {
  published: boolean;
  runtimeEnabled: boolean;
};

const ADMIN_KEY = "linkaios_admin";

/** Publish/runtime flags in `metadata.linkaios_admin`; only meaningful when `status === approved`. */
export function readToolAdminFlags(tool: ToolRecord): ToolAdminFlags {
  if (tool.status !== "approved") {
    return { published: false, runtimeEnabled: false };
  }
  const meta = tool.metadata ?? {};
  const admin = meta[ADMIN_KEY] as Record<string, unknown> | undefined;
  const published = typeof admin?.published === "boolean" ? admin.published : true;
  let runtimeEnabled = typeof admin?.runtime_enabled === "boolean" ? admin.runtime_enabled : published;
  if (!published) runtimeEnabled = false;
  return { published, runtimeEnabled };
}

export function mergeToolMetadata(prev: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  return mergeSkillMetadata(prev, patch);
}

export const TOOL_TYPE_LABELS: Record<string, string> = {
  executable_bundle: "Executable bundle",
  http: "HTTP-defined",
  registry_reference: "Registry reference",
  plugin: "Plugin",
  mcp_server: "MCP server",
};

/** Short plain-language gloss for the technical type row on the tool page. */
export const TOOL_TYPE_HELP: Record<string, string> = {
  executable_bundle: "Runs as a packaged executable on the worker host.",
  http: "Calls approved outbound HTTP endpoints with fixed hosts and paths.",
  registry_reference: "Points at an entry in an external tool registry.",
  plugin: "Loads a host-managed plugin module.",
  mcp_server: "Connects to an MCP server for tool calls.",
};
