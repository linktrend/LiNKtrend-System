import Link from "next/link";

import { listTools } from "@linktrend/linklogic-sdk";
import type { ToolRecord } from "@linktrend/shared-types";

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
      <main>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">LiNKskills · Tools</h1>
        <p className="mt-4 text-sm text-red-700 dark:text-red-400">{error.message}</p>
        <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          The tools registry may be missing from this environment. Apply the latest LiNKaios database migrations, then
          refresh.
        </p>
      </main>
    );
  }

  const apiRows = ((data ?? []) as ToolRecord[]).map(toRow);
  const rows = uiMocksEnabled ? mergeToolCatalogWithDemo(apiRows) : apiRows;

  return (
    <main className="space-y-8">
      <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">LiNKskills · Tools</h1>
        {error && uiMocksEnabled ? (
          <p className="mt-3 max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
            Live tools data is unavailable; showing sample rows for layout review.
          </p>
        ) : null}
      </header>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Catalogue</h2>
          <Link href="/skills/tools/new" className={BUTTON.primaryRow}>
            Add tool
          </Link>
        </div>
        <div className="mt-4">
          <ToolsCatalogTable rows={rows} />
        </div>
      </section>
    </main>
  );
}
