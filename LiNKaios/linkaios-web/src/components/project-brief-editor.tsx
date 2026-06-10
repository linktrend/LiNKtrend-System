"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { TitledCardHeader } from "@/components/titled-card-header";
import { FileText } from "lucide-react";

/** Editable project brief on Overview — persists to linkaios.projects.brief. */
export function ProjectBriefEditor(props: {
  projectId: string;
  initialBrief: string;
  expectedOutputs: string[];
  apiBase?: string;
}) {
  const router = useRouter();
  const [brief, setBrief] = useState(props.initialBrief);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBase = props.apiBase ?? "/api/admin/projects";

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/${encodeURIComponent(props.projectId)}/brief`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: brief.trim() }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Could not save the brief.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach LiNKaios.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <TitledCardHeader icon={FileText} title="Project Brief" />
      <label className="mt-3 block text-sm">
        <span className="sr-only">Project brief</span>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={5}
          placeholder="Describe goals, scope, and context for this vendor project…"
          className="w-full max-w-3xl rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm leading-relaxed text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
        />
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {saving ? "Saving…" : "Save brief"}
        </button>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      {props.expectedOutputs.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Expected outputs</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {props.expectedOutputs.map((output) => (
              <li
                key={output}
                className="flex gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600 dark:bg-sky-400" aria-hidden />
                <span>{output}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
