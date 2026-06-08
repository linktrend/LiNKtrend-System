"use client";

import { useActionState } from "react";

import { DataTableRow, DT } from "@/components/data-table";
import { InsetSelect } from "@/components/forms";
import { ROLE_TIER_LABELS, type AppRoleTier } from "@/lib/app-roles";
import { BUTTON } from "@/lib/ui-standards";

import {
  setLicensorOperatorRole,
  type LicensorAccessActionState,
} from "@/app/(admin-shell)/admin/settings/access/actions";

export type LicensorRoleRow = {
  userId: string;
  email: string | null;
  fullName: string | null;
  appRoleTier: AppRoleTier;
};

export function LicensorRoleRowForm(props: { row: LicensorRoleRow; canEdit: boolean }) {
  const formId = `licensor-role-${props.row.userId}`;
  const [state, action, pending] = useActionState<LicensorAccessActionState, FormData>(
    setLicensorOperatorRole,
    null,
  );

  const msg = state?.ok === false ? state.error : null;
  const ok = state?.ok === true;

  return (
    <DataTableRow multiline>
      <td className={DT.tdClipInset}>
        <span className={`${DT.tdTextSpan} font-medium text-zinc-900 dark:text-zinc-100`}>
          {props.row.fullName ?? props.row.email ?? "—"}
        </span>
        {props.row.email ? (
          <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{props.row.email}</span>
        ) : null}
      </td>
      <td className={DT.tdClipInset}>
        <span className={DT.tdTextSpan}>{ROLE_TIER_LABELS[props.row.appRoleTier]}</span>
      </td>
      <td className={DT.tdControl}>
        <div className={DT.controlInner}>
          <form id={formId} action={action}>
            <input type="hidden" name="target_user_id" value={props.row.userId} />
            <InsetSelect
              compact
              name="role"
              defaultValue={props.row.appRoleTier}
              disabled={!props.canEdit || pending}
            >
              <option value="user">{ROLE_TIER_LABELS.user}</option>
              <option value="admin">{ROLE_TIER_LABELS.admin}</option>
              <option value="super_admin">{ROLE_TIER_LABELS.super_admin}</option>
            </InsetSelect>
          </form>
        </div>
      </td>
      <td className={DT.tdControl}>
        <div className={DT.controlInner}>
          <button
            type="submit"
            form={formId}
            disabled={!props.canEdit || pending}
            className={BUTTON.primaryCompact}
          >
            Save
          </button>
          {ok ? <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">{state?.message ?? "Updated."}</p> : null}
          {msg ? <p className="mt-1 text-xs text-red-700 dark:text-red-300">{msg}</p> : null}
        </div>
      </td>
    </DataTableRow>
  );
}
