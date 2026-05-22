/**
 * Column sizing for sessions catalogue table (7 columns).
 * Title + summary split like skills name + description.
 */
import { DATA_TABLE } from "@/lib/ui-standards";

export const SESSIONS_CATALOG_TABLE_CLASS = DATA_TABLE.table;

export function SessionsCatalogColGroup() {
  return (
    <colgroup>
      <col className="w-[14%]" />
      <col className="w-[12%]" />
      <col className="w-[11%]" />
      <col className="w-[27%]" />
      <col className="w-[10%]" />
      <col className="w-[12%]" />
      <col className="w-[10%]" />
    </colgroup>
  );
}
