"use client";

import { useAppRole } from "@/components/role-preview-provider";
import { canInteractWithLinkbotSession } from "@/lib/app-roles";
import { BUTTON } from "@/lib/ui-standards";

function requestEscalationNotice() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("linkaios-toast", {
      detail: "Your session issue was escalated to an Admin or Super Admin for review.",
    }),
  );
}

export function SessionInteractionPanel() {
  const { kind, role } = useAppRole();
  const canInteract = canInteractWithLinkbotSession(kind, role);

  if (!canInteract) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Session access</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          You can review this session timeline and outputs. Sending messages requires Admin or Super Admin access. If
          something looks wrong, escalate it to your workspace admin. Use the Native UI tab to open the agent shell.
        </p>
        <button type="button" className={`${BUTTON.secondaryCompact} mt-4`} onClick={requestEscalationNotice}>
          Report issue to Admin
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Interaction</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Send messages into this session once your gateway bridges operator chat to bot runtime. Open the agent shell from
        the Native UI tab when you need the full operator interface.
      </p>
      <textarea
        disabled
        rows={4}
        className="mt-4 w-full max-w-xl rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400"
        placeholder="Messaging not connected for this session…"
      />
    </section>
  );
}
