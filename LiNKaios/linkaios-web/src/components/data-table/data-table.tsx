import { DATA_TABLE } from "@/lib/ui-standards";

import { DT } from "./data-table-classes";

/** Root `<table>` for Data Table surfaces — always pair with {@link DataTableShell}. */
export function DataTable(props: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}) {
  const sizeClass = props.size === "sm" ? "text-xs" : "";
  return (
    <table className={[DATA_TABLE.table, sizeClass, props.className].filter(Boolean).join(" ")}>
      {props.children}
    </table>
  );
}

export function DataTableHead(props: { children: React.ReactNode; bordered?: boolean }) {
  return <thead className={props.bordered ? DT.theadBordered : DT.thead}>{props.children}</thead>;
}

export function DataTableBody(props: { children: React.ReactNode }) {
  return <tbody className={DT.tbody}>{props.children}</tbody>;
}

export function DataTableRow(props: {
  children: React.ReactNode;
  /** Single-line rows with less vertical padding (settings catalogues). */
  compact?: boolean;
  multiline?: boolean;
  className?: string;
}) {
  const rowClass = [
    props.compact ? DT.trCompact : props.multiline ? DT.trMultiline : DT.tr,
    props.className,
  ]
    .filter(Boolean)
    .join(" ");
  return <tr className={rowClass}>{props.children}</tr>;
}

export function DataTableEmptyRow(props: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={props.colSpan} className={DT.emptyCell}>
        {props.children}
      </td>
    </tr>
  );
}
