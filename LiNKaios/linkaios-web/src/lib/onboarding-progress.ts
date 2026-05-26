"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export const LICENSEE_ONBOARDING_STORAGE_KEY = "linkaios.onboarding.licensee";

export const LICENSEE_ONBOARDING_STEPS = [
  {
    id: "organisation",
    title: "Confirm company structure",
    description: "Check legal entities, brands, and how your workspace is organized.",
    href: "/company",
  },
  {
    id: "invite-admin",
    title: "Invite Admin",
    description: "Add an executive or operator who can supervise day-to-day work.",
    href: "/settings/access",
  },
  {
    id: "first-suite",
    title: "Subscribe first suite",
    description: "Enable a product package — includes LiNKbots, automations, and governed skills.",
    href: "/suites/marketplace",
  },
  {
    id: "integration",
    title: "Connect an integration",
    description: "Wire a governed connector so suites can reach your CRM, email, or other tools.",
    href: "/skills/connectors",
  },
] as const;

export type LicenseeOnboardingStepId = (typeof LICENSEE_ONBOARDING_STEPS)[number]["id"];

export type LicenseeOnboardingProgress = {
  completedSteps: LicenseeOnboardingStepId[];
  wizardDismissed: boolean;
  bannerDismissed: boolean;
};

const EMPTY_PROGRESS: LicenseeOnboardingProgress = {
  completedSteps: [],
  wizardDismissed: false,
  bannerDismissed: false,
};

function readProgress(): LicenseeOnboardingProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(LICENSEE_ONBOARDING_STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<LicenseeOnboardingProgress>;
    return {
      completedSteps: Array.isArray(parsed.completedSteps)
        ? parsed.completedSteps.filter((id): id is LicenseeOnboardingStepId =>
            LICENSEE_ONBOARDING_STEPS.some((step) => step.id === id),
          )
        : [],
      wizardDismissed: Boolean(parsed.wizardDismissed),
      bannerDismissed: Boolean(parsed.bannerDismissed),
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

function writeProgress(progress: LicenseeOnboardingProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LICENSEE_ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
}

export function isLicenseeOnboardingComplete(progress: LicenseeOnboardingProgress): boolean {
  return LICENSEE_ONBOARDING_STEPS.every((step) => progress.completedSteps.includes(step.id));
}

export function licenseeOnboardingProgressRatio(progress: LicenseeOnboardingProgress): {
  completed: number;
  total: number;
} {
  const total = LICENSEE_ONBOARDING_STEPS.length;
  const completed = LICENSEE_ONBOARDING_STEPS.filter((step) => progress.completedSteps.includes(step.id)).length;
  return { completed, total };
}

export function useOnboardingProgress() {
  const [progress, setProgress] = useState<LicenseeOnboardingProgress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(readProgress());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: LicenseeOnboardingProgress) => {
    setProgress(next);
    writeProgress(next);
  }, []);

  const completeStep = useCallback(
    (stepId: LicenseeOnboardingStepId) => {
      setProgress((current) => {
        if (current.completedSteps.includes(stepId)) return current;
        const next = { ...current, completedSteps: [...current.completedSteps, stepId] };
        writeProgress(next);
        return next;
      });
    },
    [],
  );

  const dismissWizard = useCallback(() => {
    persist({ ...readProgress(), wizardDismissed: true });
  }, [persist]);

  const dismissBanner = useCallback(() => {
    persist({ ...readProgress(), bannerDismissed: true });
  }, [persist]);

  const resetProgress = useCallback(() => {
    persist(EMPTY_PROGRESS);
  }, [persist]);

  const complete = useMemo(() => isLicenseeOnboardingComplete(progress), [progress]);
  const ratio = useMemo(() => licenseeOnboardingProgressRatio(progress), [progress]);

  return {
    progress,
    hydrated,
    complete,
    ratio,
    completeStep,
    dismissWizard,
    dismissBanner,
    resetProgress,
  };
}
