"use client";

import { Bot, Clock, Radio, Users, WifiOff, type LucideIcon } from "lucide-react";

import {
  SummaryMetricStatusPill,
  WORK_STREAM_STATUS_PILL_LABELS,
  summaryMetricCountPreview,
} from "@/components/summary-metric-card/summary-metric-status-pill";
import { SummaryMetricCard } from "@/components/summary-metric-card/summary-metric-card";
import { SummaryMetricCardGrid } from "@/components/summary-metric-card/summary-metric-card-grid";
import { SUMMARY_METRIC_CARD } from "@/lib/ui-standards";
import type { WorkRowTone } from "@/lib/overview-dashboard";

function fleetCardTone(key: string, value: number, total: number): WorkRowTone {
  if (key === "inactive" && value > 0) return "attention";
  if (key === "offline" && value > 0) return "attention";
  if (key === "online" && total > 0 && value === 0) return "attention";
  if (key === "busy" && value > 0) return "ok";
  return "ok";
}

function FleetStatCard(props: {
  label: string;
  value: number;
  icon: LucideIcon;
  preview: string;
  tone: WorkRowTone;
  href?: string;
}) {
  return (
    <SummaryMetricCard
      href={props.href ?? "/workers"}
      title={props.label}
      icon={props.icon}
      metric={props.value}
      preview={props.preview}
      badge={<SummaryMetricStatusPill tone={props.tone} />}
      surfaceClassName={SUMMARY_METRIC_CARD.surfaceDefault}
    />
  );
}

export function FleetSummaryStatsGrid(props: {
  total: number;
  online: number;
  busy: number;
  idle: number;
  inactive: number;
  className?: string;
}) {
  const offline = Math.max(0, props.total - props.online);
  const cards = [
    {
      key: "total",
      label: "Total",
      value: props.total,
      icon: Users,
      preview: props.total === 0 ? "No LiNKbots yet" : summaryMetricCountPreview(props.total, "LiNKbot"),
      tone: fleetCardTone("total", props.total, props.total),
    },
    {
      key: "online",
      label: "Online",
      value: props.online,
      icon: Radio,
      preview: props.online === 0 ? "None online" : `${props.online} of ${props.total} online`,
      tone: fleetCardTone("online", props.online, props.total),
    },
    {
      key: "busy",
      label: "Busy",
      value: props.busy,
      icon: Bot,
      preview: props.busy === 0 ? "None busy" : summaryMetricCountPreview(props.busy, "busy LiNKbot"),
      tone: fleetCardTone("busy", props.busy, props.total),
    },
    {
      key: "idle",
      label: "Idle",
      value: props.idle,
      icon: Clock,
      preview: props.idle === 0 ? "None idle" : summaryMetricCountPreview(props.idle, "idle LiNKbot"),
      tone: "ok" as const,
    },
    {
      key: "inactive",
      label: "Inactive",
      value: props.inactive,
      icon: WifiOff,
      preview: props.inactive === 0 ? "None inactive" : summaryMetricCountPreview(props.inactive, "inactive LiNKbot"),
      tone: fleetCardTone("inactive", props.inactive, props.total),
    },
  ];

  return (
    <SummaryMetricCardGrid
      className={props.className ?? "lg:grid-cols-5"}
      statusPillLabels={WORK_STREAM_STATUS_PILL_LABELS}
    >
      {cards.map((card) => (
        <FleetStatCard
          key={card.key}
          label={card.label}
          value={card.value}
          icon={card.icon}
          preview={card.preview}
          tone={card.tone}
        />
      ))}
    </SummaryMetricCardGrid>
  );
}
