import Link from "next/link";

import { BADGE } from "@/lib/ui-standards";
import {
  MODULES_CATALOG_DEMO,
  type AudienceMode,
  issueVisibleToAudience,
  moduleVisibleToAudience,
  projectTypeVisibleToAudience,
} from "@/lib/ui-mocks/modules-catalog-demo";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";

function audienceBadge(audience: AudienceMode) {
  return audience === "vendor"
    ? "inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
    : "inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100";
}

const VENDOR_ONLY_BADGE =
  "inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100";
const META_BADGE =
  "inline-flex items-center rounded-full border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200";
const TEMPLATE_BADGE =
  "inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-100";

type BrowseMode = "module" | "project-type";

function issueStatusClass(status: "open" | "watch" | "resolved") {
  if (status === "resolved") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (status === "watch") return "bg-amber-50 text-amber-900 ring-amber-200";
  return "bg-red-100 text-red-900 ring-red-200";
}

export function ModulesCatalogue(props: { browse: BrowseMode; audience: AudienceMode; moduleId?: string; projectTypeId?: string }) {
  const modules = MODULES_CATALOG_DEMO.modules.filter((m) => moduleVisibleToAudience(m, props.audience));
  const projectTypes = MODULES_CATALOG_DEMO.projectTypes.filter((p) => projectTypeVisibleToAudience(p, props.audience));

  const moduleId = props.moduleId ?? modules[0]?.id;
  const selectedModule = modules.find((m) => m.id === moduleId) ?? modules[0] ?? null;
  const selectedModuleProjectTypes = projectTypes.filter((p) => p.moduleId === selectedModule?.id);

  const projectTypeId = props.projectTypeId ?? projectTypes[0]?.id;
  const selectedProjectType = projectTypes.find((p) => p.id === projectTypeId) ?? projectTypes[0] ?? null;
  const moduleForProjectType = modules.find((m) => m.id === selectedProjectType?.moduleId) ?? null;

  const audienceQ = props.audience === "vendor" ? "vendor" : "client";
  const uiMocks = isUiMocksEnabled();

  return (
    <div className="space-y-4">
      {(uiMocks || props.audience === "vendor") && (
        <div className="flex flex-wrap items-center gap-2">
          {uiMocks ? <span className={META_BADGE}>Mock sample data</span> : null}
          {uiMocks ? <span className={META_BADGE}>Protected IP hidden</span> : null}
          {uiMocks ? <span className={audienceBadge(props.audience)}>{props.audience === "vendor" ? "Vendor scope" : "Client scope"}</span> : null}
          {props.audience === "vendor" ? <span className={VENDOR_ONLY_BADGE}>Vendor-only fields</span> : null}
        </div>
      )}

      {modules.length === 0 || projectTypes.length === 0 ? (
        <section className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
          No modules or project types are visible for this tenant yet. Check licensing in Cockpit or switch to vendor view
          in mock mode.
        </section>
      ) : null}

      {props.browse === "module" && selectedModule ? (
        <section className="grid gap-4 lg:grid-cols-[20rem,1fr]">
          <article className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Module catalogue</h2>
            <ul className="mt-3 space-y-2">
              {modules.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/modules/${m.id}?audience=${audienceQ}`}
                    className={`block rounded-lg border px-3 py-2 text-sm transition ${
                      m.id === selectedModule.id
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <p className="font-semibold">{m.name}</p>
                    <p className="mt-1 text-xs opacity-85">{m.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className={META_BADGE}>Published</span>
                      <span className={META_BADGE}>{m.clientLicensed ? "Licensed" : "Unlicensed"}</span>
                      {m.published && m.clientLicensed ? <span className={META_BADGE}>Client-visible</span> : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
          <article className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{selectedModule.name}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedModule.summary}</p>
            {props.audience === "vendor" ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <span className={VENDOR_ONLY_BADGE}>Vendor-only</span> Owner: {selectedModule.vendorOwner}
              </p>
            ) : null}

            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Project types</h4>
              {selectedModuleProjectTypes.length === 0 ? <p className="text-sm text-zinc-500">No project types found.</p> : null}
              {selectedModuleProjectTypes.map((pt) => (
                <div key={pt.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <Link
                    href={`/modules/project-types/${pt.id}?audience=${audienceQ}`}
                    className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
                  >
                    {pt.name}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{pt.clientSafeSummary}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className={META_BADGE}>{pt.published ? "Published" : "Not published"}</span>
                    <span className={META_BADGE}>{pt.clientLicensed ? "Licensed" : "Unlicensed"}</span>
                    {pt.published && pt.clientLicensed ? <span className={META_BADGE}>Client-visible</span> : null}
                    <span className={TEMPLATE_BADGE}>Process template</span>
                  </div>
                  {props.audience === "vendor" ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      <span className={VENDOR_ONLY_BADGE}>Vendor-only</span> {pt.vendorOnlyNote}
                    </p>
                  ) : null}
                  <ul className="mt-3 space-y-2">
                    {pt.workflows.map((wf) => (
                      <li key={wf.id} className="rounded-md border border-zinc-100 bg-zinc-50 px-2 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                          {wf.name} · {wf.stage}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{wf.clientSafeSummary}</p>
                        {props.audience === "vendor" ? (
                          <p className="mt-1 text-xs text-zinc-500">
                            <span className={VENDOR_ONLY_BADGE}>Vendor-only</span> {wf.vendorOperationalNote}
                          </p>
                        ) : null}
                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          Template tasks
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {wf.issues.filter((i) => issueVisibleToAudience(i, props.audience)).map((issue) => (
                            <span
                              key={issue.id}
                              className={`${BADGE.status} ${issueStatusClass(issue.status)}`}
                              title="Blueprint example — not a live project issue"
                            >
                              {issue.id}: {issue.title}
                            </span>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {props.browse === "project-type" && selectedProjectType ? (
        <section className="grid gap-4 lg:grid-cols-[20rem,1fr]">
          <article className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Project type catalogue</h2>
            <ul className="mt-3 space-y-2">
              {projectTypes.map((pt) => (
                <li key={pt.id}>
                  <Link
                    href={`/modules/project-types/${pt.id}?audience=${audienceQ}`}
                    className={`block rounded-lg border px-3 py-2 text-sm transition ${
                      pt.id === selectedProjectType.id
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <p className="font-semibold">{pt.name}</p>
                    <p className="mt-1 text-xs opacity-85">Module: {MODULES_CATALOG_DEMO.modules.find((m) => m.id === pt.moduleId)?.name ?? "Unknown"}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className={META_BADGE}>{pt.published ? "Published" : "Not published"}</span>
                      <span className={META_BADGE}>{pt.clientLicensed ? "Licensed" : "Unlicensed"}</span>
                      {pt.published && pt.clientLicensed ? <span className={META_BADGE}>Client-visible</span> : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
          <article className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{selectedProjectType.name}</h3>
              <span className={TEMPLATE_BADGE}>Process template</span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedProjectType.clientSafeSummary}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Module:{" "}
              <Link href={`/modules/${selectedProjectType.moduleId}?audience=${audienceQ}`} className="font-semibold text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-200">
                {moduleForProjectType?.name ?? "Unknown"}
              </Link>
            </p>
            {props.audience === "vendor" ? (
              <p className="text-xs text-zinc-500">
                <span className={VENDOR_ONLY_BADGE}>Vendor-only</span> {selectedProjectType.vendorOnlyNote}
              </p>
            ) : null}

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Workflows and template tasks below define the blueprint. When you start a project, LiNKaios and Plane create live
              instances from this template.
            </p>

            {selectedProjectType.workflows.map((wf) => (
              <div key={wf.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {wf.name} · {wf.stage}
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{wf.clientSafeSummary}</p>
                {props.audience === "vendor" ? (
                  <p className="mt-1 text-xs text-zinc-500">
                    <span className={VENDOR_ONLY_BADGE}>Vendor-only</span> {wf.vendorOperationalNote}
                  </p>
                ) : null}
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Template tasks</p>
                <ul className="mt-1 space-y-1">
                  {wf.issues.filter((i) => issueVisibleToAudience(i, props.audience)).map((issue) => (
                    <li key={issue.id} className="text-xs text-zinc-700 dark:text-zinc-300">
                      <span className="font-semibold">{issue.id}</span> · {issue.title}
                      <span className="ml-1 text-zinc-400">(blueprint)</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </article>
        </section>
      ) : null}
    </div>
  );
}
