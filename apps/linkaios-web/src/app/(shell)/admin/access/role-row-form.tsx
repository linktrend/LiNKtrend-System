"use client";

import { useActionState } from "react";

import type { CommandCentreRole } from "@/lib/command-centre-access";

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
    <tr className="border-t border-zinc-200">
      <td className="px-3 py-2 font-mono text-xs text-zinc-700">{props.row.userId}</td>
      <td className="px-3 py-2 text-sm text-zinc-900">{props.row.email ?? "—"}</td>
      <td className="px-3 py-2 text-sm text-zinc-700">
        {props.row.dbRole ?? "—"}
        {props.row.dbRole !== props.row.effectiveRole ? (
          <span className="ml-2 text-xs text-amber-700">(effective: {props.row.effectiveRole})</span>
        ) : null}
      </td>
      <td className="px-3 py-2">
        <form action={setAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="target_user_id" value={props.row.userId} />
          <select
            name="role"
            defaultValue={props.row.dbRole ?? props.row.effectiveRole}
            disabled={pending}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm"
          >
            <option value="admin">admin</option>
            <option value="operator">operator</option>
            <option value="viewer">viewer</option>
          </select>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            Save
          </button>
        </form>
        <form action={clearAction} className="mt-2">
          <input type="hidden" name="target_user_id" value={props.row.userId} />
          <button
            type="submit"
            disabled={pending}
            className="text-xs text-zinc-600 underline hover:text-zinc-900 disabled:opacity-50"
          >
            Remove row (default operator)
          </button>
        </form>
        {ok ? <p className="mt-1 text-xs text-emerald-700">Updated.</p> : null}
        {msg ? <p className="mt-1 text-xs text-red-700">{msg}</p> : null}
      </td>
    </tr>
  );
}
