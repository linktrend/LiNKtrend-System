"use client";

import { useState } from "react";
import { UserX } from "lucide-react";

import { BUTTON, FIELD } from "@/lib/ui-standards";

export function DeleteAccountCard() {
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [proof, setProof] = useState<{ title: string; detail: string } | null>(null);

  function submitDeleteRequest() {
    setDeleteConfirm("");
    setProof({
      title: "Deletion Request Recorded (Mock)",
      detail:
        "Proof: GDPR-ERASE-MOCK-001 logged. You would receive confirmation email; no account data was removed.",
    });
  }

  return (
    <>
      <article className="flex h-full flex-col rounded-xl border border-red-200 bg-red-50/50 p-6 shadow-sm dark:border-red-900/40 dark:bg-red-950/20 md:col-span-2 xl:col-span-3">
        <div className="space-y-1">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 shrink-0 text-red-700 dark:text-red-300">
              <UserX className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-red-900 dark:text-red-100">Delete Account Request</h3>
          </div>
          <p className="text-sm text-red-800/90 dark:text-red-200/90">
            Submit a right-to-erasure request. An Admin must approve before any deletion runs. Mock — no ticket is
            created.
          </p>
        </div>
        <div className="mt-4 flex-1">
          <label className={`block ${FIELD.label} text-red-900 dark:text-red-100`} htmlFor="delete-confirm">
            Type DELETE to Open Confirmation
          </label>
          <input
            id="delete-confirm"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
            className="mt-2 block w-full max-w-xs rounded-lg border border-red-300 bg-white px-3 py-2 text-sm dark:border-red-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <button
            type="button"
            disabled={deleteConfirm.trim() !== "DELETE"}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-red-600"
            onClick={submitDeleteRequest}
          >
            Submit Delete Account Request
          </button>
        </div>
      </article>

      {proof ? (
        <DeleteProofModal detail={proof.detail} title={proof.title} onClose={() => setProof(null)} />
      ) : null}
    </>
  );
}

function DeleteProofModal(props: { title: string; detail: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-proof-title"
    >
      <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
        <h4 id="delete-proof-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {props.title}
        </h4>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{props.detail}</p>
        <button type="button" className={`mt-6 ${BUTTON.primaryRow}`} onClick={props.onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
