import { normalizeDeclaredToolNames } from "@linktrend/linklogic-sdk";
import type { SkillRecord } from "@linktrend/shared-types";
import { SKILL_METADATA_DECLARED_TOOLS_KEY } from "@linktrend/shared-types";

export type SkillAdminFlags = {
  published: boolean;
  runtimeEnabled: boolean;
  category: string;
  description: string;
};

const ADMIN_KEY = "linkaios_admin";

export function readSkillAdminFlags(skill: SkillRecord): SkillAdminFlags {
  const meta = skill.metadata ?? {};
  const admin = meta[ADMIN_KEY] as Record<string, unknown> | undefined;
  const category =
    (admin?.category as string) ||
    (meta.category as string) ||
    (typeof meta.group === "string" ? meta.group : "General");
  const description =
    (admin?.description as string) ||
    (meta.description as string) ||
    skill.name.replace(/-/g, " ");
  let published = typeof admin?.published === "boolean" ? admin.published : undefined;
  let runtimeEnabled = typeof admin?.runtime_enabled === "boolean" ? admin.runtime_enabled : undefined;
  if (published === undefined) {
    published = skill.status === "approved";
  }
  if (runtimeEnabled === undefined) {
    runtimeEnabled = published;
  }
  if (!published) {
    runtimeEnabled = false;
  }
  return { published, runtimeEnabled, category, description };
}

export function mergeSkillMetadata(prev: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const admin = { ...((prev[ADMIN_KEY] as Record<string, unknown> | undefined) ?? {}), ...patch };
  return { ...prev, [ADMIN_KEY]: admin };
}

export type SkillScriptRow = { id: string; filename: string; content: string };

const SCRIPTS_KEY = "linkaios_scripts";

export function readSkillScripts(meta: Record<string, unknown>): SkillScriptRow[] {
  const raw = meta[SCRIPTS_KEY];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      if (typeof x !== "object" || x === null) return null;
      const o = x as Record<string, unknown>;
      const id = String(o.id ?? "");
      const filename = String(o.filename ?? "script");
      const content = String(o.content ?? "");
      if (!id) return null;
      return { id, filename, content };
    })
    .filter((x): x is SkillScriptRow => x != null);
}

export function writeSkillScripts(meta: Record<string, unknown>, scripts: SkillScriptRow[]): Record<string, unknown> {
  return { ...meta, [SCRIPTS_KEY]: scripts };
}

export type SkillFileRow = { id: string; name: string; kind: "asset" | "reference"; bytes?: number };

const ASSETS_KEY = "linkaios_assets";
const REFS_KEY = "linkaios_references";

export function readSkillFileRows(meta: Record<string, unknown>): { assets: SkillFileRow[]; references: SkillFileRow[] } {
  const map = (raw: unknown, kind: SkillFileRow["kind"]): SkillFileRow[] => {
    if (!Array.isArray(raw)) return [];
    const out: SkillFileRow[] = [];
    for (const x of raw) {
      if (typeof x !== "object" || x === null) continue;
      const o = x as Record<string, unknown>;
      const id = String(o.id ?? "");
      const name = String(o.name ?? "file");
      const bytes = typeof o.bytes === "number" ? o.bytes : undefined;
      if (!id) continue;
      out.push({ id, name, kind, bytes });
    }
    return out;
  };
  return {
    assets: map(meta[ASSETS_KEY], "asset"),
    references: map(meta[REFS_KEY], "reference"),
  };
}

export function writeSkillAssets(meta: Record<string, unknown>, assets: SkillFileRow[]): Record<string, unknown> {
  return { ...meta, [ASSETS_KEY]: assets };
}

export function writeSkillReferences(meta: Record<string, unknown>, references: SkillFileRow[]): Record<string, unknown> {
  return { ...meta, [REFS_KEY]: references };
}

export function writeSkillDeclaredTools(meta: Record<string, unknown>, toolNames: string[]): Record<string, unknown> {
  return { ...meta, [SKILL_METADATA_DECLARED_TOOLS_KEY]: normalizeDeclaredToolNames(toolNames) };
}
