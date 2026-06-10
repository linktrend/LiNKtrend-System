"use client";

import { useAppRole } from "@/components/role-preview-provider";
import { canInteractWithLinkbotSession } from "@/lib/app-roles";
import type { SessionToolCallEntry } from "@/lib/session-detail-data";
import { BUTTON } from "@/lib/ui-standards";

function requestEscalationNotice() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("linkaios-toast", {
      detail: "Your session issue was escalated to an Admin or Super Admin for review.",
    }),
  );
}

export function SessionInteractionPanel(props: { toolCalls: SessionToolCallEntry[] }) {
  const { kind, role } = useAppRole();
  const canInteract = canInteractWithLinkbotSession(kind, role);
  const toolCalls = props.toolCalls;

  if (!canInteract) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Interaction</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          You can review tool calls and session outputs below. Sending messages requires Admin or Super Admin access.
        </p>
        {toolCalls.length > 0 ? (
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
            {toolCalls.map((call, index) => (
              <li key={`${call.name}-${index}`} className="text-sm">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{call.name}</span>
                {call.status ? <span className="ml-2 text-xs text-zinc-500">· {call.status}</span> : null}
                {call.detail ? <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{call.detail}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">No tool calls recorded for this session yet.</p>
        )}
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
        Tool calls and operator actions recorded for this session.
      </p>
      {toolCalls.length > 0 ? (
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
          {toolCalls.map((call, index) => (
            <li key={`${call.name}-${index}`} className="text-sm">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{call.name}</span>
              {call.status ? <span className="ml-2 text-xs text-zinc-500">· {call.status}</span> : null}
              {call.at ? <span className="ml-2 text-xs text-zinc-400">{new Date(call.at).toLocaleString()}</span> : null}
              {call.detail ? <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{call.detail}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">No tool calls recorded for this session yet.</p>
      )}
      <textarea
        disabled
        rows={3}
        className="mt-4 w-full max-w-xl rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400"
        placeholder="Live operator messaging not connected for this session…"
      />
    </section>
  );
}
