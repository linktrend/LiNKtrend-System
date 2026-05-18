"use client";

import { useCallback, useState, useTransition } from "react";

import {
  deleteIntegrationSecretAction,
  listIntegrationSecretsAction,
  upsertIntegrationSecretAction,
  type IntegrationSecretRow,
} from "@/app/(shell)/settings/api-keys/actions";
import { TABLE } from "@/lib/ui-standards";

const PRESETS: { slug: string; label: string; provider: string }[] = [
  { slug: "OPENAI_API_KEY", label: "OpenAI", provider: "openai" },
  { slug: "ANTHROPIC_API_KEY", label: "Anthropic", provider: "anthropic" },
  { slug: "GOOGLE_AI_API_KEY", label: "Google AI (Gemini)", provider: "google" },
  { slug: "ZULIP_API_KEY", label: "Zulip bot API key", provider: "zulip" },
];

export function ApiKeysPanel(props: { initialRows: IntegrationSecretRow[]; canManage: boolean }) {
  const [rows, setRows] = useState<IntegrationSecretRow[]>(props.initialRows);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [provider, setProvider] = useState("openai");
  const [secretValue, setSecretValue] = useState("");

  const refresh = useCallback(() => {
    startTransition(() => {
      void (async () => {
        setErr(null);
        const r = await listIntegrationSecretsAction();
        if (!r.ok) {
          setErr(r.error);
          return;
        }
        setRows(r.rows);
      })();
    });
  }, []);

  function applyPreset(p: (typeof PRESETS)[number]) {
    setSlug(p.slug);
    setLabel(p.label);
    setProvider(p.provider);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    startTransition(() => {
      void (async () => {
        const r = await upsertIntegrationSecretAction({ slug, label, provider, secretValue });
        if (!r.ok) {
          setErr(r.error);
          return;
        }
        setMsg("Saved.");
        setSecretValue("");
        refresh();
      })();
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this integration secret? LiNKbots relying on it may stop working until you add a new value.")) return;
    setMsg(null);
    setErr(null);
    startTransition(() => {
      void (async () => {
        const r = await deleteIntegrationSecretAction(id);
        if (!r.ok) {
          setErr(r.error);
          return;
        }
        setMsg("Deleted.");
        refresh();
      })();
    });
  }

  if (!props.canManage) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        <p className="font-medium">Admins only</p>
        <p className="mt-2 text-amber-900/90 dark:text-amber-100/90">Ask a workspace Admin if you need a key added or rotated.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {msg ? <p className="text-sm text-emerald-800 dark:text-emerald-200">{msg}</p> : null}
      {err ? <p className="text-sm text-red-700 dark:text-red-300">{err}</p> : null}

      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Saved keys</h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Secret values are never shown again after save.</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className={`px-4 py-3 ${TABLE.thText}`}>Slug</th>
                <th className={`px-4 py-3 ${TABLE.thText}`}>Label</th>
                <th className={`px-4 py-3 ${TABLE.thText}`}>Provider</th>
                <th className={`px-4 py-3 ${TABLE.thText}`}>Updated</th>
                <th className={`px-4 py-3 ${TABLE.thControl}`}>
                  <div className={TABLE.thControlInner}>Actions</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                    No secrets yet — add one below.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-800 dark:text-zinc-200">{r.slug}</td>
                    <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200">{r.label}</td>
                    <td className="px-4 py-3 capitalize text-zinc-600 dark:text-zinc-400">{r.provider}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {r.updated_at.replace("T", " ").slice(0, 16)}
                    </td>
                    <td className={`px-4 py-3 ${TABLE.thControl}`}>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => remove(r.id)}
                        className="text-sm font-medium text-red-700 underline disabled:opacity-50 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Add or rotate</h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Use a preset to fill common providers, then paste the new secret.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.slug}
              type="button"
              disabled={pending}
              onClick={() => applyPreset(p)}
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {p.label}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Slug
            <input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="OPENAI_API_KEY"
            />
          </label>
          <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Label
            <input
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="OpenAI"
            />
          </label>
          <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Provider
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="mt-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="openai">openai</option>
              <option value="anthropic">anthropic</option>
              <option value="google">google</option>
              <option value="zulip">zulip</option>
              <option value="gateway">gateway</option>
              <option value="other">other</option>
            </select>
          </label>
          <label className="sm:col-span-2 flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Secret value
            <input
              required
              type="password"
              autoComplete="off"
              value={secretValue}
              onChange={(e) => setSecretValue(e.target.value)}
              className="mt-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="sk-…"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {pending ? "Saving…" : "Save secret"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
