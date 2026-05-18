import Link from "next/link";

import { BrandHeading } from "@linktrend/ui";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Brain,
  Briefcase,
  FolderKanban,
  MessageSquare,
  Radio,
  ShieldAlert,
  Sparkles,
  Upload,
  Wrench,
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

export function OverviewHome(props: { data: OverviewData }) {
  const { data } = props;
  const schemaHint =
    data.setupError?.includes("schema") || data.setupError?.toLowerCase().includes("pgrst");

  const statusSummary =
    data.systemStatus.level === "critical"
      ? "One or more services need attention before routine operations."
      : data.systemStatus.level === "attention"
        ? "Some checks reported warnings — review linked areas when you can."
        : "Core connectivity checks look healthy for this snapshot.";

  return (
    <main className="space-y-8 pb-16">
      {/* System status — single top status bar */}
      <section
        className={`sticky top-0 z-20 rounded-xl border p-4 shadow-sm backdrop-blur-sm ${statusBarTone(data.systemStatus.level)}`}
        aria-label="System status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 opacity-90" aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">System status</p>
              <p className="text-lg font-semibold leading-tight">{statusLabel(data.systemStatus.level)}</p>
              <p className="mt-1 text-sm opacity-90">{statusSummary}</p>
            </div>
          </div>
          <Link href="/settings" className="shrink-0 text-xs font-semibold underline opacity-90 hover:opacity-100">
            Settings
          </Link>
        </div>
        {data.systemStatus.issues.length > 0 ? (
          <ul className="mt-3 space-y-1.5 border-t border-black/10 pt-3 text-sm dark:border-white/10">
            {data.systemStatus.issues.map((issue, i) => (
              <li key={`${issue.href}-${i}`}>
                <Link href={issue.href} className="flex items-center gap-1.5 font-medium hover:underline">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  <span>{issue.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 border-t border-black/10 pt-3 text-sm opacity-90 dark:border-white/10">No open issues.</p>
        )}
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
          <BrandHeading>LiNKaios</BrandHeading>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Command overview</p>
        </div>
      </header>

      {/* 2. What Needs Attention */}
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
        {/* 3. Workforce Summary */}
        <section className="flex min-h-[20rem] flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <Bot className="h-4 w-4" aria-hidden />
            Workforce summary
          </h2>
          <dl className="mt-4 grid flex-1 grid-cols-2 content-start gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">LiNKbots</dt>
              <dd className="text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {data.workforceSummary.total}
              </dd>
            </div>
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">Online</dt>
              <dd className="text-xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                {data.workforceSummary.online}
              </dd>
            </div>
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">Offline</dt>
              <dd className="text-xl font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">
                {data.workforceSummary.offline}
              </dd>
            </div>
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">Busy</dt>
              <dd className="text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {data.workforceSummary.busy}
              </dd>
            </div>
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">Idle</dt>
              <dd className="text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {data.workforceSummary.idle}
              </dd>
            </div>
          </dl>
          <Link href="/workers" className={`${BUTTON.secondaryCardAction} mt-auto`}>
            View LiNKbots
          </Link>
        </section>

        {/* 4. Work Summary */}
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

      {/* 5. Projects Summary */}
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          <FolderKanban className="h-4 w-4" aria-hidden />
          Projects summary
        </h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="min-w-[10rem] flex-1 rounded-lg border border-sky-200 bg-sky-50/50 px-4 py-3 dark:border-sky-900/40 dark:bg-sky-950/20">
            <p className="text-xs font-medium text-sky-800 dark:text-sky-200">Active</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-sky-950 dark:text-sky-50">
              {data.projectsSummary.active}
            </p>
          </div>
          <div className="min-w-[10rem] flex-1 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
            <p className="text-xs font-medium text-amber-900 dark:text-amber-200">Needs attention</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-950 dark:text-amber-50">
              {data.projectsSummary.needsAttention}
            </p>
          </div>
        </div>
        <Link href="/projects" className={`${BUTTON.secondaryCardAction} mt-4`}>
          View projects
        </Link>
      </section>

      {/* 6. Quick Actions */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/workers" className={BUTTON.primaryRowUniform}>
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
            Add LiNKbot
          </Link>
          <Link href="/projects" className={BUTTON.primaryRowUniform}>
            <FolderKanban className="h-4 w-4 shrink-0" aria-hidden />
            Create project
          </Link>
          <Link href="/skills/skills" className={BUTTON.primaryRowUniform}>
            <Wrench className="h-4 w-4 shrink-0" aria-hidden />
            Add skill
          </Link>
          <Link href="/memory?tab=inbox&inbox_item=upload" className={BUTTON.primaryRowUniform}>
            <Upload className="h-4 w-4 shrink-0" aria-hidden />
            Upload to LiNKbrain
          </Link>
        </div>
      </section>
    </main>
  );
}
