"use client";

import { useState } from "react";

import { useAppRole } from "@/components/role-preview-provider";
import { StatusPill } from "@/components/ui/status-pill";
import { canManageLinkbotLifecycle } from "@/lib/app-roles";
import { BUTTON, formatUiLabel } from "@/lib/ui-standards";

type LifecycleState = "active" | "suspended" | "terminated";

export function WorkerLifecyclePanel(props: { agentId: string; displayName: string }) {
  const { kind, role } = useAppRole();
  const canManage = canManageLinkbotLifecycle(kind, role);
  const [state, setState] = useState<LifecycleState>("active");
  const [confirmDelete, setConfirmDelete] = useState("");

  if (!canManage) {
    return (
      <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
        Only workspace Super Admins can suspend or remove LiNKbots. Contact your administrator if this bot should be
        taken offline.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Current state</span>
        <StatusPill
          label={formatUiLabel(state === "active" ? "Active" : state === "suspended" ? "Suspended" : "Terminated")}
          tone={state === "active" ? "success" : state === "suspended" ? "warning" : "danger"}
        />
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Suspend</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Pause new sessions for {props.displayName}. Existing sessions finish; scheduled work will not start.
        </p>
        <button
          type="button"
          className={`${BUTTON.secondaryCardAction} mt-3 !mt-3`}
          disabled={state !== "active"}
          onClick={() => setState("suspended")}
        >
          Suspend LiNKbot
        </button>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
        <h3 className="text-sm font-semibold text-amber-950 dark:text-amber-50">Terminate</h3>
        <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-100/90">
          End all active sessions and mark the bot terminated. Configuration and audit history remain for compliance.
        </p>
        <button
          type="button"
          className={`${BUTTON.rejectOutlineRow} mt-3 !mt-3`}
          disabled={state === "terminated"}
          onClick={() => setState("terminated")}
        >
          Terminate LiNKbot
        </button>
      </section>

      <section className="rounded-xl border border-red-200 bg-red-50/50 p-5 shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
        <h3 className="text-sm font-semibold text-red-950 dark:text-red-100">Delete</h3>
        <p className="mt-1 text-sm text-red-900/90 dark:text-red-100/90">
          Request permanent removal of {props.displayName} from the fleet registry. Deletion runs only after governance
          approval.
        </p>
        <label className="mt-3 block space-y-1.5">
          <span className="text-xs font-medium text-red-900 dark:text-red-200">Type DELETE to confirm</span>
          <input
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-red-300 bg-white px-3 py-2 text-sm dark:border-red-800 dark:bg-zinc-950"
          />
        </label>
        <button
          type="button"
          className={`${BUTTON.rejectRow} mt-3 !mt-3`}
          disabled={confirmDelete !== "DELETE" || state === "terminated"}
        >
          Submit delete request
        </button>
      </section>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Lifecycle changes are audited. Licensor operators use the same controls when supporting a licensee fleet.
      </p>
    </div>
  );
}
