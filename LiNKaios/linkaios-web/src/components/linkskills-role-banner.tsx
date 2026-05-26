"use client";

import Link from "next/link";
import { useState } from "react";
import { Lock, ShieldAlert } from "lucide-react";

import { useAppRole } from "@/components/role-preview-provider";
import { linkskillsAccessMode } from "@/lib/app-roles";
import { BUTTON } from "@/lib/ui-standards";

export function LinkskillsRoleBanner() {
  const { kind, role } = useAppRole();
  const mode = linkskillsAccessMode(kind, role);
  const [requested, setRequested] = useState(false);

  if (mode !== "readonly") return null;

  return (
    <section
      className="mb-6 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30"
      aria-label="LiNKskills access notice"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-amber-950 dark:text-amber-50">LiNKskills is read-only for your role</p>
            <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-100/90">
              You can browse skills, tools, and capability leases. Editing the catalogue or publishing changes requires a higher role.
            </p>
            {requested ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 dark:text-amber-200">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
                Access request noted — your admin can follow up in Work.
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button type="button" onClick={() => setRequested(true)} className={BUTTON.secondaryCompact}>
            Request access
          </button>
          <Link href="/work" className={BUTTON.primaryCompact}>
            Open Work
          </Link>
        </div>
      </div>
    </section>
  );
}
