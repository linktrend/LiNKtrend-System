"use client";

import Link from "next/link";
import {
  Activity,
  Bell,
  Bot,
  Brain,
  Building2,
  CreditCard,
  Layers3,
  MessageSquare,
  Radio,
  Settings,
  Shield,
  ShieldAlert,
  Wrench,
  Zap,
} from "lucide-react";

import { useAppSurface } from "@/components/app-surface-provider";
import { useAppRole, useLicensorScope } from "@/components/role-preview-provider";
import {
  SummaryMetricCard,
  SummaryMetricCardGrid,
  SummaryMetricCardSection,
} from "@/components/summary-metric-card";
import { StatusPill } from "@/components/ui/status-pill";
import { licensorScopeIsReadOnly } from "@/lib/app-roles";
import { LICENSEES_LABEL } from "@/lib/company-page-copy";
import { LICENSEE_REGISTRY, resolveLicenseeRegistry } from "@/lib/licensee-registry";
import { BUTTON, formatUiLabel } from "@/lib/ui-standards";

type PlatformService = {
  id: string;
  label: string;
  tone: "ok" | "attention" | "critical";
  detail: string;
};

const PLATFORM_SERVICES: PlatformService[] = [
  { id: "linkaios", label: "LiNKaios", tone: "ok", detail: "Control plane healthy" },
  { id: "linkskills", label: "LinkSkills", tone: "ok", detail: "Catalogue and leases online" },
  { id: "linkbrain", label: "LiNKbrain", tone: "attention", detail: "Retrieval latency elevated" },
  { id: "linkautowork", label: "LiNKautowork", tone: "ok", detail: "Workflow gateway responding" },
];

const TENANT_BOT_COUNTS: Record<string, number> = {
  "xyz-marketing": 6,
  "lexos-legal": 3,
  "harbor-dental": 2,
};

function serviceTone(tone: PlatformService["tone"]) {
  if (tone === "critical") return "danger" as const;
  if (tone === "attention") return "warning" as const;
  return "success" as const;
}

function billingStatusLabel(status: "active" | "trialing" | "suspended"): string {
  if (status === "trialing") return "Trialing";
  if (status === "suspended") return "Suspended";
  return "Active billing";
}

function billingStatusTone(status: "active" | "trialing" | "suspended") {
  if (status === "suspended") return "danger" as const;
  if (status === "trialing") return "warning" as const;
  return "success" as const;
}

function aggregateLicenseeStats() {
  const active = LICENSEE_REGISTRY.filter((row) => row.status === "active").length;
  const trialing = LICENSEE_REGISTRY.filter((row) => row.status === "trialing").length;
  const suspended = LICENSEE_REGISTRY.filter((row) => row.status === "suspended").length;
  const openIssues = LICENSEE_REGISTRY.reduce((sum, row) => sum + row.openIssues, 0);
  return { total: LICENSEE_REGISTRY.length, active, trialing, suspended, openIssues };
}

function ReadOnlyPlatformBanner() {
  return (
    <div
      className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-50"
      role="status"
    >
      <p className="font-semibold">Read-only platform view</p>
      <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
        Select a licensee to take action within that tenant workspace.
      </p>
    </div>
  );
}

function aggregatePlatformWorkStats() {
  const openIssues = LICENSEE_REGISTRY.reduce((sum, row) => sum + row.openIssues, 0);
  return {
    openIssues,
    alerts: 0,
    messages: 0,
    sessions: 0,
  };
}

