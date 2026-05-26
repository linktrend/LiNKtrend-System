"use client";

import { useActionState } from "react";

import { commandCentreRoleLabel, type CommandCentreRole } from "@/lib/command-centre-shared";
import { DataTableRow, DT } from "@/components/data-table";
import { InsetSelect } from "@/components/forms";
import { BUTTON } from "@/lib/ui-standards";

import type { RoleActionState } from "./actions";
import { setCommandCentreRole } from "./actions";

type Row = {
  userId: string;
  email: string | null;
  dbRole: CommandCentreRole | null;
  effectiveRole: CommandCentreRole;
};

export function RoleRowForm(props: { row: Row }) {
  const formId = `role-row-${props.row.userId}`;
  const [setState, setAction, setPending] = useActionState<RoleActionState, FormData>(
    setCommandCentreRole,
    null,
  );

  const msg = setState?.ok === false ? setState.error : null;
  const ok = setState?.ok === true;

  return (
    <DataTableRow multiline>
      <td className={`${DT.tdClipInset} text-sm text-zinc-900 dark:text-zinc-100`}>
        <span className={DT.tdTextSpan}>{props.row.email ?? "—"}</span>
        <span className="mt-0.5 block font-mono text-[10px] text-zinc-400">{props.row.userId}</span>
      </td>
      <td className={`${DT.tdClipInset} text-sm text-zinc-700 dark:text-zinc-300`}>
        <span className={DT.tdTextSpan}>{commandCentreRoleLabel(props.row.effectiveRole)}</span>
      </td>
      <td className={DT.tdControl}>
        <div className={DT.controlInner}>
          <form id={formId} action={setAction}>
            <input type="hidden" name="target_user_id" value={props.row.userId} />
            <InsetSelect
              compact
              name="role"
              defaultValue={props.row.dbRole ?? props.row.effectiveRole}
              disabled={setPending}
            >
              <option value="admin">Admin</option>
              <option value="operator">Operator</option>
              <option value="viewer">Viewer</option>
            </InsetSelect>
          </form>
        </div>
      </td>
      <td className={DT.tdControl}>
        <div className={DT.controlInner}>
          <button type="submit" form={formId} disabled={setPending} className={BUTTON.primaryCompact}>
            Save
          </button>
          {ok ? <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">Updated.</p> : null}
          {msg ? <p className="mt-1 text-xs text-red-700 dark:text-red-300">{msg}</p> : null}
        </div>
      </td>
    </DataTableRow>
  );
}
