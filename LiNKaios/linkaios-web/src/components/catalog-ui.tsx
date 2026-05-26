"use client";

import { DomainStatusPill, StatusPill } from "@/components/ui/status-pill";
import { LIFECYCLE_PILL_LABELS } from "@/lib/status-colors";
import { TableBoolToggle } from "@/components/data-table/table-bool-toggle";

export function LifecyclePill(props: { status: string }) {
  const lifecycleTone =
    props.status === "approved"
      ? "success"
      : props.status === "deprecated" || props.status === "archived"
        ? "warning"
        : "neutral";
  const lifecycleLabel =
    props.status === "draft"
      ? "Draft"
      : props.status === "approved"
        ? "Approved"
        : props.status === "deprecated"
          ? "Deprecated"
          : props.status === "archived"
            ? "Archived"
            : props.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return <StatusPill label={lifecycleLabel} tone={lifecycleTone} equalWidthLabels={LIFECYCLE_PILL_LABELS} />;
}

export function ConnectorStatusPill(props: { status: string }) {
  return <DomainStatusPill domain="connector" status={props.status} equalWidth />;
}

/** @deprecated Use TableBoolToggle from @/components/data-table */
export function CatalogueBoolToggle(props: {
  on: boolean;
  disabled?: boolean;
  onToggle: (next: boolean) => void;
  ariaLabel: string;
}) {
  return <TableBoolToggle {...props} ariaLabel={props.ariaLabel} />;
}

export { TableBoolToggle } from "@/components/data-table/table-bool-toggle";
