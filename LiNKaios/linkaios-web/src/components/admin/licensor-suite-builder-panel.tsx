"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Bot, GitBranch, Layers3, ListChecks, Plus, Workflow } from "lucide-react";

import { SuiteCompletenessBar } from "@/components/admin/suite-completeness-bar";
import { useAppSurface } from "@/components/app-surface-provider";
import { ModuleProcessTree } from "@/components/suites/module-process-tree";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { StatusPill } from "@/components/ui/status-pill";
import { useLicensorSuiteStore } from "@/hooks/use-licensor-suite-store";
import { LICENSOR_SUITE_PUBLISH_PILL_LABELS } from "@/lib/status-colors";
import {
  canMarkSuiteReady,
  canPublishSuite,
  extractSuiteAutomations,
  extractSuiteLinkbots,
  licensorSuitePublishLabel,
  licensorSuitePublishTone,
  suiteBuilderCompleteness,
  suiteCompletenessChecklist,
} from "@/lib/licensor-suite-catalog";
import type { SuiteCompositionAction } from "@/lib/licensor-suite-catalog";
import { BUTTON, FIELD, formatUiLabel, screenTabLinkClass } from "@/lib/ui-standards";

type BuilderTab = "composition" | "linkbots" | "automations" | "stripe";

const BUILDER_ACTIONS: { id: SuiteCompositionAction["type"]; label: string; icon: typeof Layers3 }[] = [
  { id: "add_module", label: "Add Module", icon: Layers3 },
  { id: "add_phase", label: "Add Phase", icon: GitBranch },
  { id: "add_issue", label: "Add Issue", icon: ListChecks },
  { id: "add_linkbot", label: "Add LiNKbot", icon: Bot },
  { id: "add_automation", label: "Add Automation", icon: Workflow },
];

function CompositionAddButton(props: {
  label: string;
  icon: typeof GitBranch;
  onClick: () => void;
  disabled?: boolean;
}) {
  const Icon = props.icon;
  return (
    <button
      type="button"
      className={`${BUTTON.secondaryCardAction} inline-flex items-center gap-1.5 !mt-0 px-3 py-1.5 text-xs`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <Plus className="h-3.5 w-3.5" aria-hidden />
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {props.label}
    </button>
  );
}

function LicensorSuiteLinkbotsTab(props: { suiteId: string }) {
  const { getSuite } = useLicensorSuiteStore();
  const suite = getSuite(props.suiteId);
  if (!suite) return null;
  const rows = extractSuiteLinkbots(suite);

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        No LiNKbots assigned yet. Use <strong>Add LiNKbot</strong> or assign from the composition tree.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
      {rows.map((row) => (
        <li key={row.id} className="px-4 py-4 text-sm">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.displayName}</p>
          <p className="mt-0.5 text-xs font-medium text-violet-800 dark:text-violet-300">Role · {row.role}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {row.moduleName} · {row.phaseName} · {row.issueTitle}
          </p>
        </li>
      ))}
    </ul>
  );
}

function LicensorSuiteAutomationsTab(props: { suiteId: string }) {
  const { getSuite } = useLicensorSuiteStore();
  const suite = getSuite(props.suiteId);
  if (!suite) return null;
  const rows = extractSuiteAutomations(suite);

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        No automations registered yet. Use <strong>Add Automation</strong> for deterministic LiNKautowork steps.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
      {rows.map((row) => (
        <li key={row.id} className="px-4 py-4 text-sm">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.title}</p>
          <p className="mt-0.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">{row.handle}</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{row.description}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {row.moduleName} · {row.phaseName} · {row.issueTitle}
          </p>
        </li>
      ))}
    </ul>
  );
}

function LicensorSuiteStripeTab(props: { suiteId: string }) {
  const { href: appHref } = useAppSurface();
  const { getSuite, linkStripeProduct } = useLicensorSuiteStore();
  const suite = getSuite(props.suiteId);
  const [productId, setProductId] = useState(suite?.stripeProductId ?? "");

  useEffect(() => {
    setProductId(suite?.stripeProductId ?? "");
  }, [suite?.stripeProductId, suite?.id]);

  if (!suite) return null;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = productId.trim();
    linkStripeProduct(suite.id, trimmed.length > 0 ? trimmed : null);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Link a Stripe product ID before publishing to the licensee Marketplace. Prices stay in the Stripe Dashboard.
      </p>
      <form onSubmit={onSubmit} className="max-w-xl space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="block space-y-1.5">
          <span className={FIELD.label}>Stripe product ID</span>
          <input
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className={FIELD.control}
            placeholder="prod_…"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={BUTTON.primaryRow}>
            Save mapping
          </button>
          <Link href={appHref("/suites/billing")} className={BUTTON.secondaryCardAction}>
            Open Stripe products overview
          </Link>
        </div>
      </form>
      {suite.stripeProductId ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Current mapping · <code className="font-mono">{suite.stripeProductId}</code>
        </p>
      ) : (
        <p className="text-xs text-amber-700 dark:text-amber-300">Not linked — publish stays disabled until a product ID is saved.</p>
      )}
    </div>
  );
}

