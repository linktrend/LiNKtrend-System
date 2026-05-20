"use client";

import { Archive, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { archiveSkill, updateSkillPublishFlags } from "@/app/(shell)/skills/actions";
import { CatalogueBoolToggle, LifecyclePill } from "@/components/catalog-ui";
import {
  CATALOGUE_ACTIONS_ROW_CLASS,
  CATALOGUE_FIXTURE_LABEL,
  CATALOGUE_FIXTURE_TITLE,
} from "@/components/capability-catalog-shared";
import { CAPABILITY_CATALOG_TABLE_CLASS, CapabilityCatalogColGroup } from "@/components/capability-catalog-table-layout";
import { TABLE } from "@/lib/ui-standards";

export type SkillCatalogRow = {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  published: boolean;
  runtimeEnabled: boolean;
  status: string;
  updated_at: string;
  /** When set, server mutations are disabled (UI fixture from `LINKAIOS_UI_MOCKS`). */
  isFixture?: boolean;
};

export function SkillsCatalogTable(props: { rows: SkillCatalogRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function applyFlags(id: string, published: boolean, runtimeEnabled: boolean) {
    startTransition(async () => {
      await updateSkillPublishFlags(id, published, runtimeEnabled);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <table className={CAPABILITY_CATALOG_TABLE_CLASS}>
        <CapabilityCatalogColGroup />
        <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className={`px-4 py-3 ${TABLE.thText}`}>Category</th>
            <th className={`px-4 py-3 ${TABLE.thText}`}>Name</th>
            <th className={`px-4 py-3 ${TABLE.thText}`}>Type</th>
            <th className={`px-4 py-3 ${TABLE.thText}`}>Description</th>
            <th className={`px-4 py-3 ${TABLE.thControl}`}>
              <div className={TABLE.thControlInner}>Lifecycle</div>
            </th>
            <th className={`px-4 py-3 ${TABLE.thControl}`}>
              <div className={TABLE.thControlInner}>Available</div>
            </th>
            <th className={`px-4 py-3 ${TABLE.thControl}`}>
              <div className={TABLE.thControlInner}>Enabled</div>
            </th>
            <th className={`px-4 py-3 ${TABLE.thText}`}>Updated</th>
            <th className={`px-4 py-3 ${TABLE.thControl}`}>
              <div className={TABLE.thControlInner}>Actions</div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {props.rows.map((r) => (
            <tr
              key={r.id}
              className={
                (r.isFixture ? "bg-amber-50/40 dark:bg-amber-950/15 " : "") + "text-zinc-800 dark:text-zinc-200"
              }
            >
              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                <div className="flex min-w-0 flex-col items-start gap-1">
                  <span className="whitespace-normal">{r.category}</span>
                  {r.isFixture ? (
                    <span
                      title={CATALOGUE_FIXTURE_TITLE}
                      className="inline-flex max-w-full cursor-help rounded-full bg-amber-50 px-2 py-0.5 text-left text-[10px] font-medium leading-snug text-amber-900 ring-1 ring-amber-200/90 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800"
                    >
                      {CATALOGUE_FIXTURE_LABEL}
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">{r.name}</td>
              <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">{r.type}</td>
              <td className="max-w-xs px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">{r.description}</td>
              <td className={`px-4 py-3 ${TABLE.thControl}`}>
                <div className={TABLE.thControlInner}>
                  <LifecyclePill status={r.status} />
                </div>
              </td>
              <td className={`px-4 py-3 ${TABLE.thControl}`}>
                <div className="flex items-center justify-center gap-2">
                  <CatalogueBoolToggle
                    on={r.published}
                    disabled={pending || r.status === "deprecated" || r.isFixture}
                    ariaLabel={`Available: ${r.name}`}
                    onToggle={(pub) => void applyFlags(r.id, pub, pub ? r.runtimeEnabled : false)}
                  />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{r.published ? "On" : "Off"}</span>
                </div>
              </td>
              <td className={`px-4 py-3 ${TABLE.thControl}`}>
                <div className="flex items-center justify-center gap-2">
                  <CatalogueBoolToggle
                    on={r.runtimeEnabled}
                    disabled={pending || r.status === "deprecated" || !r.published || r.isFixture}
                    ariaLabel={`Enabled: ${r.name}`}
                    onToggle={(on) => void applyFlags(r.id, r.published, on)}
                  />
                  <span className={r.published ? "text-xs text-zinc-500 dark:text-zinc-400" : "text-xs text-zinc-400"}>
                    {r.runtimeEnabled ? "On" : "Off"}
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                {r.updated_at?.slice(0, 10) ?? "—"}
              </td>
              <td className={`px-4 py-3 ${TABLE.thControl}`}>
                <div className={CATALOGUE_ACTIONS_ROW_CLASS}>
                  {r.isFixture ? (
                    <span
                      className="inline-flex shrink-0 rounded-lg p-2 text-zinc-400 dark:text-zinc-500"
                      title={`${CATALOGUE_FIXTURE_TITLE} Edit is disabled.`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </span>
                  ) : (
                    <Link
                      href={`/skills/${r.id}`}
                      className="inline-flex shrink-0 rounded-lg p-2 text-violet-800 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-950/50"
                      title="Edit skill in workspace"
                      aria-label={`Edit ${r.name}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                  <button
                    type="button"
                    disabled={pending || r.status !== "approved" || r.isFixture}
                    title={
                      r.isFixture
                        ? "Demo row — cannot archive"
                        : r.status !== "approved"
                          ? "Archive is only available for approved skills"
                          : "Archive (set deprecated)"
                    }
                    aria-label={`Archive ${r.name}`}
                    onClick={() => {
                      if (r.isFixture || r.status !== "approved") return;
                      if (!window.confirm("Archive this skill? It will be marked deprecated and unpublished.")) return;
                      startTransition(async () => {
                        const res = await archiveSkill(r.id);
                        if (!res.ok) window.alert(res.error);
                        router.refresh();
                      });
                    }}
                    className="inline-flex shrink-0 rounded-lg p-2 text-amber-900 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-amber-200 dark:hover:bg-amber-950/40"
                  >
                    <Archive className="h-4 w-4 shrink-0" aria-hidden />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
