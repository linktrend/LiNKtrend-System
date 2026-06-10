"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Bot, GitBranch, Layers3, ListChecks, Plus, Workflow } from "lucide-react";

import { StripeSuiteTab } from "@/components/admin/stripe-suite-tab";

import {
  SuiteAutomationModal,
  SuiteIssueModal,
  SuiteLinkbotModal,
  SuiteModuleModal,
  SuitePhaseModal,
  useSuiteBuilderModals,
} from "@/components/admin/suite-builder-modals";
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
import { BUTTON, FIELD, screenTabLinkClass } from "@/lib/ui-standards";

type BuilderTab = "composition" | "linkbots" | "automations" | "stripe";

const COMPOSITION_ACTIONS = [
  { id: "module" as const, label: "Add Module", icon: Layers3 },
  { id: "phase" as const, label: "Add Phase", icon: GitBranch },
  { id: "issue" as const, label: "Add Issue", icon: ListChecks },
];

function TabAddButton(props: {
  label: string;
  icon: typeof Layers3;
  onClick: () => void;
}) {
  const Icon = props.icon;
  return (
    <button
      type="button"
      className={`${BUTTON.secondaryCardAction} inline-flex items-center gap-1.5 !mt-0 px-3 py-1.5 text-xs`}
      onClick={props.onClick}
    >
      <Plus className="h-3.5 w-3.5" aria-hidden />
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {props.label}
    </button>
  );
}

function LicensorSuiteLinkbotsTab(props: { suiteId: string; onAdd: () => void }) {
  const { getSuite } = useLicensorSuiteStore();
  const suite = getSuite(props.suiteId);
  if (!suite) return null;
  const rows = extractSuiteLinkbots(suite);

  return (
    <div className="space-y-3">
      <TabAddButton label="Add LiNKbot" icon={Bot} onClick={props.onAdd} />
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          No LiNKbots assigned yet. Use <strong>Add LiNKbot</strong> to bind a role profile to an issue.
        </p>
      ) : (
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
      )}
    </div>
  );
}

function LicensorSuiteAutomationsTab(props: { suiteId: string; onAdd: () => void }) {
  const { getSuite } = useLicensorSuiteStore();
  const suite = getSuite(props.suiteId);
  if (!suite) return null;
  const rows = extractSuiteAutomations(suite);

  return (
    <div className="space-y-3">
      <TabAddButton label="Add Automation" icon={Workflow} onClick={props.onAdd} />
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          No automations registered yet. Use <strong>Add Automation</strong> with a LiNKautowork workflow JSON file.
        </p>
      ) : (
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
      )}
    </div>
  );
}


export function LicensorSuiteBuilderPanel(props: { suiteId: string }) {
  const { href: appHref } = useAppSurface();
  const { getSuite, transitionPublish, upsertComposition } = useLicensorSuiteStore();
  const suite = getSuite(props.suiteId);
  const [tab, setTab] = useState<BuilderTab>("composition");

  const handleSave = useCallback(
    (upsert: Parameters<typeof upsertComposition>[1]) => upsertComposition(props.suiteId, upsert),
    [props.suiteId, upsertComposition],
  );

  const { state: modalState, setState: setModalState, error: modalError, close: closeModal, save } =
    useSuiteBuilderModals(handleSave);

  if (!suite) {
    return (
      <main className="space-y-4">
        <ShellPageHeaderClient
          title="Suite not found"
          subtitle="Return to the suite catalogue and open an existing row."
          hideLicensorScope
        />
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
    { key: "composition", label: "Contracts & deps" },
    { key: "linkbots", label: "LiNKbots" },
    { key: "automations", label: "Automations" },
  ];

  const publishActions = (
    <>
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
    </>
  );

  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title={suite.name}
        titleExtra={
          <StatusPill
            label={licensorSuitePublishLabel(suite.publishState)}
            tone={licensorSuitePublishTone(suite.publishState)}
            equalWidthLabels={LICENSOR_SUITE_PUBLISH_PILL_LABELS}
          />
        }
        subtitle={suite.summary ? `Suite builder — ${suite.summary}` : "Suite builder"}
        hideLicensorScope
        actions={publishActions}
      />

      <section className="rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Composition progress toward publication
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tracks name, summary, modules, phases, issues, input/output contracts, LiNKbots, and automations. Stripe linkage is required only at publish.
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
            Submit for Review unlocks at 85% completeness (contracts, assignees, and structure).
          </p>
        ) : null}
        {suite.publishState === "ready" ? (
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Suite is ready for review. Link Stripe on the Stripe tab, then publish to Marketplace.
          </p>
        ) : null}
      </section>

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
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {COMPOSITION_ACTIONS.map((action) => (
              <TabAddButton
                key={action.id}
                label={action.label}
                icon={action.icon}
                onClick={() => setModalState({ kind: action.id })}
              />
            ))}
          </div>
          {modalError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
              {modalError}
            </p>
          ) : null}
          {suite.modules.length > 0 ? (
            <ModuleProcessTree
              processes={suite.modules}
              variant="builder"
              onEditModule={(mod) => setModalState({ kind: "module", initial: mod })}
              onEditPhase={(phase, moduleId) => setModalState({ kind: "phase", initial: { ...phase, moduleId } })}
              onEditIssue={(issue, moduleId, phaseId) =>
                setModalState({ kind: "issue", initial: { ...issue, moduleId, phaseId } })
              }
            />
          ) : (
            <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400">
              No modules yet. Use <strong>Add Module</strong> to start assembling this suite.
            </p>
          )}
        </div>
      ) : null}

      {tab === "linkbots" ? (
        <LicensorSuiteLinkbotsTab suiteId={suite.id} onAdd={() => setModalState({ kind: "linkbot" })} />
      ) : null}
      {tab === "automations" ? (
        <LicensorSuiteAutomationsTab suiteId={suite.id} onAdd={() => setModalState({ kind: "automation" })} />
      ) : null}
      {tab === "stripe" ? <StripeSuiteTab suiteId={suite.id} suiteName={suite.name} /> : null}

      <SuiteModuleModal
        open={modalState.kind === "module"}
        modules={suite.modules}
        initial={modalState.kind === "module" ? modalState.initial : undefined}
        onClose={closeModal}
        onSave={save}
      />
      <SuitePhaseModal
        open={modalState.kind === "phase"}
        modules={suite.modules}
        initial={modalState.kind === "phase" ? modalState.initial : undefined}
        defaultModuleId={modalState.kind === "phase" ? modalState.defaultModuleId : undefined}
        onClose={closeModal}
        onSave={save}
      />
      <SuiteIssueModal
        open={modalState.kind === "issue"}
        modules={suite.modules}
        initial={modalState.kind === "issue" ? modalState.initial : undefined}
        onClose={closeModal}
        onSave={save}
      />
      <SuiteLinkbotModal
        open={modalState.kind === "linkbot"}
        modules={suite.modules}
        onClose={closeModal}
        onSave={save}
      />
      <SuiteAutomationModal
        open={modalState.kind === "automation"}
        modules={suite.modules}
        onClose={closeModal}
        onSave={save}
      />
    </main>
  );
}