export function LicensorSuiteBuilderPanel(props: { suiteId: string }) {
  const { href: appHref } = useAppSurface();
  const { getSuite, transitionPublish, applyComposition } = useLicensorSuiteStore();
  const suite = getSuite(props.suiteId);
  const [tab, setTab] = useState<BuilderTab>("composition");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (!suite) {
    return (
      <main className="space-y-4">
        <ShellPageHeaderClient title="Suite not found" subtitle="Return to the suite catalogue and open an existing row." />
        <Link href={appHref("/suites")} className={BUTTON.secondaryCardAction}>
          Back to suites
        </Link>
      </main>
    );
  }

  const completeness = suiteBuilderCompleteness(suite);
  const checklist = suiteCompletenessChecklist(suite);
  const checklistLabels: { key: keyof typeof checklist; label: string }[] = [
    { key: "name", label: "Suite name" },
    { key: "summary", label: "Summary" },
    { key: "modules", label: "Modules" },
    { key: "phases", label: "Phases" },
    { key: "issues", label: "Issues" },
    { key: "linkbots", label: "LiNKbots" },
    { key: "automations", label: "Automations" },
  ];

  const runCompositionAction = (type: SuiteCompositionAction["type"]) => {
    const result = applyComposition(suite.id, { type });
    if (!result.ok) {
      setActionMessage(result.reason ?? "Could not apply change.");
      return;
    }
    setActionMessage(null);
  };

  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title={suite.name}
        subtitle={suite.summary}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {suite.publishState === "draft" ? (
              <button
                type="button"
                className={`${BUTTON.secondaryCardAction} !mt-0 px-3 py-1.5 text-xs`}
                disabled={!canMarkSuiteReady(suite)}
                title={
                  canMarkSuiteReady(suite)
                    ? "Move suite to Ready for internal review before marketplace publish"
                    : "Finish the composition checklist first"
                }
                onClick={() => transitionPublish(suite.id, "mark_ready")}
              >
                Submit for Review
              </button>
            ) : null}
            {suite.publishState === "ready" ? (
              <button
                type="button"
                className={`${BUTTON.primaryRow} !mt-0 px-3 py-1.5 text-xs`}
                disabled={!canPublishSuite(suite)}
                title={
                  canPublishSuite(suite)
                    ? "Publish to licensee Marketplace"
                    : "Link a Stripe product on the Stripe tab before publishing"
                }
                onClick={() => transitionPublish(suite.id, "publish")}
              >
                Publish to Marketplace
              </button>
            ) : null}
            {suite.publishState === "published" ? (
              <>
                <button
                  type="button"
                  className={`${BUTTON.secondaryCardAction} !mt-0 px-3 py-1.5 text-xs`}
                  onClick={() => transitionPublish(suite.id, "unpublish")}
                >
                  Unpublish
                </button>
                <button
                  type="button"
                  className={`${BUTTON.secondaryCardAction} !mt-0 px-3 py-1.5 text-xs text-rose-700 dark:text-rose-300`}
                  onClick={() => transitionPublish(suite.id, "suspend")}
                >
                  Suspend
                </button>
              </>
            ) : null}
            <StatusPill
              label={licensorSuitePublishLabel(suite.publishState)}
              tone={licensorSuitePublishTone(suite.publishState)}
              equalWidthLabels={LICENSOR_SUITE_PUBLISH_PILL_LABELS}
            />
          </div>
        }
      />

      <section className="rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Composition progress toward publication
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tracks name, summary, modules, phases, issues, LiNKbots, and automations. Stripe linkage is required only at publish.
            </p>
            <SuiteCompletenessBar percent={completeness} className="max-w-md pt-1" />
          </div>
          <ul className="grid gap-1 text-xs text-zinc-600 dark:text-zinc-400 sm:grid-cols-2">
            {checklistLabels.map((item) => (
              <li key={item.key} className={checklist[item.key] ? "text-emerald-700 dark:text-emerald-300" : ""}>
                {checklist[item.key] ? "✓" : "○"} {item.label}
              </li>
            ))}
          </ul>
        </div>
        {suite.publishState === "draft" && !canMarkSuiteReady(suite) ? (
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Submit for Review unlocks at 85% completeness (~6 of 7 checklist items).
          </p>
        ) : null}
        {suite.publishState === "ready" ? (
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Suite is ready for review. Link Stripe on the Stripe tab, then publish to Marketplace.
          </p>
        ) : null}
      </section>

      {tab === "composition" ? (
        <div className="flex flex-wrap gap-2">
          {BUILDER_ACTIONS.map((action) => (
            <CompositionAddButton
              key={action.id}
              label={action.label}
              icon={action.icon}
              onClick={() => runCompositionAction(action.id)}
            />
          ))}
        </div>
      ) : null}
      {actionMessage ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          {actionMessage}
        </p>
      ) : null}

      <nav aria-label="Suite builder sections" className="min-w-0 overflow-x-auto pb-px">
        <div className="flex w-max min-w-full flex-nowrap items-end gap-1 border-b border-zinc-200 dark:border-zinc-800">
          {(
            [
              { id: "composition" as const, label: "Modules & Phases" },
              { id: "linkbots" as const, label: "LiNKbots" },
              { id: "automations" as const, label: "Automations" },
              { id: "stripe" as const, label: "Stripe" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              className={screenTabLinkClass(tab === item.id)}
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {tab === "composition" ? (
        suite.modules.length > 0 ? (
          <ModuleProcessTree processes={suite.modules} variant="catalogue" />
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400">
            No modules yet. Use <strong>Add Module</strong> to start assembling this suite.
          </p>
        )
      ) : null}

      {tab === "linkbots" ? <LicensorSuiteLinkbotsTab suiteId={suite.id} /> : null}
      {tab === "automations" ? <LicensorSuiteAutomationsTab suiteId={suite.id} /> : null}
      {tab === "stripe" ? <LicensorSuiteStripeTab suiteId={suite.id} /> : null}
    </main>
  );
}
