"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { BUTTON, FIELD } from "@/lib/ui-standards";

type SemanticHit = { skill: { id: string; name: string; version: number; status: string }; score: number };

async function fetchSemantic(q: string): Promise<{ ok: true; hits: SemanticHit[] } | { ok: false; status: number; message: string }> {
  const res = await fetch(`/api/skills/discovery?layer=semantic&q=${encodeURIComponent(q)}&limit=15`);
  const body = (await res.json().catch(() => null)) as { results?: SemanticHit[]; error?: string } | null;
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: body?.error ?? `Request failed (${res.status})`,
    };
  }
  return { ok: true, hits: Array.isArray(body?.results) ? body!.results! : [] };
}

export function SkillsSemanticDiscovery(props: { defaultCollapsed?: boolean }) {
  const [open, setOpen] = useState(!props.defaultCollapsed);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SemanticHit[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback((query: string) => {
    const t = query.trim();
    if (t.length < 2) {
      setHits(null);
      setErr(null);
      return;
    }
    startTransition(async () => {
      setErr(null);
      setHits(null);
      const r = await fetchSemantic(t);
      if (!r.ok) {
        setErr(
          r.status === 503
            ? `${r.message} Configure GEMINI_API_KEY on the LiNKaios server for semantic skill search.`
            : r.message,
        );
        return;
      }
      setHits(r.hits);
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const t = q.trim();
    if (t.length < 2) {
      setHits(null);
      setErr(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      runSearch(t);
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, runSearch, open]);

  const runManual = () => runSearch(q);

  return (
    <section className="rounded-xl border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Semantic search (embeddings)</span>
          {props.defaultCollapsed ? (
            <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">Optional — requires server API key</span>
          ) : null}
        </span>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
        )}
      </button>
      {open ? (
        <div className="border-t border-zinc-200 px-4 pb-4 pt-3 dark:border-zinc-800">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Uses slim skill embeddings and <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">GEMINI_API_KEY</code> on
            the server. Results rank by cosine similarity.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="min-w-[200px] flex-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Query
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    runManual();
                  }
                }}
                disabled={pending}
                placeholder="e.g. onboarding checklist for finance"
                className={`mt-1 block w-full ${FIELD.control}`}
              />
            </label>
            <button type="button" disabled={pending || q.trim().length < 2} onClick={runManual} className={BUTTON.primaryRow}>
              {pending ? "Searching…" : "Search"}
            </button>
          </div>
          {pending && hits === null && !err ? (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Searching…</p>
          ) : null}
          {err ? <p className="mt-2 text-sm text-red-700 dark:text-red-300">{err}</p> : null}
          {!pending && hits && hits.length === 0 && q.trim().length >= 2 ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No matches (embeddings may not be indexed yet).</p>
          ) : null}
          {hits && hits.length > 0 ? (
            <ul className="mt-3 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white text-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
              {hits.map((h) => (
                <li key={h.skill.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                  <a href={`/skills/${h.skill.id}`} className="font-medium text-sky-800 underline dark:text-sky-400">
                    {h.skill.name}
                  </a>
                  <span className="font-mono text-xs text-zinc-500">v{h.skill.version}</span>
                  <span className="text-xs text-zinc-500">score {h.score.toFixed(4)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