function PlatformBirdsEye(props: { href: (path: string) => string }) {
  const stats = aggregateLicenseeStats();
  const work = aggregatePlatformWorkStats();

  const quickLinks = [
    { href: props.href("/work"), icon: Activity, title: "Work", description: "Platform attention feed and operator inbox." },
    { href: props.href("/workers"), icon: Bot, title: "LiNKbots", description: "Fleet sessions, troubleshoot actions, and runtime health." },
    { href: props.href("/suites"), icon: Layers3, title: "Suites", description: "Compose suite products and publish to Marketplace." },
    { href: props.href("/skills"), icon: Wrench, title: "LinkSkills", description: "Capabilities, leases, and tools." },
    { href: props.href("/memory"), icon: Brain, title: "LiNKbrain", description: "Memory files and audit surfaces." },
    {
      href: props.href("/licensees"),
      icon: Building2,
      title: LICENSEES_LABEL,
      description: "Registry, billing status, and org topology.",
    },
    { href: props.href("/metrics"), icon: Zap, title: "Metrics", description: "Platform KPIs and usage snapshots." },
    { href: props.href("/settings"), icon: Settings, title: "Settings", description: "Operator users and platform controls." },
  ];

  return (
    <div className="space-y-8">
      <SummaryMetricCardSection title={formatUiLabel(`${LICENSEES_LABEL} snapshot`)}>
        <SummaryMetricCardGrid statusPillLabels={["Active", "Trialing", "Suspended"]}>
          <SummaryMetricCard
            title={LICENSEES_LABEL}
            icon={Building2}
            metric={stats.total}
            compactMetric
            preview={`${stats.active} active · ${stats.trialing} trialing`}
            href={props.href("/licensees")}
          />
          <SummaryMetricCard
            title="Active"
            icon={Shield}
            metric={stats.active}
            compactMetric
            badge={<StatusPill label="Active" tone="success" equalWidth />}
          />
          <SummaryMetricCard
            title="Trialing"
            icon={Activity}
            metric={stats.trialing}
            compactMetric
            badge={<StatusPill label="Trialing" tone="warning" equalWidth />}
          />
          <SummaryMetricCard
            title="Suspended"
            icon={ShieldAlert}
            metric={stats.suspended}
            compactMetric
            badge={<StatusPill label="Suspended" tone={stats.suspended > 0 ? "danger" : "neutral"} equalWidth />}
          />
        </SummaryMetricCardGrid>
      </SummaryMetricCardSection>

      <SummaryMetricCardSection title={formatUiLabel("Platform attention")}>
        <SummaryMetricCardGrid>
          <SummaryMetricCard
            title="Open issues"
            icon={ShieldAlert}
            metric={work.openIssues}
            compactMetric
            metricToneClass={work.openIssues > 0 ? "text-amber-700 dark:text-amber-300" : undefined}
            preview={work.openIssues > 0 ? "Across all licensees" : "None reported"}
            href={props.href("/work/alerts")}
          />
          <SummaryMetricCard
            title="Alerts"
            icon={Bell}
            metric={work.alerts}
            compactMetric
            preview="Operator alerts queue"
            href={props.href("/work/alerts")}
          />
          <SummaryMetricCard
            title="Messages"
            icon={MessageSquare}
            metric={work.messages}
            compactMetric
            preview="Channel threads platform-wide"
            href={props.href("/work/messages")}
          />
          <SummaryMetricCard
            title="Sessions"
            icon={Radio}
            metric={work.sessions}
            compactMetric
            preview="Active LiNKbot sessions"
            href={props.href("/work/sessions")}
          />
        </SummaryMetricCardGrid>
      </SummaryMetricCardSection>

      <SummaryMetricCardSection title={formatUiLabel("Service health")}>
        <SummaryMetricCardGrid>
          {PLATFORM_SERVICES.map((service) => {
            const Icon =
              service.id === "linkbrain"
                ? Brain
                : service.id === "linkskills"
                  ? Wrench
                  : service.id === "linkautowork"
                    ? Zap
                    : Shield;
            const statusLabel = formatUiLabel(
              service.tone === "ok" ? "OK" : service.tone === "attention" ? "Attention" : "Critical",
            );
            return (
              <SummaryMetricCard
                key={service.id}
                title={service.label}
                icon={Icon}
                metric={statusLabel}
                compactMetric
                badge={<StatusPill label={statusLabel} tone={serviceTone(service.tone)} />}
                preview={service.detail}
              />
            );
          })}
        </SummaryMetricCardGrid>
      </SummaryMetricCardSection>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatUiLabel("Quick links")}</h2>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`${BUTTON.secondaryRow} inline-flex items-center gap-2`}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {item.title}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const LICENSEE_WORK_STATS: Record<string, { alerts: number; messages: number; sessions: number }> = {
  "xyz-marketing": { alerts: 1, messages: 2, sessions: 1 },
  "lexos-legal": { alerts: 0, messages: 1, sessions: 1 },
  "harbor-dental": { alerts: 2, messages: 3, sessions: 2 },
};

