"use client";

import Link from "next/link";
import { Activity, FolderArchive, GitBranch, Users } from "lucide-react";

import { CardBodyInset, TitledCardHeader } from "@/components/titled-card-header";
import { DomainStatusPill, StatusPill, type StatusPillProps } from "@/components/ui/status-pill";
import { BUTTON, CARD } from "@/lib/ui-standards";

export const VENTURE_CARD_SHELL =
  "rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950";

const STAGE_STATUS_PILL_LABELS = ["Completed", "In progress", "Pending"] as const;
const SQUAD_STATUS_PILL_LABELS = ["Active", "Standby", "Offline"] as const;

function stageStatusPill(status: string): Pick<StatusPillProps, "label" | "tone"> {
  if (status === "completed") return { label: "Completed", tone: "success" };
  if (status === "in_progress") return { label: "In progress", tone: "active" };
  return { label: "Pending", tone: "warning" };
}

function squadStatusPill(status: string): Pick<StatusPillProps, "label" | "tone"> {
  if (status === "active") return { label: "Active", tone: "active" };
  if (status === "standby") return { label: "Standby", tone: "warning" };
  return { label: "Offline", tone: "neutral" };
}

export function VentureStageProgression(props: {
  stages: Array<{ id: string; name: string; status: string }>;
}) {
  return (
    <section className={VENTURE_CARD_SHELL}>
      <TitledCardHeader icon={GitBranch} title="Stage Progression" />
      <CardBodyInset className="mt-4">
        <ol className="flex flex-wrap items-start gap-4">
          {props.stages.map((stage) => {
            const pill = stageStatusPill(stage.status);
            return (
              <li key={stage.id} className="flex min-w-[7.5rem] flex-col items-center gap-2 text-center">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold tabular-nums text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-700">
                  {stage.status === "completed" ? "✓" : stage.id}
                </span>
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{stage.name}</span>
                <StatusPill
                  label={pill.label}
                  tone={pill.tone}
                  equalWidthLabels={STAGE_STATUS_PILL_LABELS}
                />
              </li>
            );
          })}
        </ol>
      </CardBodyInset>
    </section>
  );
}

export function VentureSquadPanel(props: {
  ventureId: string;
  squad: {
    technicalLead: string;
    frontendSpecialist: string;
    backendSpecialist: string;
    productOwner: string;
  };
}) {
  return (
    <section className={VENTURE_CARD_SHELL}>
      <TitledCardHeader icon={Users} title="Active Squad" />
      <CardBodyInset className="mt-4 space-y-1">
        <SquadMemberRow role="Technical Lead" botId={props.squad.technicalLead} status="active" />
        <SquadMemberRow role="Product Owner" botId={props.squad.productOwner} status="standby" />
        <SquadMemberRow role="Frontend Specialist" botId={props.squad.frontendSpecialist} status="active" />
        <SquadMemberRow role="Backend Specialist" botId={props.squad.backendSpecialist} status="active" />
      </CardBodyInset>
      <div className={`mt-4 border-t border-zinc-200 pt-4 ${CARD.contentInset} dark:border-zinc-800`}>
        <Link href={`/suites/linkapps/ventures/${props.ventureId}/squad`} className={BUTTON.editTextLink}>
          Manage squad →
        </Link>
      </div>
    </section>
  );
}

function SquadMemberRow(props: { role: string; botId: string; status: string }) {
  const pill = squadStatusPill(props.status);
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{props.role}</div>
        <div className="truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">{props.botId}</div>
      </div>
      <StatusPill label={pill.label} tone={pill.tone} equalWidthLabels={SQUAD_STATUS_PILL_LABELS} />
    </div>
  );
}

export function VentureArtifactsPanel(props: {
  blueprintRef: string;
  businessPlanRef: string;
  artifacts: {
    appRepoRef: string;
    serviceCredentialsRef: string;
    deploymentRefs: string[];
  };
}) {
  return (
    <section className={VENTURE_CARD_SHELL}>
      <TitledCardHeader icon={FolderArchive} title="Artifacts & References" />
      <CardBodyInset className="mt-4 space-y-2 text-sm">
        <ArtifactRow label="App Repository" value={props.artifacts.appRepoRef} />
        <ArtifactRow label="Service Credentials" value={props.artifacts.serviceCredentialsRef} />
        <ArtifactRow label="Blueprint" value={props.blueprintRef} />
        <ArtifactRow label="Business Plan" value={props.businessPlanRef} />
        <div className="pt-2">
          <span className="text-zinc-500 dark:text-zinc-400">Deployments</span>
          <ul className="mt-1 space-y-1">
            {props.artifacts.deploymentRefs.map((ref) => (
              <li
                key={ref}
                className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              >
                {ref}
              </li>
            ))}
          </ul>
        </div>
      </CardBodyInset>
    </section>
  );
}

function ArtifactRow(props: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-zinc-500 dark:text-zinc-400">{props.label}</span>
      <span className="max-w-[55%] truncate rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
        {props.value}
      </span>
    </div>
  );
}

export function VentureActivityPanel(props: {
  items: Array<{ timestamp: string; event: string; description: string }>;
}) {
  return (
    <section className={VENTURE_CARD_SHELL}>
      <TitledCardHeader icon={Activity} title="Recent Activity" />
      <CardBodyInset className="mt-4 space-y-3 text-sm">
        {props.items.map((item) => (
          <ActivityItem
            key={`${item.timestamp}-${item.event}`}
            timestamp={item.timestamp}
            event={item.event}
            description={item.description}
          />
        ))}
      </CardBodyInset>
    </section>
  );
}

function ActivityItem(props: { timestamp: string; event: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <time className="shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
        {new Date(props.timestamp).toLocaleTimeString()}
      </time>
      <div className="min-w-0">
        <div className="font-mono text-xs text-sky-700 dark:text-sky-300">{props.event}</div>
        <div className="text-zinc-600 dark:text-zinc-400">{props.description}</div>
      </div>
    </div>
  );
}

export function VentureStatusPills(props: { phase: string; status: string; updatedAt: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusPill label={`Phase ${props.phase}`} tone="info" />
      <DomainStatusPill domain="workflow" status={props.status} />
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        Updated {new Date(props.updatedAt).toLocaleString()}
      </span>
    </div>
  );
}
