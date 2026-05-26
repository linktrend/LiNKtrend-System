"use client";

import { useCallback, useEffect, useState } from "react";

import { FormField, FormSelect } from "@/components/forms";
import { BUTTON } from "@/lib/ui-standards";

type ProofKind = "export" | "backup" | "retention";

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

      <section
        id="data-import-export"
        className="scroll-mt-8 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Export My Data</h3>
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
          Request Data Export
        </button>
      </section>

      <div id="data-settings" className="scroll-mt-8 space-y-10">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Download Backup</h3>
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
            Prepare Backup Download
          </button>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Retention Settings</h3>
          <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            How long LiNKbrain events and trace payloads are kept for this workspace. Mock — preference is not persisted.
          </p>
          <div className="mt-4 max-w-xs">
            <FormField id="retention-days" label="Event retention">
              {({ id, invalid, describedBy }) => (
                <FormSelect
                  id={id}
                  invalid={invalid}
                  describedBy={describedBy}
                  fullWidth={false}
                  value={retentionDays}
                  onChange={setRetentionDays}
                  options={RETENTION_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                />
              )}
            </FormField>
          </div>
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
            Save Retention Preference
          </button>
        </section>
      </div>
    </div>
  );
}
