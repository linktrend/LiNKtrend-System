"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { ADMIN_BASE_PATH, LICENSEE_HOME_PATH } from "@/lib/app-surface";

function intentLabel(next: string): string {
  if (next === ADMIN_BASE_PATH || next.startsWith(`${ADMIN_BASE_PATH}/`)) {
    return "LiNKaios Admin (operator workspace)";
  }
  if (
    next === LICENSEE_HOME_PATH ||
    next.startsWith("/work") ||
    next.startsWith("/client") ||
    next.startsWith("/app")
  ) {
    return "LiNKaios Client";
  }
  return "LiNKaios Client";
}

/** When `?next=` is set, explain why sign-in is required and scroll to the form. */
export function LandingNextIntent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next")?.trim();

  useEffect(() => {
    if (!next) return;
    const target = document.getElementById("sign-in");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      const email = target.querySelector<HTMLInputElement>('input[name="email"], input[type="email"]');
      email?.focus({ preventScroll: true });
    }
  }, [next]);

  if (!next?.startsWith("/")) return null;

  return (
    <div
      role="status"
      className="mb-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-100"
    >
      Sign in below to open <span className="font-semibold">{intentLabel(next)}</span>.
    </div>
  );
}
