"use client";

import { DATA_TABLE } from "@/lib/ui-standards";

export function DataTableShell(props: {
  children: React.ReactNode;
  scrollableBody?: boolean;
  className?: string;
}) {
  const shellClass = [DATA_TABLE.shell, props.className].filter(Boolean).join(" ");

  if (props.scrollableBody) {
    return (
      <div className={shellClass}>
        <div className={DATA_TABLE.scrollBody}>{props.children}</div>
      </div>
    );
  }

  return <div className={`${shellClass} ${DATA_TABLE.scrollX}`}>{props.children}</div>;
}
