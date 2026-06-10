"use client";

import { Archive, Eye, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { archiveTool, updateToolPublishFlags } from "@/app/(shell)/skills/tools/actions";
import { LifecyclePill } from "@/components/catalog-ui";
import { catalogueRowHighlightClass } from "@/components/capability-catalog-shared";
import { CapabilityCatalogColGroup, CAPABILITY_CATALOG_TABLE_CLASS } from "@/components/capability-catalog-table-layout";
import { DataTableIconAction, DataTableShell, DT, TableBoolToggle } from "@/components/data-table";
import { useAppRole } from "@/components/role-preview-provider";
import { useAppSurface } from "@/components/app-surface-provider";
import { canEditLinkskillsCatalogue, canToggleTenantSkillOrTool } from "@/lib/app-roles";
import { useOrgToolPolicy } from "@/lib/org-tool-policy";

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

export function ToolsCatalogTable(props: { rows: ToolCatalogRow[]; runtimeOnly?: boolean }) {
  const runtimeOnly = props.runtimeOnly ?? false;
  const router = useRouter();
  const { href: appHref } = useAppSurface();
  const [pending, startTransition] = useTransition();
  const { kind, role } = useAppRole();
  const canEditCatalogue = canEditLinkskillsCatalogue(kind, role);
  const canToggleTenant = canToggleTenantSkillOrTool(kind, role);
  const showRuntimeColumn = runtimeOnly || kind !== "licensor";
  const { hydrated, orgEnabledById, setOrgEnabled } = useOrgToolPolicy(props.rows);

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

  const availableColumnLabel = kind === "licensor" ? "Published" : "For Company";

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
            {runtimeOnly ? null : (
              <th className={DT.thControl}>
                <div className={DT.controlInner}>{availableColumnLabel}</div>
              </th>
            )}
            {showRuntimeColumn ? (
              <th className={DT.thControl}>
                <div className={DT.controlInner}>Runtime</div>
              </th>
            ) : null}
            <th className={DT.thControl}>
              <div className={DT.controlInner}>Actions</div>
            </th>
          </tr>
        </thead>
        <tbody className={DT.tbody}>
          {props.rows.map((r) => {
            const tenantEnabled = hydrated ? (orgEnabledById.get(r.id) ?? r.published) : r.published;
            const displayPublished = kind === "licensee" ? tenantEnabled : r.published;

            return (
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
                {runtimeOnly ? null : (
                  <td className={DT.tdControl}>
                    <TableBoolToggle
                      on={displayPublished}
                      disabled={
                        pending ||
                        r.status !== "approved" ||
                        r.isFixture ||
                        (kind === "licensee" ? !canToggleTenant : !canEditCatalogue)
                      }
                      ariaLabel={`${availableColumnLabel}: ${r.name}`}
                      onToggle={(pub) => {
                        if (kind === "licensee") {
                          setOrgEnabled(r.id, pub);
                          return;
                        }
                        void applyFlags(r.id, pub, pub ? r.runtimeEnabled : false);
                      }}
                    />
                  </td>
                )}
                {showRuntimeColumn ? (
                  <td className={DT.tdControl}>
                    <TableBoolToggle
                      on={r.runtimeEnabled}
                      disabled={
                        canEditCatalogue
                          ? pending || r.status !== "approved" || (!runtimeOnly && !r.published) || r.isFixture
                          : true
                      }
                      ariaLabel={`Runtime: ${r.name}`}
                      onToggle={(on) => void applyFlags(r.id, r.published, on)}
                    />
                  </td>
                ) : null}
                <td className={DT.tdControl}>
                  <div className={DT.actionsRow}>
                    <DataTableIconAction icon={Eye} label={`Open ${r.name}`} href={appHref(`/skills/tools/${r.id}`)} />
                    {canEditCatalogue ? (
                      <>
                        <DataTableIconAction
                          icon={Pencil}
                          label={`Edit ${r.name}`}
                          href={r.isFixture ? undefined : appHref(`/skills/tools/${r.id}`)}
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
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </DataTableShell>
  );
}
