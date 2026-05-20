import Link from "next/link";

import { listTools } from "@linktrend/linklogic-sdk";
import type { ToolRecord } from "@linktrend/shared-types";

import { CatalogueSplitSections, splitCatalogueRows } from "@/components/catalogue-sections";
import { LinkskillsGlossaryBrief } from "@/components/linkskills-glossary";
import { LinkskillsHubNav } from "@/components/linkskills-hub-nav";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { ToolsCatalogTable, type ToolCatalogRow } from "@/components/tools-catalog-table";
import { readToolAdminFlags } from "@/lib/tools-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { mergeToolCatalogWithDemo } from "@/lib/ui-mocks/skills-tools-catalog-demo";
import { BUTTON } from "@/lib/ui-standards";

export const dynamic = "force-dynamic";

function toRow(t: ToolRecord): ToolCatalogRow {
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

export default async function SkillsToolsPage() {
  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = isUiMocksEnabled();
  const { data, error } = await listTools(supabase, { limit: 400 });

  if (error && !uiMocksEnabled) {
    return (
      <main className="space-y-6">
        <ShellPageHeaderClient title="Tools" subtitle="Callable actions in the LinkSkills catalogue." showRefresh={false} />
        <p className="text-sm text-red-700 dark:text-red-400">{error.message}</p>
      </main>
    );
  }

  const apiRows = ((data ?? []) as ToolRecord[]).map(toRow);
  const rows = uiMocksEnabled ? mergeToolCatalogWithDemo(apiRows) : apiRows;
  const { fixtures, live } = splitCatalogueRows(rows);

  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title="Tools"
        subtitle="Callable API, script, MCP, and browser actions — governed by leases and policy."
        actions={
          <Link href="/skills/tools/new" className={`${BUTTON.primaryRow} h-fit shrink-0`} title="Creates a draft tool in Postgres when live DB is available">
            Add tool
          </Link>
        }
      />
      <LinkskillsHubNav />

      {error && uiMocksEnabled ? (
        <p className="max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          Live tools data is unavailable; showing sample rows for layout review.
        </p>
      ) : null}

      <LinkskillsGlossaryBrief kind="tools" />

      <CatalogueSplitSections
        hasFixtures={fixtures.length > 0}
        hasLive={live.length > 0}
        fixtures={<ToolsCatalogTable rows={fixtures} />}
        live={<ToolsCatalogTable rows={live} />}
        empty={
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No tools in catalogue</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Publish tools from the workspace editor when the registry is available.</p>
          </div>
        }
      />
    </main>
  );
}