/** Per-licensee service health — MVO demo; wire to tenant-scoped health probes later. */
function licenseeServices(licenseeId: string, licenseeName: string): PlatformService[] {
  const prefix = `${licenseeName} —`;
  if (licenseeId === "harbor-dental") {
    return [
      { id: "linkaios", label: "LiNKaios", tone: "ok", detail: `${prefix} workspace healthy` },
      { id: "linkskills", label: "LinkSkills", tone: "ok", detail: `${prefix} leases within policy` },
      { id: "linkbrain", label: "LiNKbrain", tone: "attention", detail: `${prefix} ingestion backlog elevated` },
      { id: "linkautowork", label: "LiNKautowork", tone: "ok", detail: `${prefix} workflows responding` },
    ];
  }
  if (licenseeId === "lexos-legal") {
    return [
      { id: "linkaios", label: "LiNKaios", tone: "ok", detail: `${prefix} workspace healthy` },
      { id: "linkskills", label: "LinkSkills", tone: "ok", detail: `${prefix} catalogue synced` },
      { id: "linkbrain", label: "LiNKbrain", tone: "ok", detail: `${prefix} retrieval nominal` },
      { id: "linkautowork", label: "LiNKautowork", tone: "attention", detail: `${prefix} one workflow retry pending` },
    ];
  }
  return PLATFORM_SERVICES.map((service) => ({
    ...service,
    detail: `${prefix} ${service.detail.charAt(0).toLowerCase()}${service.detail.slice(1)}`,
  }));
}

