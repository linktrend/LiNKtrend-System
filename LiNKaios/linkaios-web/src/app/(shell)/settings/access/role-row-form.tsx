"use client";

import { useActionState } from "react";

import { commandCentreRoleLabel, type CommandCentreRole } from "@/lib/command-centre-shared";
import { TABLE } from "@/lib/ui-standards";

import type { RoleActionState } from "./actions";
import { clearCommandCentreRole, setCommandCentreRole } from "./actions";

type Row = {
  userId: string;
  email: string | null;
  dbRole: CommandCentreRole | null;
  effectiveRole: CommandCentreRole;
};

export function RoleRowForm(props: { row: Row }) {
  const [setState, setAction, setPending] = useActionState<RoleActionState, FormData>(
    setCommandCentreRole,
    null,
  );
  const [clearState, clearAction, clearPending] = useActionState<RoleActionState, FormData>(
    clearCommandCentreRole,
    null,
  );

  const pending = setPending || clearPending;
  const msg = setState?.ok === false ? setState.error : clearState?.ok === false ? clearState.error : null;
  const ok = setState?.ok === true || clearState?.ok === true;

  return (
    <tr className="border-t border-zinc-200 dark:border-zinc-800">
      <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">{props.row.userId}</td>
      <td className="px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100">{props.row.email ?? "—"}</td>
      <td className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300">
        {commandCentreRoleLabel(props.row.effectiveRole)}
      </td>
      <td className={`px-3 py-2 ${TABLE.thControl}`}>
        <form action={setAction} className="flex flex-wrap items-center justify-center gap-2">
          <input type="hidden" name="target_user_id" value={props.row.userId} />
          <select
            name="role"
            defaultValue={props.row.dbRole ?? props.row.effectiveRole}
            disabled={pending}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="admin">Admin</option>
            <option value="operator">Operator</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-zinc-900 px-2 py-1 text-xs font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save
          </button>
        </form>
        <form action={clearAction} className="mt-2 flex justify-center">
          <input type="hidden" name="target_user_id" value={props.row.userId} />
          <button
            type="submit"
            disabled={pending}
            className="text-xs text-zinc-600 underline hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Clear custom role (use Operator)
          </button>
        </form>
        {ok ? <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">Updated.</p> : null}
        {msg ? <p className="mt-1 text-xs text-red-700 dark:text-red-300">{msg}</p> : null}
      </td>
    </tr>
  );
}
