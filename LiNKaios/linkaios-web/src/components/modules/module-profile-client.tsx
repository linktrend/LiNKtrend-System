"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useRegisterBreadcrumbLabel } from "@/components/breadcrumb-label-registry";
import { ModuleCheckoutPanel } from "@/components/modules/module-checkout-panel";
import { ModuleOverviewPanel } from "@/components/modules/module-overview-panel";
import { ModuleProcessTree } from "@/components/modules/module-process-tree";
import { ModuleProjectsTab } from "@/components/modules/module-projects-tab";
import { ModuleSampleOutputsList } from "@/components/modules/module-sample-outputs-list";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { useModuleSubscriptions } from "@/hooks/use-module-subscriptions";
import {
  fixtureLicensedByModule,
  sampleOutputsForModule,
  type ModuleCatalogueItem,
} from "@/lib/ui-mocks/modules-catalog-demo";
import {
  moduleProcessTreeVariant,
  modulesForSuite,
  parseSuiteProfileTab,
  suiteProfileHref,
  suiteProfilePageTitle,
  suiteProfileTabs,
  suitesStartProjectHref,
  type SuiteProfileTab,
} from "@/lib/suites-page-copy";
import { screenTabLinkClass, BUTTON } from "@/lib/ui-standards";

export function ModuleProfileClient(props: { suite: ModuleCatalogueItem; initialTab: string | undefined }) {
  const router = useRouter();
  const fixtureLicensed = useMemo(() => fixtureLicensedByModule(), []);
  const { accessFor, startPreview, subscribe } = useModuleSubscriptions(fixtureLicensed);

  const access = accessFor(props.suite.id);
  const owned = access === "subscribed" || access === "preview";
  const tab = parseSuiteProfileTab(props.initialTab, owned);
  const initialTabRaw = props.initialTab?.trim();

  useEffect(() => {
    if (!owned && initialTabRaw === "projects") {
      router.replace(suiteProfileHref(props.suite.id, "overview"), { scroll: false });
    }
  }, [owned, initialTabRaw, props.suite.id, router]);
  const tabs = suiteProfileTabs(owned);
  const moduleTemplates = modulesForSuite(props.suite.id);
  const samples = sampleOutputsForModule(props.suite.id);

  const tabHref = (id: SuiteProfileTab) =>
    id === "overview" ? `/suites/${props.suite.id}` : `/suites/${props.suite.id}?tab=${id}`;

  useRegisterBreadcrumbLabel(props.suite.id, props.suite.name);

  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title={suiteProfilePageTitle(props.suite, tab, owned)}
        subtitle={props.suite.summary}
        actions={
          owned ? (
            <Link href={suitesStartProjectHref({ suiteId: props.suite.id })} className={BUTTON.addRow}>
              Add Project
            </Link>
          ) : null
        }
      />

      <nav aria-label="Suite profile sections" className="min-w-0 overflow-x-auto pb-px [-webkit-overflow-scrolling:touch]">
        <div className="flex w-max min-w-full flex-nowrap items-end gap-1 border-b border-zinc-200 dark:border-zinc-800">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={tabHref(t.id)}
              className={screenTabLinkClass(tab === t.id)}
              aria-current={tab === t.id ? "page" : undefined}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </nav>

      {tab === "overview" ? <ModuleOverviewPanel suite={props.suite} owned={owned} /> : null}
      {tab === "modules" ? (
        <ModuleProcessTree
          processes={moduleTemplates}
          variant={moduleProcessTreeVariant(owned)}
        />
      ) : null}
      {tab === "projects" && owned ? <ModuleProjectsTab suiteId={props.suite.id} /> : null}
      {tab === "sample-outputs" ? <ModuleSampleOutputsList rows={samples} owned={owned} /> : null}
      {tab === "preview" && !owned ? (
        <ModuleCheckoutPanel
          module={props.suite}
          mode="preview"
          onPreview={() => startPreview(props.suite.id)}
          onSubscribe={() => subscribe(props.suite.id)}
        />
      ) : null}
      {tab === "subscribe" && !owned ? (
        <ModuleCheckoutPanel
          module={props.suite}
          mode="subscribe"
          onPreview={() => startPreview(props.suite.id)}
          onSubscribe={() => subscribe(props.suite.id)}
        />
      ) : null}
    </main>
  );
}