function LicenseeBirdsEye(props: { licenseeId: string; href: (path: string) => string }) {
  const row = resolveLicenseeRegistry(props.licenseeId);
  if (!row) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Client / licensee not found in the demo registry.{" "}
        <Link href={props.href("/licensees")} className="font-medium text-sky-700 underline dark:text-sky-400">
          Open {LICENSEES_LABEL}
        </Link>
      </p>
    );
  }

  const botCount = TENANT_BOT_COUNTS[row.id] ?? 0;
  const workStats = LICENSEE_WORK_STATS[row.id] ?? { alerts: 0, messages: 0, sessions: 0 };
  const services = licenseeServices(row.id, row.name);

  const quickLinks = [
    {
      href: props.href("/licensees"),
      icon: Building2,
      title: "Client / Licensee profile",
      description: "Service profile, companies & brands index, billing, and support for this tenant.",
    },
    {
      href: props.href("/work"),
      icon: Activity,
      title: "Work",
      description: "Attention feed, alerts, and operator inbox for this tenant.",
    },
    {
      href: props.href("/workers"),
      icon: Bot,
      title: "LiNKbots",
      description: `${botCount} LiNKbot${botCount === 1 ? "" : "s"} — fleet sessions and runtime health.`,
    },
    {
      href: props.href("/skills"),
      icon: Wrench,
      title: "LinkSkills",
      description: "Tenant entitlements, leases, and capability governance.",
    },
    {
      href: props.href("/memory"),
      icon: Brain,
      title: "LiNKbrain",
      description: "Memory files, drafts, and audit for this workspace.",
    },
    {
      href: props.href("/suites"),
      icon: Layers3,
      title: "Suites",
      description: `${row.suiteCount} subscribed suite${row.suiteCount === 1 ? "" : "s"} and module entitlements.`,
    },
    {
      href: props.href("/metrics"),
      icon: Zap,
      title: "Metrics",
      description: "Usage, cost, and KPI snapshots for this licensee.",
    },
    {
      href: props.href("/settings"),
      icon: Settings,
      title: "Tenant settings",
      description: "Read-only view of workspace preferences and security posture.",
    },
  ];

  return (
    <div className="space-y-8">
      <SummaryMetricCardSection title={formatUiLabel("Client / licensee snapshot")}>
        <SummaryMetricCardGrid statusPillLabels={["Active billing", "Trialing", "Suspended", "Past due"]}>
          <SummaryMetricCard
            title="Plan"
            icon={CreditCard}
            metric={row.plan.replace(/^LiNKaios\s+/i, "")}
            compactMetric
            preview={billingStatusLabel(row.status)}
            badge={<StatusPill label={billingStatusLabel(row.status)} tone={billingStatusTone(row.status)} equalWidth />}
          />
          <SummaryMetricCard
            title="Entities"
            icon={Building2}
            metric={row.entityCount}
            compactMetric
            href={props.href("/licensees?tab=overview")}
          />
          <SummaryMetricCard
            title="Brands"
            icon={Layers3}
            metric={row.brandCount}
            compactMetric
            href={props.href("/licensees?tab=companies")}
          />
          <SummaryMetricCard
            title="Suites"
            icon={Layers3}
            metric={row.suiteCount}
            compactMetric
            href={props.href("/suites")}
          />
        </SummaryMetricCardGrid>
      </SummaryMetricCardSection>

      <SummaryMetricCardSection title={formatUiLabel("Licensee attention")}>
        <SummaryMetricCardGrid>
          <SummaryMetricCard
            title="Open issues"
            icon={ShieldAlert}
            metric={row.openIssues}
            compactMetric
            metricToneClass={row.openIssues > 0 ? "text-amber-700 dark:text-amber-300" : undefined}
            preview={row.openIssues > 0 ? "Needs operator review" : "None reported"}
            href={props.href("/work/alerts")}
          />
          <SummaryMetricCard
            title="Alerts"
            icon={Bell}
            metric={workStats.alerts}
            compactMetric
            preview="Operator alerts queue"
            href={props.href("/work/alerts")}
          />
          <SummaryMetricCard
            title="Messages"
            icon={MessageSquare}
            metric={workStats.messages}
            compactMetric
            preview="Channel threads for this tenant"
            href={props.href("/work/messages")}
          />
          <SummaryMetricCard
            title="Sessions"
            icon={Radio}
            metric={workStats.sessions}
            compactMetric
            preview="Active LiNKbot sessions"
            href={props.href("/work/sessions")}
          />
        </SummaryMetricCardGrid>
      </SummaryMetricCardSection>

      <SummaryMetricCardSection title={formatUiLabel("Service health")}>
        <SummaryMetricCardGrid>
          {services.map((service) => {
            const Icon =
              service.id === "linkbrain"
                ? Brain
                : service.id === "linkskills"
                  ? Wrench
                  : service.id === "linkautowork"
                    ? Zap
                    : Shield;
            const statusLabel = formatUiLabel(
              service.tone === "ok" ? "OK" : service.tone === "attention" ? "Attention" : "Critical",
            );
            return (
              <SummaryMetricCard
                key={service.id}
                title={service.label}
                icon={Icon}
                metric={statusLabel}
                compactMetric
                badge={<StatusPill label={statusLabel} tone={serviceTone(service.tone)} />}
                preview={service.detail}
              />
            );
          })}
        </SummaryMetricCardGrid>
      </SummaryMetricCardSection>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatUiLabel("Quick links")}</h2>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            const title = formatUiLabel(item.title);
            return (
              <Link key={item.href} href={item.href} className={`${BUTTON.secondaryRow} inline-flex items-center gap-2`}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {title}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/** Licensor admin overview — platform bird's-eye or single-tenant snapshot. */
export function AdminControlPanel() {
  const { scope, isSingleLicensee, isAdminView, isCrossTenantReadOnly } = useLicensorScope();
  const { role } = useAppRole();
  const { href } = useAppSurface();
  const readOnlyAll = isCrossTenantReadOnly && licensorScopeIsReadOnly(scope, role);

  return (
    <div className="space-y-6">
      {readOnlyAll ? <ReadOnlyPlatformBanner /> : null}

      {isSingleLicensee ? (
        <LicenseeBirdsEye licenseeId={scope} href={href} />
      ) : (
        <PlatformBirdsEye href={href} />
      )}
    </div>
  );
}
