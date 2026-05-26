"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";

import {
  LICENSEE_ONBOARDING_STEPS,
  type LicenseeOnboardingStepId,
  useOnboardingProgress,
} from "@/lib/onboarding-progress";
import { BUTTON } from "@/lib/ui-standards";

function stepIsComplete(stepId: LicenseeOnboardingStepId, completed: LicenseeOnboardingStepId[]): boolean {
  return completed.includes(stepId);
}

function firstIncompleteIndex(completed: LicenseeOnboardingStepId[]): number {
  const index = LICENSEE_ONBOARDING_STEPS.findIndex((step) => !completed.includes(step.id));
  return index >= 0 ? index : 0;
}

type WizardDialogProps = {
  onClose: () => void;
  initialIndex?: number;
};

function LicenseeOnboardingWizardDialog(props: WizardDialogProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { progress, completeStep, dismissWizard } = useOnboardingProgress();
  const [activeIndex, setActiveIndex] = useState(props.initialIndex ?? firstIncompleteIndex(progress.completedSteps));

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const activeStep = LICENSEE_ONBOARDING_STEPS[activeIndex] ?? LICENSEE_ONBOARDING_STEPS[0];
  const activeComplete = stepIsComplete(activeStep.id, progress.completedSteps);
  const isLast = activeIndex >= LICENSEE_ONBOARDING_STEPS.length - 1;

  const close = () => {
    dismissWizard();
    props.onClose();
  };

  const markAndAdvance = () => {
    completeStep(activeStep.id);
    if (isLast) {
      close();
      return;
    }
    setActiveIndex((i) => Math.min(i + 1, LICENSEE_ONBOARDING_STEPS.length - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-zinc-900/55 dark:bg-black/70" aria-label="Dismiss setup wizard" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Licensee setup</p>
            <h2 id={titleId} className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Welcome — let&apos;s configure your workspace
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            aria-label="Close setup wizard"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="grid gap-6 px-6 py-5 md:grid-cols-[11rem_minmax(0,1fr)]">
          <ol className="space-y-2 text-sm">
            {LICENSEE_ONBOARDING_STEPS.map((step, index) => {
              const done = stepIsComplete(step.id, progress.completedSteps);
              const current = index === activeIndex;
              return (
                <li
                  key={step.id}
                  className={`rounded-lg border px-3 py-2 ${
                    current
                      ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900/60"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <span className="inline-flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                    {done ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    ) : (
                      <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-zinc-200 text-[10px] dark:bg-zinc-700">
                        {index + 1}
                      </span>
                    )}
                    {step.title}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{activeStep.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{activeStep.description}</p>
            </div>
            <Link href={activeStep.href} className={`${BUTTON.secondaryCardAction} inline-flex w-fit items-center gap-2`}>
              Open step
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button type="button" onClick={markAndAdvance} className={BUTTON.primaryCompact}>
                {activeComplete ? (isLast ? "Finish setup" : "Next step") : "Mark complete & continue"}
              </button>
              <button type="button" onClick={close} className={BUTTON.secondaryCompact}>
                Continue later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Full-screen dismissible wizard for super_admin first visit. */
export function LicenseeOnboardingWizard() {
  const { progress, hydrated, complete, dismissWizard } = useOnboardingProgress();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hydrated || complete || progress.wizardDismissed) return;
    setOpen(true);
  }, [hydrated, complete, progress.wizardDismissed]);

  if (!open) return null;

  return (
    <LicenseeOnboardingWizardDialog
      initialIndex={firstIncompleteIndex(progress.completedSteps)}
      onClose={() => {
        dismissWizard();
        setOpen(false);
      }}
    />
  );
}

export function LicenseeOnboardingBanner() {
  const { progress, hydrated, complete, ratio, dismissBanner } = useOnboardingProgress();
  const [resumeOpen, setResumeOpen] = useState(false);

  if (!hydrated || complete || progress.bannerDismissed) return null;

  return (
    <>
      {resumeOpen ? <LicenseeOnboardingWizardDialog onClose={() => setResumeOpen(false)} /> : null}
      <section
        className="rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 shadow-sm dark:border-sky-900/50 dark:bg-sky-950/30"
        aria-label="Setup progress"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-sky-950 dark:text-sky-50">Continue setup</p>
            <p className="mt-0.5 text-sm text-sky-900/90 dark:text-sky-100/90">
              {ratio.completed} of {ratio.total} onboarding steps complete — finish workspace configuration when you are ready.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setResumeOpen(true)} className={BUTTON.primaryCompact}>
              Resume wizard
            </button>
            <button type="button" onClick={dismissBanner} className={BUTTON.secondaryCompact}>
              Dismiss
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
