"use client";

import Link from "next/link";
import { useState } from "react";
import { Bot, Cog, GitBranch, Layers3, ListChecks, Plus, Workflow } from "lucide-react";

import { useAppSurface } from "@/components/app-surface-provider";
import { ModuleProcessTree } from "@/components/suites/module-process-tree";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { StatusPill } from "@/components/ui/status-pill";
import { useLicensorSuiteProducts } from "@/hooks/use-licensor-suite-publish";
import { LICENSOR_SUITE_PUBLISH_PILL_LABELS } from "@/lib/status-colors";
import {
  canMarkSuiteReady,
  canPublishSuite,
  licensorSuitePublishLabel,
  licensorSuitePublishTone,
  suiteBuilderCompleteness,
} from "@/lib/ui-mocks/licensor-suite-catalog";
import { BUTTON, formatUiLabel, screenTabLinkClass } from "@/lib/ui-standards";

type BuilderTab = "composition" | "linkbots" | "automations";

const BUILDER_STUB_ACTIONS = [
  { id: "module", label: "Add module", icon: Layers3 },
  { id: "phase", label: "Add phase", icon: GitBranch },
  { id: "issue", label: "Add issue", icon: ListChecks },
  { id: "linkbot", label: "Add LiNKbot", icon: Bot },
  { id: "automation", label: "Add automation", icon: Workflow },
] as const;

function StubAddButton(props: { label: string; icon: typeof Layers3 }) {
  const Icon = props.icon;
  return (
    <button
      type="button"
      className={`${BUTTON.secondaryCardAction} inline-flex items-center gap-1.5 !mt-0 px-3 py-1.5 text-xs`}
      onClick={() => {
        /* MVO stub — composition editor wires in a later wave */
      }}
      title="Mock — composition editor not wired yet"
    >
      <Plus className="h-3.5 w-3.5" aria-hidden />
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {props.label}
    </button>
  );
}

export function LicensorSuiteBuilderPanel(props: { suiteId: string }) {
  const { href: appHref } = useAppSurface();
  const { products, transitionPublish } = useLicensorSuiteProducts();
  const suite = products.find((row) => row.id === props.suiteId);
  const [tab, setTab] = useState<BuilderTab>("composition");

  if (!suite) {
    return null;
  }

  const completeness = suiteBuilderCompleteness(suite);

  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title={suite.name}
        subtitle={suite.summary}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill
              label={licensorSuitePublishLabel(suite.publishState)}
              tone={licensorSuitePublishTone(suite.publishState)}
              equalWidthLabels={LICENSOR_SUITE_PUBLISH_PILL_LABELS}
            />
            {suite.publishState === "draft" ? (
              <button
                type="button"
                className={`${BUTTON.secondaryCardAction} !mt-0 px-3 py-1.5 text-xs`}
                disabled={!canMarkSuiteReady(suite)}
                title={canMarkSuiteReady(suite) ? "Mark suite ready for review" : "Finish composition first"}
                onClick={() => transitionPublish(suite.id, "mark_ready")}
              >
                Mark ready
              </button>
            ) : null}
            {suite.publishState === "ready" ? (
              <button
                type="button"
                className={`${BUTTON.primaryRow} !mt-0 px-3 py-1.5 text-xs`}
                disabled={!canPublishSuite(suite)}
                title={
                  canPublishSuite(suite)
                    ? "Publish to licensee marketplace"
                    : "Link a Stripe product before publishing"
                }
                onClick={() => transitionPublish(suite.id, "publish")}
              >
                Publish to marketplace
              </button>
            ) : null}
            {suite.publishState === "published" ? (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Live in licensee Marketplace</span>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
        <Cog className="h-4 w-4 text-zinc-500" aria-hidden />
        <span className="text-zinc-700 dark:text-zinc-300">
          Composition <strong className="text-zinc-900 dark:text-zinc-100">{completeness}%</strong> complete
        </span>
        {suite.stripeProductId ? (
          <span className="text-zinc-500 dark:text-zinc-400">
            Stripe · <code className="text-xs">{suite.stripeProductId}</code>
          </span>
        ) : (
          <Link href={appHref("/suites/billing")} className="font-medium text-sky-700 underline dark:text-sky-400">
            Link Stripe product
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {BUILDER_STUB_ACTIONS.map((action) => (
          <StubAddButton key={action.id} label={action.label} icon={action.icon} />
        ))}
      </div>

      <nav aria-label="Suite builder sections" className="min-w-0 overflow-x-auto pb-px">
        <div className="flex w-max min-w-full flex-nowrap items-end gap-1 border-b border-zinc-200 dark:border-zinc-800">
          {(
            [
              { id: "composition" as const, label: "Modules & phases" },
              { id: "linkbots" as const, label: "LiNKbots" },
              { id: "automations" as const, label: "Automations" },
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
            No modules yet. Use <strong>Add module</strong> to start assembling this suite.
          </p>
        )
      ) : null}

      {tab === "linkbots" ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {suite.linkbotCount > 0
            ? `${suite.linkbotCount} LiNKbot assignees across issues — edit from the composition tree or Add LiNKbot.`
            : "Assign LiNKbots to issues so judgment work runs under governed sessions."}
        </p>
      ) : null}

      {tab === "automations" ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {suite.automationCount > 0
            ? `${suite.automationCount} LiNKautowork automations wired — deterministic steps run without model spend.`
            : "Add automations for deterministic workflow steps between LiNKbot judgment points."}
        </p>
      ) : null}

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Mock builder — state changes and composition edits persist in a later wave. Published suites appear in the
        licensee Marketplace; pricing is managed in{" "}
        <Link href={appHref("/suites/billing")} className="font-medium text-sky-700 underline dark:text-sky-400">
          Stripe products
        </Link>
        .
      </p>
    </main>
  );
}
