"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Archive, Eye, Pencil } from "lucide-react";

import { archiveSkill, updateSkillPublishFlags } from "@/app/(shell)/skills/actions";
import { LifecyclePill } from "@/components/catalog-ui";
import { catalogueRowHighlightClass } from "@/components/capability-catalog-shared";
import { CapabilityCatalogColGroup, CAPABILITY_CATALOG_TABLE_CLASS } from "@/components/capability-catalog-table-layout";
import { DataTableIconAction, DataTableShell, DT, TableBoolToggle } from "@/components/data-table";
import { FixturePill } from "@/components/fixture-pill";
import { useAppRole } from "@/components/role-preview-provider";
import {
  canEditLinkskillsCatalogue,
  canToggleTenantSkillOrTool,
} from "@/lib/app-roles";
import { useOrgSkillPolicy } from "@/lib/org-skill-policy";

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
  isFixture?: boolean;
};

export function SkillsCatalogTable(props: { rows: SkillCatalogRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toggleMessage, setToggleMessage] = useState<string | null>(null);
  const { kind, role } = useAppRole();
  const canEditCatalogue = canEditLinkskillsCatalogue(kind, role);
  const canToggleTenant = canToggleTenantSkillOrTool(kind, role);
  const canManagePlatform = canEditCatalogue;
  const { hydrated, orgEnabledById, setOrgEnabled } = useOrgSkillPolicy(props.rows);

  async function applyRuntimeFlags(id: string, published: boolean, runtimeEnabled: boolean) {
    startTransition(async () => {
      const res = await updateSkillPublishFlags(id, published, runtimeEnabled);
      if (res.ok) {
        setToggleMessage("Skill flags saved.");
      } else {
        setToggleMessage(res.error ?? "Could not save skill flags.");
      }
      router.refresh();
    });
  }

  function applyCompanyToggle(r: SkillCatalogRow, enabled: boolean) {
    if (kind === "licensee") {
      setOrgEnabled(r.id, enabled);
      setToggleMessage(enabled ? "Skill enabled for company." : "Skill disabled for company.");
      return;
    }
    if (r.isFixture) return;
    startTransition(async () => {
      const res = await updateSkillPublishFlags(r.id, enabled, enabled ? r.runtimeEnabled : false);
      if (res.ok) {
        setToggleMessage("Skill publish flag saved.");
      } else {
        setToggleMessage(res.error ?? "Could not save skill flag.");
      }
      router.refresh();
    });
  }

  const companyColumnLabel = kind === "licensor" ? "Published" : "For Company";

  return (
    <DataTableShell scrollableBody>
      {toggleMessage ? (
        <p role="status" className="border-b border-zinc-100 px-4 py-2 text-xs text-emerald-700 dark:border-zinc-800 dark:text-emerald-400">
          {toggleMessage}
        </p>
      ) : null}
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
              <div className={DT.controlInner}>{companyColumnLabel}</div>
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
          {props.rows.map((r) => {
            const orgEnabled = hydrated ? (orgEnabledById.get(r.id) ?? r.published) : r.published;
            const canToggleRuntime =
              canEditCatalogue &&
              orgEnabled &&
              r.status !== "deprecated" &&
              r.status !== "draft" &&
              !r.isFixture &&
              !pending;
            const canToggleCompany =
              (canToggleTenant || canManagePlatform) &&
              hydrated &&
              r.status !== "deprecated" &&
              !pending &&
              (!r.isFixture || kind === "licensee");

            return (
              <tr key={r.id} className={catalogueRowHighlightClass(r) + DT.trMultiline}>
                <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                  <span className={DT.tdTextSpan} title={r.category}>
                    {r.category}
                  </span>
                </td>
                <td className={`${DT.tdClipInset} text-sm font-medium text-zinc-900 dark:text-zinc-100`}>
                  <span className={`${DT.tdTextSpan} inline-flex items-center gap-2`} title={r.name}>
                    {r.name}
                    {r.isFixture ? <FixturePill /> : null}
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
                    on={kind === "licensee" ? orgEnabled : r.published}
                    disabled={!canToggleCompany}
                    ariaLabel={`${companyColumnLabel}: ${r.name}`}
                    onToggle={(enabled) => applyCompanyToggle(r, enabled)}
                  />
                </td>
                <td className={DT.tdControl}>
                  <TableBoolToggle
                    on={r.runtimeEnabled}
                    disabled={!canToggleRuntime}
                    ariaLabel={`Runtime: ${r.name}`}
                    onToggle={(rt) => void applyRuntimeFlags(r.id, r.published, rt)}
                  />
                </td>
                <td className={DT.tdControl}>
                  <div className={DT.actionsRow}>
                    <DataTableIconAction icon={Eye} label={`View ${r.name}`} href={`/skills/${r.id}`} />
                    {canEditCatalogue ? (
                      <>
                        <DataTableIconAction
                          icon={Pencil}
                          label={`Edit ${r.name}`}
                          href={r.isFixture ? undefined : `/skills/${r.id}`}
                          disabled={r.isFixture}
                        />
                        <DataTableIconAction
                          icon={Archive}
                          label={`Archive ${r.name}`}
                          tone="danger"
                          disabled={pending || r.isFixture}
                          onClick={() => {
                            if (r.isFixture) return;
                            if (!window.confirm("Archive this skill?")) return;
                            startTransition(async () => {
                              await archiveSkill(r.id);
                              router.refresh();
                            });
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
