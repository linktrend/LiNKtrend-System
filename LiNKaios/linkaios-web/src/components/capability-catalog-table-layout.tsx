/**
 * Shared column sizing for Skills and Tools catalogue tables (7 columns).
 * Fits shell content width without horizontal scroll; name/description separated.
 */
import { DATA_TABLE } from "@/lib/ui-standards";

export const CAPABILITY_CATALOG_TABLE_CLASS = DATA_TABLE.table;

/** Skills and Tools catalogue tables — 7 columns (category, name, description, lifecycle, available, runtime, actions). */
export function CapabilityCatalogColGroup() {
  return (
    <colgroup>
      <col className="w-[11%]" />
      <col className="w-[19%]" />
      <col className="w-[27%]" />
      <col className="w-[11%]" />
      <col className="w-[10%]" />
      <col className="w-[10%]" />
      <col className="w-[12%]" />
    </colgroup>
  );
}
