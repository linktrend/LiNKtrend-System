import { STATUS_PILL, type StatusDomain, type StatusTone, resolveStatusPill } from "@/lib/status-colors";

function joinClasses(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export type StatusPillProps = {
  label: string;
  tone?: StatusTone;
  /** Equal min-width for aligned pill columns (GLOBAL-001). */
  equalWidth?: boolean;
  /** Wider equal width — matches attention queue badges (~7.25rem). */
  wideEqualWidth?: boolean;
  className?: string;
};

/** Canonical status pill — import this instead of ad-hoc badge classes (UIUX-GLOBAL-001). */
export function StatusPill(props: StatusPillProps) {
  const tone = props.tone ?? "neutral";
  return (
    <span
      className={joinClasses(
        STATUS_PILL.base,
        STATUS_PILL.tone[tone],
        props.equalWidth && STATUS_PILL.equalWidth,
        props.wideEqualWidth && STATUS_PILL.wideEqualWidth,
        props.className,
      )}
    >
      {props.label}
    </span>
  );
}

/** Resolve domain status string then render. */
export function DomainStatusPill(props: {
  domain: StatusDomain;
  status: string;
  equalWidth?: boolean;
  wideEqualWidth?: boolean;
  className?: string;
}) {
  const { label, tone } = resolveStatusPill(props.domain, props.status);
  return (
    <StatusPill
      label={label}
      tone={tone}
      equalWidth={props.equalWidth}
      wideEqualWidth={props.wideEqualWidth}
      className={props.className}
    />
  );
}
