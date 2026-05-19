"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Brain,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Clock3,
  FolderKanban,
  MessageSquare,
  Radio,
  ShieldAlert,
  Sparkles,
  Upload,
  Wrench,
  Zap,
} from "lucide-react";

import { AttentionFeedBadges } from "@/components/attention-feed-badges";
import type { OverviewData, SystemStatusLevel } from "@/lib/overview-dashboard";
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
  if (lower.includes("llm")) return <Zap className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" aria-hidden />;
  if (lower.includes("tool")) return <Wrench className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />;
  return <ShieldAlert className="h-4 w-4 shrink-0 text-red-700 dark:text-red-300" aria-hidden />;
}

export function OverviewHome(props: { data: OverviewData }) {
  const { data } = props;
  const router = useRouter();
  const [statusOpen, setStatusOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const fetchedAt = data.fetchedAt ? new Date(data.fetchedAt).getTime() : Date.now();

  useEffect(() => {
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
    const diffSeconds = Math.max(0, Math.round((now - fetchedAt) / 1000));
    if (diffSeconds < 60) return "Refreshed just now";
    const mins = Math.floor(diffSeconds / 60);
    if (mins < 60) return `Refreshed ${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    return `Refreshed ${hrs} hr ago`;
  }, [now, fetchedAt]);

  return (
    <main className="space-y-8 pb-16">
      <section className={`rounded-xl border p-3 shadow-sm ${statusBarTone(data.systemStatus.level)}`} aria-label="System status">
        <button
          type="button"
          onClick={() => setStatusOpen((s) => !s)}
          className="flex w-full items-center justify-between gap-3 text-left"
          aria-expanded={statusOpen}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
            <div className="inline-flex min-w-0 items-center gap-2">
              <p className="text-sm font-semibold leading-tight">System: {statusLabel(data.systemStatus.level)}</p>
              {data.systemStatus.issues.length > 0 ? (
                <span className="rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-semibold dark:bg-white/15">
                  {data.systemStatus.issues.length} issue{data.systemStatus.issues.length === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
          </div>
          {statusOpen ? <ChevronUp className="h-4 w-4 shrink-0 opacity-75" aria-hidden /> : <ChevronDown className="h-4 w-4 shrink-0 opacity-75" aria-hidden />}
        </button>
        <p className="mt-1 pl-8 text-xs opacity-90">{statusSummary}</p>

        {statusOpen && data.systemStatus.issues.length > 0 ? (
          <ul className="mt-3 space-y-1.5 border-t border-black/10 pt-3 text-sm dark:border-white/10">
            {data.systemStatus.issues.map((issue, i) => (
              <li key={`${issue.href}-${i}`}>
                <Link href={issue.href} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-medium hover:bg-black/5 dark:hover:bg-white/10">
                  <span className="inline-flex min-w-0 items-center gap-2">
                    {issueIcon(issue.label)}
                    <span className="truncate">{issue.label}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold opacity-90">
                    Fix <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {statusOpen && data.systemStatus.issues.length === 0 ? (
          <p className="mt-3 border-t border-black/10 pt-3 text-sm opacity-90 dark:border-white/10">No open issues.</p>
        ) : null}
      </section>

      {data.setupError ? (
        <section className="max-w-2xl rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-medium">Database connectivity issue</p>
          <p className="mt-2 text-amber-900/90 dark:text-amber-100/90">
            {schemaHint ? (
              <>
                PostgREST may not expose required schemas yet. In Supabase:{" "}
                <strong>Project Settings → Data API → Exposed schemas</strong>, add{" "}
                <code className="text-xs">linkaios</code>, <code className="text-xs">bot_runtime</code>,{" "}
                <code className="text-xs">prism</code>, <code className="text-xs">gateway</code>, then save. Run
                migrations or <code className="text-xs">services/migrations/ALL_IN_ONE.sql</code> if tables are
                missing.
              </>
            ) : (
              data.setupError
            )}
          </p>
        </section>
      ) : null}

      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">LiNKaios</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Command overview</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              {refreshedLabel}
            </span>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
                <Link
                  href={item.href}
                  className="flex flex-col gap-1 px-4 py-3 text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-900/80"
                >
                  <AttentionFeedBadges item={item} />
                  <span className="flex items-start gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                    {item.kind === "alert" ? (
                      <AlertTriangle
                        className={
                          "mt-0.5 h-4 w-4 shrink-0 " +
                          (item.alertSeverity === "critical"
                            ? "text-red-600 dark:text-red-400"
                            : item.alertSeverity === "warning"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-sky-600 dark:text-sky-400")
                        }
                        aria-hidden
                      />
                    ) : item.kind === "message" ? (
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
                    ) : item.kind === "session" ? (
                      <Radio className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden />
                    ) : (
                      <Brain className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                    )}
                    <span className="min-w-0">{item.title}</span>
                  </span>
                  {item.subtitle ? (
                    <span className="line-clamp-2 pl-6 text-xs text-zinc-600 dark:text-zinc-400">{item.subtitle}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 flex justify-end">
          <Link href="/work" className={BUTTON.secondaryCardAction}>
            Open All Work
          </Link>
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <section className="flex min-h-[20rem] flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <Bot className="h-4 w-4" aria-hidden />
            Workforce summary
          </h2>
          <dl className="mt-4 grid flex-1 grid-cols-2 content-start gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">LiNKbots</dt>
              <dd className="text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.workforceSummary.total}</dd>
            </div>
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">Online</dt>
              <dd className="text-xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">{data.workforceSummary.online}</dd>
            </div>
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">Offline</dt>
              <dd className="text-xl font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">{data.workforceSummary.offline}</dd>
            </div>
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">Busy</dt>
              <dd className="text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.workforceSummary.busy}</dd>
            </div>
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">Idle</dt>
              <dd className="text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.workforceSummary.idle}</dd>
            </div>
          </dl>
          <Link href="/workers" className={`${BUTTON.secondaryCardAction} mt-auto`}>
            View LiNKbots
          </Link>
        </section>

        <section className="flex min-h-[20rem] flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <Briefcase className="h-4 w-4" aria-hidden />
            Work summary
          </h2>
          <ul className="mt-4 mb-4 flex-1 space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Alerts</span>
              <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.workCounts.alerts}</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Messages</span>
              <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.workCounts.messages}</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Sessions</span>
              <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.workCounts.sessions}</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">LiNKbrain inbox</span>
              <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.workCounts.brainInbox}</span>
            </li>
          </ul>
          <Link href="/work" className={`${BUTTON.secondaryCardAction} mt-auto`}>
            Open All Work
          </Link>
        </section>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          <FolderKanban className="h-4 w-4" aria-hidden />
          Projects summary
        </h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="min-w-[10rem] flex-1 rounded-lg border border-sky-200 bg-sky-50/50 px-4 py-3 dark:border-sky-900/40 dark:bg-sky-950/20">
            <p className="text-xs font-medium text-sky-800 dark:text-sky-200">Active</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-sky-950 dark:text-sky-50">{data.projectsSummary.active}</p>
          </div>
          <div className="min-w-[10rem] flex-1 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
            <p className="text-xs font-medium text-amber-900 dark:text-amber-200">Needs attention</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-950 dark:text-amber-50">{data.projectsSummary.needsAttention}</p>
          </div>
        </div>
        <Link href="/projects" className={`${BUTTON.secondaryCardAction} mt-4`}>
          View projects
        </Link>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Quick actions</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/workers" className={`${BUTTON.primaryRow} w-full justify-center gap-2`}>
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
            Add LiNKbot
          </Link>
          <Link href="/projects" className={`${BUTTON.primaryRow} w-full justify-center gap-2`}>
            <FolderKanban className="h-4 w-4 shrink-0" aria-hidden />
            Create project
          </Link>
          <Link href="/skills/skills" className={`${BUTTON.primaryRow} w-full justify-center gap-2`}>
            <Wrench className="h-4 w-4 shrink-0" aria-hidden />
            Add skill
          </Link>
          <Link href="/memory?tab=inbox&inbox_item=upload" className={`${BUTTON.primaryRow} w-full justify-center gap-2`}>
            <Upload className="h-4 w-4 shrink-0" aria-hidden />
            Upload to LiNKbrain
          </Link>
        </div>
      </section>
    </main>
  );
}
