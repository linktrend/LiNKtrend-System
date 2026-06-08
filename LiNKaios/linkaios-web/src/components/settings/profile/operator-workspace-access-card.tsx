"use client";

import { useState } from "react";
import { Building2, ChevronRight, FolderKanban, Layers, LayoutGrid, Network, Shield, Workflow } from "lucide-react";

import {
  isPlatformAccessScope,
  type OperatorAccessItem,
  type OperatorAccessScope,
} from "@/lib/operator-access-scope";
import { CARD, PROFILE_CARD } from "@/lib/ui-standards";

function AccessRow(props: {
  label: string;
  count: number;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className={PROFILE_CARD.accessRow} onClick={props.onClick}>
      <span className="flex min-w-0 items-center gap-3">
        <span className="text-zinc-400 dark:text-zinc-500">{props.icon}</span>
        <span className={PROFILE_CARD.accessRowLabel}>{props.label}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className={PROFILE_CARD.accessRowMeta}>{props.count}</span>
        <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />
      </span>
    </button>
  );
}

function AccessDetailList(props: { items: OperatorAccessItem[] }) {
  if (props.items.length === 0) {
    return <p className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">None assigned</p>;
  }

  return (
    <ul className="space-y-1 px-1 pb-2">
      {props.items.map((item) => (
        <li
          key={item.id}
          className="rounded-md px-2 py-1.5 text-sm text-zinc-700 dark:text-zinc-300"
        >
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
          {item.detail ? (
            <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{item.detail}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function AccessProcessList(props: { items: OperatorAccessItem[] }) {
  if (props.items.length === 0) {
    return <p className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">None assigned</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-2 px-3 pb-3 sm:grid-cols-2 lg:grid-cols-3">
      {props.items.map((item) => (
        <li
          key={item.id}
          className="rounded-md px-2 py-1.5 text-sm text-zinc-700 dark:text-zinc-300"
        >
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
          {item.detail ? (
            <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{item.detail}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

type WorkspaceAccessPanel = "companies" | "projects" | "modules" | "processes" | null;
type PlatformAccessPanel = "role" | "licensees" | "sections" | null;

function PlatformAccessCard(props: { accessScope: Extract<OperatorAccessScope, { variant: "platform" }> }) {
  const [expanded, setExpanded] = useState<PlatformAccessPanel>(null);

  function toggle(panel: PlatformAccessPanel) {
    setExpanded((current) => (current === panel ? null : panel));
  }

  const roleItem: OperatorAccessItem = {
    id: props.accessScope.roleTier,
    label: props.accessScope.roleTierLabel,
    detail: "LiNKtrend operator platform tier",
  };

  return (
    <section className={`${PROFILE_CARD.shell} space-y-4`}>
      <div className="flex items-start gap-3">
        <Network className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" aria-hidden />
        <div>
          <h2 className={PROFILE_CARD.sectionTitle}>Platform access</h2>
          <p className={PROFILE_CARD.sectionDescription}>
            Your licensor operator tier and assigned licensees. Contact a Super Admin to request changes.
          </p>
        </div>
      </div>

      <div
        className={`${CARD.contentInset} divide-y divide-zinc-200/70 rounded-xl border border-zinc-200/60 dark:divide-zinc-800/70 dark:border-zinc-800/60`}
      >
        <AccessRow
          label="Platform role"
          count={1}
          icon={<Shield className="h-4 w-4" aria-hidden />}
          onClick={() => toggle("role")}
        />
        {expanded === "role" ? <AccessDetailList items={[roleItem]} /> : null}

        <AccessRow
          label="Assigned licensees"
          count={props.accessScope.licensees.length}
          icon={<Building2 className="h-4 w-4" aria-hidden />}
          onClick={() => toggle("licensees")}
        />
        {expanded === "licensees" ? <AccessDetailList items={props.accessScope.licensees} /> : null}

        <AccessRow
          label="Admin sections"
          count={props.accessScope.navSections.length}
          icon={<LayoutGrid className="h-4 w-4" aria-hidden />}
          onClick={() => toggle("sections")}
        />
        {expanded === "sections" ? <AccessProcessList items={props.accessScope.navSections} /> : null}
      </div>
    </section>
  );
}

function WorkspaceAccessCard(props: { accessScope: Extract<OperatorAccessScope, { variant: "workspace" }> }) {
  const [expanded, setExpanded] = useState<WorkspaceAccessPanel>(null);

  function toggle(panel: WorkspaceAccessPanel) {
    setExpanded((current) => (current === panel ? null : panel));
  }

  return (
    <section className={`${PROFILE_CARD.shell} space-y-4`}>
      <div className="flex items-start gap-3">
        <Network className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" aria-hidden />
        <div>
          <h2 className={PROFILE_CARD.sectionTitle}>Workspace access</h2>
          <p className={PROFILE_CARD.sectionDescription}>
            Operational scope assigned to your account. Contact an admin to request changes.
          </p>
        </div>
      </div>

      <div
        className={`${CARD.contentInset} divide-y divide-zinc-200/70 rounded-xl border border-zinc-200/60 dark:divide-zinc-800/70 dark:border-zinc-800/60`}
      >
        <AccessRow
          label="Companies"
          count={props.accessScope.companies.length}
          icon={<Building2 className="h-4 w-4" aria-hidden />}
          onClick={() => toggle("companies")}
        />
        {expanded === "companies" ? <AccessDetailList items={props.accessScope.companies} /> : null}

        <AccessRow
          label="Projects"
          count={props.accessScope.projects.length}
          icon={<FolderKanban className="h-4 w-4" aria-hidden />}
          onClick={() => toggle("projects")}
        />
        {expanded === "projects" ? <AccessDetailList items={props.accessScope.projects} /> : null}

        <AccessRow
          label="Suites"
          count={props.accessScope.modules.length}
          icon={<Layers className="h-4 w-4" aria-hidden />}
          onClick={() => toggle("modules")}
        />
        {expanded === "modules" ? <AccessDetailList items={props.accessScope.modules} /> : null}

        <AccessRow
          label="Modules"
          count={props.accessScope.processes.length}
          icon={<Workflow className="h-4 w-4" aria-hidden />}
          onClick={() => toggle("processes")}
        />
        {expanded === "processes" ? <AccessProcessList items={props.accessScope.processes} /> : null}
      </div>
    </section>
  );
}

export function OperatorWorkspaceAccessCard(props: { accessScope: OperatorAccessScope }) {
  if (isPlatformAccessScope(props.accessScope)) {
    return <PlatformAccessCard accessScope={props.accessScope} />;
  }

  return <WorkspaceAccessCard accessScope={props.accessScope} />;
}
