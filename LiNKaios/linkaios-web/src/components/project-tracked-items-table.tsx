import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { DomainStatusPill } from "@/components/ui/status-pill";
import { DATA_TABLE } from "@/lib/ui-standards";
import {
  sortProjectTrackedItems,
  trackedItemStatusDomain,
  type ProjectTrackedItem,
} from "@/lib/project-tracked-items";

function formatUpdated(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProjectTrackedItemsTable(props: {
  kind: "workflow" | "issue";
  title: string;
  items: ProjectTrackedItem[];
  emptyMessage: string;
}) {
  const rows = sortProjectTrackedItems(props.items);
  const domain = trackedItemStatusDomain(props.kind);
  const nameHeader = props.kind === "workflow" ? "Phase" : "Issue";

  return (
    <section aria-label={props.title} className={DATA_TABLE.shell}>
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{props.title}</h2>
      </div>
      <div className={DATA_TABLE.scrollBody}>
        <DataTable>
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[14%]" />
            <col className="w-[36%]" />
            <col className="w-[16%]" />
          </colgroup>
          <DataTableHead>
            <tr>
              <th className={DT.thTextInset}>{nameHeader}</th>
              <th className={DT.thControl}>
                <div className={DT.controlInner}>Status</div>
              </th>
              <th className={DT.thTextInset}>Detail</th>
              <th className={DT.thTextInset}>Updated</th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {rows.length === 0 ? (
              <DataTableEmptyRow colSpan={4}>{props.emptyMessage}</DataTableEmptyRow>
            ) : (
              rows.map((row) => (
                <DataTableRow key={row.id}>
                  <td className={DT.tdClipInset}>
                    <span className={`${DT.tdTextSpan} font-medium text-zinc-900 dark:text-zinc-100`} title={row.title}>
                      {row.title}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                      {row.id}
                    </span>
                  </td>
                  <td className={DT.tdControl}>
                    <div className={DT.controlInner}>
                      <DomainStatusPill domain={domain} status={row.status} equalWidth />
                    </div>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={`${DT.tdTextSpan} text-xs text-zinc-600 dark:text-zinc-400`} title={row.detail ?? undefined}>
                      {row.detail ?? "—"}
                    </span>
                  </td>
                  <td className={`${DT.tdClipInset} whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400`}>
                    {formatUpdated(row.updatedAt)}
                  </td>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </DataTable>
      </div>
    </section>
  );
}
