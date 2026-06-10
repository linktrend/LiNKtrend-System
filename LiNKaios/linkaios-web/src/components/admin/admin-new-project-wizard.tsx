"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ListOrdered, Rocket } from "lucide-react";

import { TitledCardHeader } from "@/components/titled-card-header";
import { UiButton } from "@/components/ui/button-bridge";
import { ADMIN_PROJECTS_PAGE } from "@/lib/admin-projects-copy";
import {
  ADMIN_PROJECT_CREATE_PRESETS,
  adminProjectTypeLabel,
  type AdminProjectType,
} from "@/lib/admin-project-types";
import { ADMIN_BASE_PATH } from "@/lib/app-surface";
import { BUTTON } from "@/lib/ui-standards";

type Cadence = "once" | "continuous";

const STEPS = ["Type", "Cadence", "Launch"] as const;

const PROJECT_TYPES: AdminProjectType[] = ["suite_gen", "librarian_filings", "platform_ops"];

function stepClass(active: boolean, done: boolean): string {
  const base = "rounded-lg border px-3 py-2 text-xs font-medium ";
  if (active) return base + "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900";
  if (done) return base + "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100";
  return base + "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400";
}

export function AdminNewProjectWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [projectType, setProjectType] = useState<AdminProjectType>("suite_gen");
  const [cadence, setCadence] = useState<Cadence>("once");
  const [projectName, setProjectName] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const preset = ADMIN_PROJECT_CREATE_PRESETS[projectType];

  function canNext(): boolean {
    if (step === 0) return Boolean(projectType);
    if (step === 1) return cadence === "once" || cadence === "continuous";
    return projectName.trim().length > 0;
  }

  async function launchProject() {
    if (!canNext()) return;

    setLaunchError(null);
    setIsLaunching(true);

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName.trim(),
          projectType,
          cadence,
        }),
      });

      const payload = (await res.json().catch(() => null)) as { projectId?: string; error?: string } | null;

      if (!res.ok || !payload?.projectId) {
        setLaunchError(payload?.error ?? "Could not create the project. Check your entries and try again.");
        return;
      }

      router.push(`${ADMIN_BASE_PATH}/projects/${payload.projectId}?created=1`);
    } catch {
      setLaunchError("Could not reach LiNKaios. Try again in a moment.");
    } finally {
      setIsLaunching(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <TitledCardHeader
          icon={ListOrdered}
          title={ADMIN_PROJECTS_PAGE.wizardTitle}
          titleClassName="text-sm font-semibold text-zinc-500 dark:text-zinc-400"
        />
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map((label, i) => (
            <li key={label} className={stepClass(step === i, step > i)}>
              {i + 1}. {label}
            </li>
          ))}
        </ol>
      </section>

      {step === 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Choose project type</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{ADMIN_PROJECTS_PAGE.wizardTypeHint}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {PROJECT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setProjectType(type)}
                className={
                  "rounded-xl border px-4 py-3 text-left " +
                  (projectType === type
                    ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900/60"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950")
                }
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{adminProjectTypeLabel(type)}</p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {ADMIN_PROJECT_CREATE_PRESETS[type].summary}
                </p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Project cadence</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Once projects complete after a single pass. Continuous projects schedule recurring Runs.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["once", "Once", "Single delivery track for this vendor project."],
                ["continuous", "Continuous", "Recurring Runs for ongoing studio operations."],
              ] as const
            ).map(([id, title, desc]) => (
              <button
                key={id}
                type="button"
                onClick={() => setCadence(id)}
                className={
                  "rounded-xl border px-4 py-3 text-left " +
                  (cadence === id
                    ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900/60"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950")
                }
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{desc}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-4">
          <TitledCardHeader icon={Rocket} title="Review & launch" titleClassName="text-sm font-semibold text-zinc-900 dark:text-zinc-100" />
          <label className="block text-sm">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">Project name</span>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. LiNKsuitegen Q2 catalogue"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Type</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">{adminProjectTypeLabel(projectType)}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Cadence</dt>
              <dd className="font-medium capitalize text-zinc-900 dark:text-zinc-100">{cadence}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-zinc-500">Modules</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">{preset.moduleIds.join(" → ")}</dd>
            </div>
          </dl>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{ADMIN_PROJECTS_PAGE.wizardLaunchHint}</p>
        </section>
      ) : null}

      {launchError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {launchError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {step === 0 ? (
          <Link href={`${ADMIN_BASE_PATH}/projects`} className={BUTTON.secondaryCompact}>
            Cancel
          </Link>
        ) : null}
        {step > 0 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} className={BUTTON.editCompact} disabled={isLaunching}>
            Back
          </button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <button type="button" disabled={!canNext()} onClick={() => setStep((s) => s + 1)} className={BUTTON.approveCompact}>
            Continue
          </button>
        ) : (
          <UiButton buttonKey="approveRow" type="button" disabled={!canNext() || isLaunching} onClick={() => void launchProject()}>
            {isLaunching ? "Launching…" : "Launch project"}
          </UiButton>
        )}
      </div>
    </div>
  );
}
