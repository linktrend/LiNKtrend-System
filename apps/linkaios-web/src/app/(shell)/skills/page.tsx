import { listSkills, listTools } from "@linktrend/linklogic-sdk";
import type { SkillRecord, ToolRecord } from "@linktrend/shared-types";

import { CapabilitiesHubCards, type CapabilitiesHubSliceStats } from "@/components/capabilities-hub-cards";
import type { SkillCatalogRow } from "@/components/skills-catalog-table";
import type { ToolCatalogRow } from "@/components/tools-catalog-table";
import { readSkillAdminFlags } from "@/lib/skills-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { mergeSkillCatalogWithDemo, mergeToolCatalogWithDemo } from "@/lib/ui-mocks/skills-tools-catalog-demo";
import { readToolAdminFlags } from "@/lib/tools-admin";

export const dynamic = "force-dynamic";

type StatRow = {
  status: string;
  published: boolean;
  runtimeEnabled: boolean;
  isFixture?: boolean;
};

function skillToRow(s: SkillRecord): SkillCatalogRow {
  const flags = readSkillAdminFlags(s);
  return {
    id: String(s.id),
    name: s.name,
    type: "Skill",
    category: flags.category,
    description: flags.description,
    published: flags.published,
    runtimeEnabled: flags.runtimeEnabled,
    status: s.status,
    updated_at: s.updated_at,
  };
}

function toolToRow(t: ToolRecord): ToolCatalogRow {
  const flags = readToolAdminFlags(t);
  return {
    id: String(t.id),
    name: t.name,
    tool_type: t.tool_type,
    category: t.category,
    description: t.description,
    published: flags.published,
    runtimeEnabled: flags.runtimeEnabled,
    status: t.status,
    updated_at: t.updated_at,
  };
}

function hubSliceStats(rows: StatRow[], sunsetStatuses: Set<string>, sunsetLabel: string): CapabilitiesHubSliceStats {
  return {
    total: rows.length,
    approved: rows.filter((r) => r.status === "approved").length,
    draft: rows.filter((r) => r.status === "draft").length,
    sunset: rows.filter((r) => sunsetStatuses.has(r.status)).length,
    sunsetLabel,
    publishedOn: rows.filter((r) => r.published).length,
    runtimeOn: rows.filter((r) => r.runtimeEnabled).length,
    fixtures: rows.filter((r) => r.isFixture).length,
  };
}

export default async function SkillsCapabilitiesHubPage() {
  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = isUiMocksEnabled();

  const [skillsRes, toolsRes] = await Promise.all([
    listSkills(supabase, { limit: 400 }),
    listTools(supabase, { limit: 400 }),
  ]);

  const skillsErr = skillsRes.error;
  const toolsErr = toolsRes.error;
  const blocking = !uiMocksEnabled && (skillsErr || toolsErr);

  if (blocking) {
    return (
      <main>
        <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">LiNKskills</h1>
          <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">All Capabilities</p>
        </header>
        <p className="mt-6 text-sm text-amber-800 dark:text-amber-200">
          Capabilities could not be loaded. Check your connection and database migrations, then refresh.
        </p>
        {skillsErr ? <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">Skills: {skillsErr.message}</p> : null}
        {toolsErr ? <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">Tools: {toolsErr.message}</p> : null}
      </main>
    );
  }

  const skillRows = mergeSkillCatalogWithDemo(((skillsRes.data ?? []) as SkillRecord[]).map(skillToRow));
  const toolRows = mergeToolCatalogWithDemo(((toolsRes.data ?? []) as ToolRecord[]).map(toolToRow));

  const skillsStats = hubSliceStats(
    skillRows.map((r) => ({
      status: r.status,
      published: r.published,
      runtimeEnabled: r.runtimeEnabled,
      isFixture: r.isFixture,
    })),
    new Set(["deprecated"]),
    "Deprecated",
  );
  const toolsStats = hubSliceStats(
    toolRows.map((r) => ({
      status: r.status,
      published: r.published,
      runtimeEnabled: r.runtimeEnabled,
      isFixture: r.isFixture,
    })),
    new Set(["archived"]),
    "Archived",
  );

  return (
    <main className="space-y-8">
      <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">LiNKskills</h1>
        <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">All Capabilities</p>
        <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Compare catalogue health at a glance. Open each area for full tables, editing, and governance actions.
        </p>
      </header>

      {uiMocksEnabled && (skillsErr || toolsErr) ? (
        <p className="max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          Some catalogue data is unavailable; sample rows may be included in counts for layout review.
        </p>
      ) : null}

      <CapabilitiesHubCards skills={skillsStats} tools={toolsStats} />
    </main>
  );
}
