/**
 * Shared column sizing for Skills and Tools catalogue tables so both screens
 * render paired 9-column layouts with matching widths.
 */
export const CAPABILITY_CATALOG_TABLE_CLASS =
  "table-fixed min-w-[1200px] w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800";

export function CapabilityCatalogColGroup() {
  return (
    <colgroup>
      <col className="w-[12%]" />
      <col className="w-[14%]" />
      <col className="w-[9%]" />
      <col className="w-[17%]" />
      <col className="w-[11%]" />
      <col className="w-[10%]" />
      <col className="w-[10%]" />
      <col className="w-[9%]" />
      <col className="w-[8%]" />
    </colgroup>
  );
}
