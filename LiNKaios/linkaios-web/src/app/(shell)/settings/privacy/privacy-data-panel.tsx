"use client";

import { useCallback, useEffect, useState } from "react";

import { BUTTON } from "@/lib/ui-standards";

type ProofKind = "export" | "backup" | "retention" | "delete";

type ProofState = {
  kind: ProofKind;
  title: string;
  detail: string;
};

const RETENTION_OPTIONS = [
  { value: "90", label: "90 days (default)" },
  { value: "180", label: "180 days" },
  { value: "365", label: "1 year" },
  { value: "730", label: "2 years" },
] as const;

export function PrivacyDataPanel() {
  const [proof, setProof] = useState<ProofState | null>(null);
  const [retentionDays, setRetentionDays] = useState("90");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const showProof = useCallback((next: ProofState) => {
    setProof(next);
  }, []);

  useEffect(() => {
    if (!proof) return;
    const t = window.setTimeout(() => setProof(null), 6000);
    return () => window.clearTimeout(t);
  }, [proof]);

  return (
    <div className="space-y-10">
      {proof ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          <p className="font-semibold">{proof.title}</p>
          <p className="mt-1 text-emerald-800 dark:text-emerald-200">{proof.detail}</p>
        </div>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Export my data</h3>
        <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Request a portable copy of profile, audit events, and project metadata tied to your account. Mock flow — no
          export is generated yet.
        </p>
        <button
          type="button"
          className={`mt-4 ${BUTTON.primaryRow}`}
          onClick={() =>
            showProof({
              kind: "export",
              title: "Export requested (mock)",
              detail:
                "Proof: request queued as GDPR-EXPORT-MOCK-001. You would receive email when the archive is ready.",
            })
          }
        >
          Request data export
        </button>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Download backup</h3>
        <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Workspace backup snapshot for disaster recovery. Mock — download link is not created.
        </p>
        <button
          type="button"
          className={`mt-4 ${BUTTON.secondaryRow}`}
          onClick={() =>
            showProof({
              kind: "backup",
              title: "Backup prepared (mock)",
              detail: "Proof: signed URL would expire in 24h. No file was written in this environment.",
            })
          }
        >
          Prepare backup download
        </button>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Retention settings</h3>
        <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          How long LiNKbrain events and trace payloads are kept for this workspace. Mock — preference is not persisted.
        </p>
        <label className="mt-4 block text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="retention-days">
          Event retention
        </label>
        <select
          id="retention-days"
          value={retentionDays}
          onChange={(e) => setRetentionDays(e.target.value)}
          className="mt-2 block w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {RETENTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`mt-4 ${BUTTON.secondaryRow}`}
          onClick={() =>
            showProof({
              kind: "retention",
              title: "Retention saved (mock)",
              detail: `Proof: workspace retention would be set to ${retentionDays} days. No database write occurred.`,
            })
          }
        >
          Save retention preference
        </button>
      </section>

      <section className="rounded-xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/40 dark:bg-red-950/20">
        <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">Delete account request</h3>
        <p className="mt-2 max-w-xl text-sm text-red-800/90 dark:text-red-200/90">
          Submit a right-to-erasure request. An Admin must approve before any deletion runs. Mock — no ticket is
          created.
        </p>
        <label className="mt-4 block text-sm font-medium text-red-900 dark:text-red-100" htmlFor="delete-confirm">
          Type DELETE to open confirmation
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
          onClick={() => {
            setDeleteConfirm("");
            showProof({
              kind: "delete",
              title: "Deletion request recorded (mock)",
              detail:
                "Proof: GDPR-ERASE-MOCK-001 logged. You would receive confirmation email; no account data was removed.",
            });
          }}
        >
          Submit delete account request
        </button>
      </section>

      {proof?.kind === "delete" ? (
        <DeleteProofModal
          detail={proof.detail}
          onClose={() => setProof(null)}
        />
      ) : null}
    </div>
  );
}

function DeleteProofModal(props: { detail: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-proof-title"
    >
      <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
        <h4 id="delete-proof-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Request received (mock)
        </h4>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{props.detail}</p>
        <button type="button" className={`mt-6 ${BUTTON.primaryRow}`} onClick={props.onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
