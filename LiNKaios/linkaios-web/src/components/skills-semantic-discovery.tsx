"use client";

import Link from "next/link";
import { useCallback, useState, useTransition } from "react";

import { CatalogSearchField } from "@/components/catalog-search-field";

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

/** Semantic search for skills by meaning (requires server API key). */
export function SkillsSemanticDiscovery() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SemanticHit[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const runSearch = useCallback(() => {
    const t = q.trim();
    if (t.length < 2) return;
    startTransition(async () => {
      setErr(null);
      setHits(null);
      const r = await fetchSemantic(t);
      if (!r.ok) {
        setErr(
          r.status === 503
            ? `${r.message} Configure GEMINI_API_KEY on the LiNKaios server to enable search.`
            : r.message,
        );
        return;
      }
      setHits(r.hits);
    });
  }, [q]);

  return (
    <section className="space-y-3">
      <CatalogSearchField
        label="Search skills"
        value={q}
        onChange={setQ}
        onSearch={runSearch}
        placeholder="Describe what you need, e.g. onboarding checklist"
        pending={pending}
      />
      {err ? <p className="text-sm text-red-700 dark:text-red-300">{err}</p> : null}
      {!pending && hits && hits.length === 0 && q.trim().length >= 2 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No matches found.</p>
      ) : null}
      {hits && hits.length > 0 ? (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white text-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {hits.map((h) => (
            <li key={h.skill.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <Link href={`/skills/${h.skill.id}`} className="font-medium text-sky-800 underline dark:text-sky-400">
                {h.skill.name}
              </Link>
              <span className="text-xs text-zinc-500">v{h.skill.version}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
