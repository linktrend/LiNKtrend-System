"use client";

import {
  Bot,
  FileStack,
  GitBranch,
  ListChecks,
  Plug,
  ShieldAlert,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { SummaryMetricCard } from "@/components/summary-metric-card/summary-metric-card";
import { SummaryMetricCardGrid, SummaryMetricCardSection } from "@/components/summary-metric-card/summary-metric-card-grid";
import { suiteProfileHref, suiteSampleOutputsTabLabel } from "@/lib/suites-page-copy";
import type { WorkRowTone } from "@/lib/overview-dashboard";
import { SUMMARY_METRIC_CARD } from "@/lib/ui-standards";
import { StatusPill } from "@/components/ui/status-pill";

export type ModuleOverviewStatKey =
  | "processes"
  | "workflows"
  | "issues"
  | "linkbots"
  | "automations"
  | "capabilities"
  | "outputTypes"
  | "sideEffects";

export type ModuleOverviewStats = Record<ModuleOverviewStatKey, number>;

export const MODULE_OPERATIONAL_PILL_LABELS = ["Offline", "Warning", "Online"] as const;

function ModuleOperationalStatusPill(props: { tone: WorkRowTone; show: boolean }) {
  if (!props.show) return null;

  const widthProps = { equalWidthLabels: MODULE_OPERATIONAL_PILL_LABELS } as const;

  if (props.tone === "critical") {
    return <StatusPill label="Offline" tone="danger" {...widthProps} />;
  }
  if (props.tone === "attention") {
    return <StatusPill label="Warning" tone="warning" {...widthProps} />;
  }
  return <StatusPill label="Online" tone="success" {...widthProps} />;
}

export function moduleOverviewStatTone(
  moduleId: string,
  key: ModuleOverviewStatKey,
  count: number,
  owned: boolean,
): WorkRowTone {
  if (!owned) return "ok";
  if (count === 0) return "critical";

  const overrides: Record<string, Partial<Record<ModuleOverviewStatKey, WorkRowTone>>> = {
    linksites: {
      linkbots: "attention",
      automations: "attention",
      sideEffects: "attention",
    },
    "lexos-litigation": {
      capabilities: "attention",
      sideEffects: "attention",
    },
    "content-creation": {
      sideEffects: "attention",
    },
  };

  return overrides[moduleId]?.[key] ?? "ok";
}

function moduleOverviewStatPreview(
  key: ModuleOverviewStatKey,
  count: number,
  tone: WorkRowTone,
  owned: boolean,
): string {
  if (count === 0) {
    if (key === "outputTypes") return "No output templates published yet";
    if (key === "sideEffects") return "No governed side effects declared";
    if (key === "capabilities") return "No capabilities bound yet";
    return "Not configured for this module";
  }

  if (!owned) {
    switch (key) {
      case "processes":
        return `${count} module${count === 1 ? "" : "s"} in catalogue`;
      case "workflows":
        return `${count} phase${count === 1 ? "" : "s"} across modules`;
      case "issues":
        return `${count} issue template${count === 1 ? "" : "s"} defined`;
      case "linkbots":
        return `${count} LiNKbot role${count === 1 ? "" : "s"} in module map`;
      case "automations":
        return `${count} LiNKautowork automation${count === 1 ? "" : "s"}`;
      case "capabilities":
        return `${count} capability${count === 1 ? "" : "ies"}`;
      case "outputTypes":
        return `${count} deliverable type${count === 1 ? "" : "s"} · ${suiteSampleOutputsTabLabel(false)} tab`;
      case "sideEffects":
        return `${count} external action${count === 1 ? "" : "s"} under lease policy`;
    }
  }

  switch (key) {
    case "processes":
      return `${count} module${count === 1 ? "" : "s"} ready to start`;
    case "workflows":
      return `${count} phase groups · suite phase map`;
    case "issues":
      return `${count} task templates · input/output contracts`;
    case "linkbots":
      if (tone === "attention") return `${count} roles · 2 online · 1 warning`;
      if (tone === "critical") return `${count} roles · all offline`;
      return `${count} roles · all online`;
    case "automations":
      if (tone === "attention") return `${count} automations · 1 degraded run`;
      if (tone === "critical") return `${count} automations · execution offline`;
      return `${count} automations · LiNKautowork healthy`;
    case "capabilities":
      if (tone === "attention") return `${count} capabilities · 1 lease expiring`;
      if (tone === "critical") return `${count} capabilities · policy blocked`;
      return `${count} capabilities · leases available`;
    case "outputTypes":
        return `${count} artefact famil${count === 1 ? "y" : "ies"} · ${suiteSampleOutputsTabLabel(true)} tab`;
    case "sideEffects":
      if (tone === "attention") return `${count} actions · 1 draft-only or pending approval`;
      if (tone === "critical") return `${count} actions · blocked by policy`;
      return `${count} governed actions · lease required`;
  }
}

function statHref(suiteId: string, key: ModuleOverviewStatKey): string | undefined {
  switch (key) {
    case "processes":
    case "workflows":
    case "issues":
      return suiteProfileHref(suiteId, "modules");
    case "linkbots":
      return "/workers";
    case "automations":
      return "/skills";
    case "capabilities":
    case "sideEffects":
      return "/skills/connectors";
    case "outputTypes":
      return suiteProfileHref(suiteId, "sample-outputs");
  }
}

function overviewStatHref(suiteId: string, key: ModuleOverviewStatKey, owned: boolean): string | undefined {
  const href = statHref(suiteId, key);
  if (!href) return undefined;
  if (owned) return href;
  if (key === "processes" || key === "workflows" || key === "issues") {
    return suiteProfileHref(suiteId, "modules");
  }
  if (key === "outputTypes") return href;
  return undefined;
}

const MODULE_OVERVIEW_CARDS: {
  key: ModuleOverviewStatKey;
  title: string;
  icon: LucideIcon;
}[] = [
  { key: "processes", title: "Modules", icon: GitBranch },
  { key: "workflows", title: "Phases", icon: Workflow },
  { key: "issues", title: "Issues", icon: ListChecks },
  { key: "linkbots", title: "LiNKbots", icon: Bot },
  { key: "automations", title: "Automations", icon: Zap },
  { key: "capabilities", title: "Capabilities", icon: Plug },
  { key: "outputTypes", title: "Output types", icon: FileStack },
  { key: "sideEffects", title: "Side effects", icon: ShieldAlert },
];

/** Eight summary tiles — 4 per row — for module overview and related profile tabs. */
export function ModuleOverviewStatsGrid(props: {
  suiteId: string;
  owned: boolean;
  stats: ModuleOverviewStats;
  className?: string;
}) {
  return (
    <SummaryMetricCardSection
      title={props.owned ? "Suite Operations" : "Suite Catalogue"}
      aria-label={props.owned ? "Suite operational summary" : "Suite catalogue summary"}
    >
      <SummaryMetricCardGrid className={props.className} statusPillLabels={MODULE_OPERATIONAL_PILL_LABELS}>
        {MODULE_OVERVIEW_CARDS.map((card) => {
          const metric = props.stats[card.key];
          const tone = moduleOverviewStatTone(props.suiteId, card.key, metric, props.owned);
          const preview = moduleOverviewStatPreview(card.key, metric, tone, props.owned);
          return (
            <SummaryMetricCard
              key={card.key}
              href={overviewStatHref(props.suiteId, card.key, props.owned)}
              title={card.title}
              icon={card.icon}
              metric={metric}
              preview={preview}
              badge={<ModuleOperationalStatusPill tone={tone} show={props.owned} />}
              surfaceClassName={SUMMARY_METRIC_CARD.surfaceDefault}
            />
          );
        })}
      </SummaryMetricCardGrid>
    </SummaryMetricCardSection>
  );
}
