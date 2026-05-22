"use client";

import { AlertTriangle, Brain, MessageSquare, Radio, type LucideIcon } from "lucide-react";

import { SummaryMetricCard, SummaryMetricCardGrid } from "@/components/summary-metric-card";
import { SummaryMetricStatusPill } from "@/components/summary-metric-card/summary-metric-status-pill";
import type { WorkRowTone } from "@/lib/overview-dashboard";

export type WorkStreamKind = "alerts" | "messages" | "sessions" | "brain";

const WORK_STREAM_CONFIG: Record<
  WorkStreamKind,
  { href: string; title: string; icon: LucideIcon }
> = {
  alerts: { href: "/work/alerts", title: "Alerts", icon: AlertTriangle },
  messages: { href: "/work/messages", title: "Messages", icon: MessageSquare },
  sessions: { href: "/work/sessions", title: "Sessions", icon: Radio },
  brain: { href: "/memory?tab=inbox", title: "LiNKbrain inbox", icon: Brain },
};

function WorkStreamStatusPill(props: { tone: WorkRowTone }) {
  return <SummaryMetricStatusPill tone={props.tone} />;
}

export type WorkStreamCardProps = {
  kind: WorkStreamKind;
  tone: WorkRowTone;
  count: number;
  preview: string;
  surfaceClass: string;
};

/** Work dashboard stream tile — client boundary owns icons + status pills. */
export function WorkStreamCard(props: WorkStreamCardProps) {
  const config = WORK_STREAM_CONFIG[props.kind];
  return (
    <SummaryMetricCard
      href={config.href}
      title={config.title}
      icon={config.icon}
      metric={props.count}
      preview={props.preview}
      badge={<WorkStreamStatusPill tone={props.tone} />}
      surfaceClassName={props.surfaceClass}
    />
  );
}

export { SummaryMetricCardGrid } from "@/components/summary-metric-card";
