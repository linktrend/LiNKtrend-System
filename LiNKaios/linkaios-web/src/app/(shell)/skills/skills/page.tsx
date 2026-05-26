import { listSkills } from "@linktrend/linklogic-sdk";
import type { SkillRecord } from "@linktrend/shared-types";

import { AddSkillHeaderAction } from "@/components/linkskills-header-actions";
import { LinkskillsHubNav } from "@/components/linkskills-hub-nav";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { SkillsCatalogTable, type SkillCatalogRow } from "@/components/skills-catalog-table";
import { SkillsSemanticDiscovery } from "@/components/skills-semantic-discovery";
import { computeCapabilitiesSliceStats, type CapabilitiesSliceStatRow } from "@/lib/capabilities-slice-stats";
import { readSkillAdminFlags } from "@/lib/skills-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { mergeSkillCatalogWithDemo } from "@/lib/ui-mocks/skills-tools-catalog-demo";
import { CapabilitiesCatalogStatsGrid } from "@/components/summary-metric-card";

export const dynamic = "force-dynamic";

function toRow(s: SkillRecord): SkillCatalogRow {
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

export default async function SkillsCatalogPage() {
  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = isUiMocksEnabled();
  const { data, error } = await listSkills(supabase, { limit: 400 });

  if (error && !uiMocksEnabled) {
    return (
      <main className="space-y-6">
        <ShellPageHeaderClient title="Skills" subtitle="Packaged procedures in the LinkSkills catalogue." />
        <p className="text-sm text-amber-800 dark:text-amber-200">The skills catalogue could not be loaded.</p>
      </main>
    );
  }

  const apiRows = ((data ?? []) as SkillRecord[]).map(toRow);
  const rows = uiMocksEnabled ? mergeSkillCatalogWithDemo(apiRows) : apiRows;
  const fixtures = rows.filter((r) => r.isFixture);
  const live = rows.filter((r) => !r.isFixture);
  const catalogueRows = live.length > 0 ? [...live, ...fixtures] : fixtures;

  const stats = computeCapabilitiesSliceStats(
    rows.map(
      (r): CapabilitiesSliceStatRow => ({
        status: r.status,
        published: r.published,
        runtimeEnabled: r.runtimeEnabled,
        isFixture: r.isFixture,
      }),
    ),
    new Set(["deprecated"]),
    "Deprecated",
  );

  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title="Skills"
        subtitle="Governed procedure packages — SKILL.md playbooks, scripts, references, and declared tool bindings LiNKbots invoke when leases allow."
        actions={<AddSkillHeaderAction />}
      />
      <LinkskillsHubNav />

      {error && uiMocksEnabled ? (
        <p className="max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          Catalogue data is unavailable; showing sample rows for layout review only.
        </p>
      ) : null}

      <CapabilitiesCatalogStatsGrid
        total={stats.total}
        approved={stats.approved}
        draft={stats.draft}
        sunset={stats.sunset}
        sunsetLabel={stats.sunsetLabel}
      />

      <SkillsSemanticDiscovery />

      {catalogueRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No skills in catalogue</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            No skills are available yet. Ask your workspace administrator to publish skills, then refresh.
          </p>
        </div>
      ) : (
        <SkillsCatalogTable rows={catalogueRows} />
      )}
    </main>
  );
}
