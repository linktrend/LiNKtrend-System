"use client";

import { useActionState, useId, useState } from "react";

import { ROLE_TIER_LABELS, type AppRoleTier } from "@/lib/app-roles";
import { PERMISSIONS_PAGE_COPY } from "@/lib/permissions-page-copy";
import { BUTTON, FIELD } from "@/lib/ui-standards";

type InviteCopy = {
  addTeamMember: string;
  inviteTeamMemberTitle: string;
  inviteTeamMemberBody: string;
};

type InviteActionState = { ok: boolean; error?: string; message?: string } | null;

type InviteAction = (prev: InviteActionState, formData: FormData) => Promise<InviteActionState>;

function InviteTeamMemberModal(props: {
  open: boolean;
  onClose: () => void;
  copy: InviteCopy;
  inviteAction?: InviteAction;
  roleOptions?: AppRoleTier[];
}) {
  const titleId = useId();
  const [state, action, pending] = useActionState<InviteActionState, FormData>(
    props.inviteAction ?? (async () => ({ ok: false, error: "Invite is not configured." })),
    null,
  );

  const roles = props.roleOptions ?? (["user", "admin", "super_admin"] as AppRoleTier[]);

  if (!props.open) return null;

  const closeOnSuccess = state?.ok === true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 dark:bg-black/60"
        aria-label="Close dialog"
        onClick={props.onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
      >
        <h2 id={titleId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {props.copy.inviteTeamMemberTitle}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{props.copy.inviteTeamMemberBody}</p>

        {closeOnSuccess ? (
          <div className="mt-4 space-y-4">
            <p role="status" className="text-sm text-emerald-800 dark:text-emerald-200">
              {state.message ?? "Invitation recorded."}
            </p>
            <button type="button" className={BUTTON.primaryRow} onClick={props.onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className="mt-4 space-y-4" action={action}>
            <label className="block">
              <span className={FIELD.label}>Full name</span>
              <input
                type="text"
                name="full_name"
                required
                autoComplete="name"
                className={`mt-1 ${FIELD.control}`}
                placeholder="Alex Chen"
                disabled={pending}
              />
            </label>
            <label className="block">
              <span className={FIELD.label}>Email</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className={`mt-1 ${FIELD.control}`}
                placeholder="name@linktrend.io"
                disabled={pending}
              />
            </label>
            <label className="block">
              <span className={FIELD.label}>Role</span>
              <select name="role" defaultValue="user" className={`mt-1 ${FIELD.control}`} disabled={pending}>
                {roles.map((tier) => (
                  <option key={tier} value={tier}>
                    {ROLE_TIER_LABELS[tier]}
                  </option>
                ))}
              </select>
            </label>
            {state?.ok === false && state.error ? (
              <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={BUTTON.secondaryRow} onClick={props.onClose} disabled={pending}>
                Cancel
              </button>
              <button type="submit" className={BUTTON.primaryRow} disabled={pending}>
                {pending ? "Sending…" : "Send invite"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function TeamMembersAddButton(props: {
  copy?: InviteCopy;
  canInvite?: boolean;
  inviteAction?: InviteAction;
  roleOptions?: AppRoleTier[];
}) {
  const copy = props.copy ?? PERMISSIONS_PAGE_COPY;
  const [modalOpen, setModalOpen] = useState(false);

  if (props.canInvite === false) return null;

  return (
    <>
      <button type="button" className={`${BUTTON.addRow} shrink-0`} onClick={() => setModalOpen(true)}>
        {copy.addTeamMember}
      </button>
      <InviteTeamMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        copy={copy}
        inviteAction={props.inviteAction}
        roleOptions={props.roleOptions}
      />
    </>
  );
}
