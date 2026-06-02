"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  Bot,
  Building2,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  Layers3,
  Network,
  ShieldAlert,
  Sparkles,
  Upload,
  UserPlus,
  Wrench,
  Zap,
} from "lucide-react";

import { AttentionQueueRow } from "@/components/action-queue";
import { CompanySummaryPanel } from "@/components/company-summary-panel";
import { LicenseeOnboardingBanner, LicenseeOnboardingWizard } from "@/components/onboarding/licensee-onboarding-wizard";
import { MvoProofCard } from "@/components/mvo-proof-card";
import { useAppRole } from "@/components/role-preview-provider";
import { ShellPageHeader } from "@/components/shell-page-header";
import {
  OverviewProjectsSummaryGrid,
  OverviewWorkforceSummaryGrid,
  SummaryMetricCardSection,
} from "@/components/summary-metric-card";
import { useLicenseeContext } from "@/hooks/use-licensee-context";
import { resolveCompanyFixture, COMPANY_DEFAULT_FIXTURE_ID, modulesForCompany } from "@/lib/company-fixtures";
import {
  useOnboardingProgress,
  type LicenseeOnboardingStepId,
} from "@/lib/onboarding-progress";
import type { OverviewData, SystemStatusLevel } from "@/lib/overview-dashboard";
import type { MvoProofSnapshot } from "@/lib/mvo-proof-snapshot";
import { toOperatorSystemIssueLabel } from "@/lib/operator-copy";
import { BUTTON } from "@/lib/ui-standards";

function statusBarTone(level: SystemStatusLevel): string {
  if (level === "critical") return "border-red-300 bg-red-50 text-red-950 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-50";
  if (level === "attention")
    return "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-50";
  return "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-50";
}

function statusLabel(level: SystemStatusLevel): string {
  if (level === "critical") return "Critical";
  if (level === "attention") return "Attention";
  return "OK";
}

function issueIcon(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes("llm") || lower.includes("assistant")) {
    return <Zap className="h-4 w-4 shrink-0" aria-hidden />;
  }
  if (lower.includes("tool") || lower.includes("skill")) {
    return <Wrench className="h-4 w-4 shrink-0" aria-hidden />;
  }
  return <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />;
}

const GOVERNANCE_CHECKLIST: {
  stepId: LicenseeOnboardingStepId;
  title: string;
  description: string;
  href: string;
  icon: typeof Network;
}[] = [
  {
    stepId: "organisation",
    title: "Confirm company structure",
    description: "Legal entities and brands match how you operate.",
    href: "/company",
    icon: Network,
  },
  {
    stepId: "invite-admin",
    title: "Invite Admin",
    description: "Add an executive who can supervise projects and bots.",
    href: "/settings/access",
    icon: UserPlus,
  },
  {
    stepId: "first-suite",
    title: "Subscribe first suite",
    description: "Product packages include LiNKbots, automations, and skills for live work.",
    href: "/suites/marketplace",
    icon: Layers3,
  },
  {
    stepId: "integration",
    title: "Connect an integration",
    description: "Link CRM, email, or other tools your suites need to run.",
    href: "/skills/connectors",
    icon: Sparkles,
  },
];

