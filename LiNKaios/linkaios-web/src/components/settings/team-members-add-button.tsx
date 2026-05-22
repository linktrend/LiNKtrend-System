"use client";

import { useId, useState } from "react";

import { PERMISSIONS_PAGE_COPY } from "@/lib/permissions-page-copy";
import { BUTTON, FIELD } from "@/lib/ui-standards";

function InviteTeamMemberModal(props: { open: boolean; onClose: () => void }) {
  const titleId = useId();
  const [email, setEmail] = useState("");

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-zinc-900/50 dark:bg-black/60" aria-label="Close dialog" onClick={props.onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
      >
        <h2 id={titleId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {PERMISSIONS_PAGE_COPY.inviteTeamMemberTitle}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{PERMISSIONS_PAGE_COPY.inviteTeamMemberBody}</p>
        <label className="mt-4 block">
          <span className={FIELD.label}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 ${FIELD.control}`}
            placeholder="name@company.com"
            autoComplete="email"
          />
        </label>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className={BUTTON.secondaryRow} onClick={props.onClose}>
            Cancel
          </button>
          <button type="button" className={BUTTON.primaryRow} onClick={props.onClose}>
            Send invite
          </button>
        </div>
      </div>
    </div>
  );
}

export function TeamMembersAddButton() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button type="button" className={`${BUTTON.addRow} shrink-0`} onClick={() => setModalOpen(true)}>
        {PERMISSIONS_PAGE_COPY.addTeamMember}
      </button>
      <InviteTeamMemberModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
