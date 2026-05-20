import Link from "next/link";

import { LifecyclePill } from "@/components/catalog-ui";
import { LinkskillsHubNav } from "@/components/linkskills-hub-nav";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { CATALOGUE_FIXTURE_TITLE } from "@/components/capability-catalog-shared";
import type { SkillCatalogRow } from "@/components/skills-catalog-table";
import { BUTTON } from "@/lib/ui-standards";

/** Read-only demo skill workspace for fixture rows during UI review. */
export function DemoSkillDetailView(props: { skill: SkillCatalogRow }) {
  const s = props.skill;
  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title={s.name}
        subtitle="Demo skill — read-only layout preview. Live skills open in the full workspace editor."
        showRefresh={false}
      />
      <LinkskillsHubNav />

      <p className="max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        {CATALOGUE_FIXTURE_TITLE} This page shows catalogue metadata only; editing and runtime execution are disabled.
      </p>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Snapshot</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Category</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">{s.category}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Lifecycle</dt>
              <dd>
                <LifecyclePill status={s.status} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Available</dt>
              <dd className="font-medium">{s.published ? "On" : "Off"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Runtime enabled</dt>
              <dd className="font-medium">{s.runtimeEnabled ? "On" : "Off"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Updated</dt>
              <dd className="tabular-nums text-zinc-700 dark:text-zinc-300">{s.updated_at?.slice(0, 10) ?? "—"}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Description</h2>
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{s.description}</p>
          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            Full workspace includes SKILL.md body, declared tools, scripts, references, and assets once wired to Postgres.
          </p>
        </article>
      </section>

      <Link href="/skills/skills" className={BUTTON.secondaryRow}>
        Back to Skills catalogue
      </Link>
    </main>
  );
}