function GovernanceChecklist() {
  const { progress, hydrated, complete } = useOnboardingProgress();
  if (!hydrated || complete) return null;

  const pending = GOVERNANCE_CHECKLIST.filter((item) => !progress.completedSteps.includes(item.stepId));
  if (pending.length === 0) return null;

  return (
    <section className="space-y-3" aria-label="Setup checklist">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden />
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Setup checklist</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {pending.map((item) => (
          <Link
            key={item.stepId}
            href={item.href}
            className="group flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <item.icon className="h-4 w-4 shrink-0 text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100" aria-hidden />
              {item.title}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.description}</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-400">
              Open <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function OrganisationSnapshot() {
  const { companyId } = useLicenseeContext();
  const company = resolveCompanyFixture(companyId);

  return (
    <section className="space-y-3" aria-label="Organisation snapshot">
      <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Organisation snapshot</h2>
      <CompanySummaryPanel company={company} />
    </section>
  );
}

export function OverviewHome(props: { data: OverviewData; mvoProof: MvoProofSnapshot }) {
  const { data } = props;
  const { role } = useAppRole();
  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin";
  const isUser = role === "user";
  const showOrgSnapshot = isAdmin || isSuperAdmin;
  const showSummaryGrids = !isUser;

  const [statusOpen, setStatusOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const fetchedAt = data.fetchedAt ? new Date(data.fetchedAt).getTime() : Date.now();
  const issueCount = data.systemStatus.issues.length;
  const moduleRows = modulesForCompany(COMPANY_DEFAULT_FIXTURE_ID);
  const activeModules = moduleRows.filter((m) => m.status === "active" || m.status === "trialing").length;
  const trialingModules = moduleRows.filter((m) => m.status === "trialing").length;

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const schemaHint =
    data.setupError?.includes("schema") || data.setupError?.toLowerCase().includes("pgrst");

  const statusSummary =
    data.systemStatus.level === "critical"
      ? "One or more services need attention before routine operations."
      : data.systemStatus.level === "attention"
        ? "Some checks reported warnings — review linked areas when you can."
        : "Core connectivity checks look healthy for this snapshot.";

  const refreshedLabel = useMemo(() => {
    if (!mounted) return null;
    const diffSeconds = Math.max(0, Math.round((now - fetchedAt) / 1000));
    if (diffSeconds < 60) return "Refreshed just now";
    const mins = Math.floor(diffSeconds / 60);
    if (mins < 60) return `Refreshed ${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    return `Refreshed ${hrs} hr ago`;
  }, [mounted, now, fetchedAt]);

  const systemStatusAriaLabel = `System status: ${statusLabel(data.systemStatus.level)}${
    issueCount > 0 ? `, ${issueCount} issue${issueCount === 1 ? "" : "s"}` : ", no issues"
  }`;

  return (
    <main className="space-y-8 pb-16">
      {isSuperAdmin ? <LicenseeOnboardingWizard /> : null}

      <ShellPageHeader
        title="Overview"
        subtitle={
          isUser
            ? "Your work inbox and alerts — jump in where you are needed."
            : "See what needs your attention, check team status, and jump to common tasks."
        }
        refreshedLabel={refreshedLabel}
      />

      {isSuperAdmin ? <LicenseeOnboardingBanner /> : null}

      <MvoProofCard snapshot={props.mvoProof} />

      {isSuperAdmin ? <GovernanceChecklist /> : null}

      <section className={`rounded-xl border p-3 shadow-sm ${statusBarTone(data.systemStatus.level)}`} aria-label="System status">
        <button
          type="button"
          onClick={() => setStatusOpen((s) => !s)}
          className="flex w-full items-center justify-between gap-3 text-left"
          aria-expanded={statusOpen}
          aria-label={systemStatusAriaLabel}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
            <div className="inline-flex min-w-0 items-center gap-2">
              <p className="text-sm font-semibold leading-tight">System: {statusLabel(data.systemStatus.level)}</p>
              {issueCount > 0 ? (
                <span
                  className="rounded-full bg-red-600/15 px-2 py-0.5 text-[11px] font-semibold text-red-800 ring-1 ring-red-300/80 dark:bg-red-500/20 dark:text-red-100 dark:ring-red-700/70"
                  aria-hidden
                >
                  {issueCount} issue{issueCount === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
          </div>
          {statusOpen ? <ChevronUp className="h-4 w-4 shrink-0 opacity-75" aria-hidden /> : <ChevronDown className="h-4 w-4 shrink-0 opacity-75" aria-hidden />}
        </button>
        <p className="mt-1 pl-8 text-xs opacity-90">{statusSummary}</p>

        {statusOpen && issueCount > 0 ? (
          <ul className="mt-3 space-y-1 rounded-lg border border-zinc-200 bg-white pt-1 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100">
            {data.systemStatus.issues.map((issue, i) => (
              <li key={`${issue.href}-${i}`}>
                <Link
                  href={issue.href}
                  className="flex items-center justify-between gap-2 rounded-md px-3 py-2 font-medium text-zinc-800 transition hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    {issueIcon(issue.label)}
                    <span className="truncate">{toOperatorSystemIssueLabel(issue.label)}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    Fix <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {statusOpen && issueCount === 0 ? (
          <p className="mt-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950">
            No open issues.
          </p>
        ) : null}
      </section>

      {data.setupError ? (
        <section className="max-w-2xl rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-medium">Database connectivity issue</p>
          <p className="mt-2 text-amber-900/90 dark:text-amber-100/90">
            {schemaHint ? (
              <>
                The database may not be fully set up yet. An administrator needs to expose the required schemas and run
                migrations before live data can load.
              </>
            ) : (
              toOperatorSystemIssueLabel(data.setupError)
            )}
          </p>
        </section>
      ) : null}

      <section>
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          What needs attention
        </h2>
        {data.attentionItems.length === 0 ? (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/25 dark:text-emerald-100">
            Nothing queued — alerts, messages, sessions, and LiNKbrain inbox look clear.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {data.attentionItems.map((item) => (
              <li key={item.id}>
                <AttentionQueueRow item={item} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {showOrgSnapshot ? <OrganisationSnapshot /> : null}

      {showSummaryGrids ? (
        <>
          <div className="flex flex-col gap-6">
            <section className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <SummaryMetricCardSection title="Workforce summary" icon={<Bot className="h-4 w-4" aria-hidden />}>
                <OverviewWorkforceSummaryGrid
                  total={data.workforceSummary.total}
                  online={data.workforceSummary.online}
                  offline={data.workforceSummary.offline}
                  busy={data.workforceSummary.busy}
                  idle={data.workforceSummary.idle}
                  className="mt-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
                />
              </SummaryMetricCardSection>
              <Link href="/workers" className={`${BUTTON.secondaryCardAction} mt-4`}>
                View LiNKbots
              </Link>
            </section>

            <section className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <Layers3 className="h-4 w-4" aria-hidden />
                Suites at a glance
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <span className="text-emerald-900 dark:text-emerald-100">Active subscriptions</span>
                  <span className="font-semibold tabular-nums text-emerald-950 dark:text-emerald-50">{activeModules}</span>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-sky-200 bg-sky-50/60 px-3 py-2 dark:border-sky-900/40 dark:bg-sky-950/20">
                  <span className="text-sky-900 dark:text-sky-100">On trial</span>
                  <span className="font-semibold tabular-nums text-sky-950 dark:text-sky-50">{trialingModules}</span>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">Catalogue size</span>
                  <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{moduleRows.length}</span>
                </li>
              </ul>
              <Link href="/suites/my-suites" className={`${BUTTON.secondaryCardAction} mt-4`}>
                Manage suites
              </Link>
            </section>
          </div>

          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <SummaryMetricCardSection
              title="Projects summary"
              icon={<FolderKanban className="h-4 w-4" aria-hidden />}
            >
              <OverviewProjectsSummaryGrid
                draft={data.projectsSummary.draft}
                active={data.projectsSummary.active}
                completed={data.projectsSummary.completed}
                needsAttention={data.projectsSummary.needsAttention}
                className="mt-4 grid-cols-2 lg:grid-cols-4"
              />
            </SummaryMetricCardSection>
            <Link href="/projects" className={`${BUTTON.secondaryCardAction} mt-4`}>
              View projects
            </Link>
          </section>
        </>
      ) : null}

      {!isUser ? (
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Quick actions</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { href: "/workers", icon: Sparkles, title: "Add LiNKbot", hint: "Deploy a new fleet worker" },
              { href: "/projects/new", icon: FolderKanban, title: "Create project", hint: "Start client work in a suite module" },
              { href: "/skills/skills", icon: Wrench, title: "Add skill", hint: "Publish a governed procedure" },
              { href: "/memory?tab=inbox&inbox_source=human_upload", icon: Upload, title: "Upload to LiNKbrain", hint: "Send company knowledge to inbox" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60"
              >
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  <action.icon className="h-4 w-4 shrink-0 text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100" aria-hidden />
                  {action.title}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{action.hint}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
