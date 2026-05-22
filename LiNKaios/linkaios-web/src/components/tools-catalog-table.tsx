"use client";

import { Archive, Eye, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { archiveTool, updateToolPublishFlags } from "@/app/(shell)/skills/tools/actions";
import { LifecyclePill } from "@/components/catalog-ui";
import { catalogueRowHighlightClass } from "@/components/capability-catalog-shared";
import { CapabilityCatalogColGroup, CAPABILITY_CATALOG_TABLE_CLASS } from "@/components/capability-catalog-table-layout";
import { DataTableIconAction, DataTableShell, DT, TableBoolToggle } from "@/components/data-table";

export type ToolCatalogRow = {
  id: string;
  name: string;
  tool_type: string;
  category: string;
  description: string;
  published: boolean;
  runtimeEnabled: boolean;
  status: string;
  updated_at: string;
  /** When set, server mutations are disabled (UI fixture from `LINKAIOS_UI_MOCKS`). */
  isFixture?: boolean;
};

export function ToolsCatalogTable(props: { rows: ToolCatalogRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function applyFlags(id: string, published: boolean, runtimeEnabled: boolean) {
    startTransition(async () => {
      await updateToolPublishFlags(id, published, runtimeEnabled);
      router.refresh();
    });
  }

  async function onArchive(id: string) {
    if (!window.confirm("Archive this tool? It will be removed from the runtime catalogue until restored.")) return;
    startTransition(async () => {
      const r = await archiveTool(id);
      if (!r.ok) window.alert(r.error);
      router.refresh();
    });
  }

  return (
    <DataTableShell scrollableBody>
      <table className={CAPABILITY_CATALOG_TABLE_CLASS}>
        <CapabilityCatalogColGroup />
        <thead className={DT.thead}>
          <tr>
            <th className={DT.thTextInset}>Category</th>
            <th className={DT.thTextInset}>Name</th>
            <th className={DT.thTextInset}>Description</th>
            <th className={DT.thControl}>
              <div className={DT.controlInner}>Lifecycle</div>
            </th>
            <th className={DT.thControl}>
              <div className={DT.controlInner}>Available</div>
            </th>
            <th className={DT.thControl}>
              <div className={DT.controlInner}>Runtime</div>
            </th>
            <th className={DT.thControl}>
              <div className={DT.controlInner}>Actions</div>
            </th>
          </tr>
        </thead>
        <tbody className={DT.tbody}>
          {props.rows.map((r) => (
            <tr
              key={r.id}
              className={
                catalogueRowHighlightClass(r) +
                DT.trMultiline +
                (r.status === "archived" ? " text-zinc-500 dark:text-zinc-500" : " text-zinc-800 dark:text-zinc-200")
              }
            >
              <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                <span className={DT.tdTextSpan} title={r.category}>
                  {r.category}
                </span>
              </td>
              <td className={`${DT.tdClipInset} text-sm font-medium text-zinc-900 dark:text-zinc-100`}>
                <span className={DT.tdTextSpan} title={r.name}>
                  {r.name}
                </span>
              </td>
              <td className={DT.tdClipInset}>
                <span className={DT.tdWrapSpan} title={r.description}>
                  {r.description}
                </span>
              </td>
              <td className={DT.tdControl}>
                <div className={DT.controlInner}>
                  <LifecyclePill status={r.status} />
                </div>
              </td>
              <td className={DT.tdControl}>
                <TableBoolToggle
                  on={r.published}
                  disabled={pending || r.status !== "approved" || r.isFixture}
                  ariaLabel={`Available: ${r.name}`}
                  onToggle={(pub) => void applyFlags(r.id, pub, pub ? r.runtimeEnabled : false)}
                />
              </td>
              <td className={DT.tdControl}>
                <TableBoolToggle
                  on={r.runtimeEnabled}
                  disabled={pending || r.status !== "approved" || !r.published || r.isFixture}
                  ariaLabel={`Runtime: ${r.name}`}
                  onToggle={(on) => void applyFlags(r.id, r.published, on)}
                />
              </td>
              <td className={DT.tdControl}>
                <div className={DT.actionsRow}>
                  <DataTableIconAction icon={Eye} label={`Open ${r.name}`} href={`/skills/tools/${r.id}`} />
                  <DataTableIconAction
                    icon={Pencil}
                    label={`Edit ${r.name}`}
                    href={r.isFixture ? undefined : `/skills/tools/${r.id}`}
                    disabled={r.isFixture}
                  />
                  <DataTableIconAction
                    icon={Archive}
                    label={`Archive ${r.name}`}
                    disabled={pending || r.status !== "approved" || r.isFixture}
                    onClick={() => {
                      if (r.isFixture || r.status !== "approved") return;
                      void onArchive(r.id);
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableShell>
  );
}
