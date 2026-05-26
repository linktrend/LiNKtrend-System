"use client";

import { useStatusPillWidthContext } from "@/components/ui/status-pill-width-provider";
import {
  STATUS_PILL,
  domainStatusPillLabels,
  resolveStatusPill,
  statusPillEqualWidthClass,
  statusPillEqualWidthStyle,
  type StatusDomain,
  type StatusTone,
} from "@/lib/status-colors";

function joinClasses(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function resolveEqualWidth(input: {
  equalWidth?: boolean;
  equalWidthLabels?: readonly string[];
  domain?: StatusDomain;
  contextWidthCh?: number | null;
}): { className: string | false; style?: { width: string; minWidth: string; maxWidth: string } } {
  let labels: readonly string[] | null = null;
  if (input.equalWidthLabels?.length) {
    labels = input.equalWidthLabels;
  } else if (input.equalWidth && input.contextWidthCh != null) {
    const width = `${input.contextWidthCh}ch`;
    return {
      className: `w-[${input.contextWidthCh}ch] min-w-[${input.contextWidthCh}ch] max-w-[${input.contextWidthCh}ch]`,
      style: { width, minWidth: width, maxWidth: width },
    };
  } else if (input.equalWidth && input.domain) {
    labels = domainStatusPillLabels(input.domain);
  }

  if (!labels?.length) return { className: false };

  return {
    className: statusPillEqualWidthClass(labels),
    style: statusPillEqualWidthStyle(labels),
  };
}

export type StatusPillProps = {
  label: string;
  tone?: StatusTone;
  /** Equal fixed width from longest label in this visual group (GLOBAL-001). */
  equalWidth?: boolean;
  /** Explicit labels for this group — include every possible label, not only those currently visible. */
  equalWidthLabels?: readonly string[];
  className?: string;
};

/** Canonical status pill — import this instead of ad-hoc badge classes (UIUX-GLOBAL-001). */
export function StatusPill(props: StatusPillProps) {
  const tone = props.tone ?? "neutral";
  const context = useStatusPillWidthContext();
  const equalWidth = resolveEqualWidth({
    equalWidth: props.equalWidth,
    equalWidthLabels: props.equalWidthLabels,
    contextWidthCh: context?.widthCh,
  });

  return (
    <span
      className={joinClasses(
        STATUS_PILL.base,
        STATUS_PILL.tone[tone],
        equalWidth.className,
        props.className,
      )}
      style={equalWidth.style}
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
  equalWidthLabels?: readonly string[];
  className?: string;
}) {
  const { label, tone } = resolveStatusPill(props.domain, props.status);
  const context = useStatusPillWidthContext();
  const equalWidth = resolveEqualWidth({
    equalWidth: props.equalWidth,
    equalWidthLabels: props.equalWidthLabels,
    domain: props.domain,
    contextWidthCh: context?.widthCh,
  });

  return (
    <span
      className={joinClasses(
        STATUS_PILL.base,
        STATUS_PILL.tone[tone],
        equalWidth.className,
        props.className,
      )}
      style={equalWidth.style}
    >
      {label}
    </span>
  );
}
