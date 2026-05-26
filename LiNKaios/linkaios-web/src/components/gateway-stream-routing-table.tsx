import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { TABLE_COLUMN } from "@/lib/ui-standards";

export type GatewayStreamRoutingRow = {
  stream: string | number;
  project: string;
  notes: string;
  created: string;
};

function cellText(value: string): string {
  return value.trim() ? value : "—";
}

export function GatewayStreamRoutingTable(props: { rows: GatewayStreamRoutingRow[] }) {
  return (
    <section>
      <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">{TABLE_COLUMN.streamRouting}</h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{props.rows.length} row(s)</p>
      <DataTableShell className="mt-2">
        <DataTable size="sm">
          <colgroup>
            <col className="w-[15%]" />
            <col className="w-[25%]" />
            <col className="w-[45%]" />
            <col className="w-[15%]" />
          </colgroup>
          <DataTableHead bordered>
            <tr>
              <th className={DT.thTextInset}>{TABLE_COLUMN.stream}</th>
              <th className={DT.thTextInset}>{TABLE_COLUMN.project}</th>
              <th className={DT.thTextInset}>{TABLE_COLUMN.notes}</th>
              <th className={DT.thTextInset}>{TABLE_COLUMN.created}</th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {props.rows.length === 0 ? (
              <DataTableEmptyRow colSpan={4}>No rows yet.</DataTableEmptyRow>
            ) : (
              props.rows.map((row, i) => (
                <DataTableRow key={i}>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdTextSpan} title={String(row.stream)}>
                      {String(row.stream)}
                    </span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdTextSpan} title={cellText(row.project)}>
                      {cellText(row.project)}
                    </span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdTextSpan} title={cellText(row.notes)}>
                      {cellText(row.notes)}
                    </span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={`${DT.tdTextSpan} whitespace-nowrap`} title={row.created}>
                      {row.created}
                    </span>
                  </td>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </DataTable>
      </DataTableShell>
    </section>
  );
}
