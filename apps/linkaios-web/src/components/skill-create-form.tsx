"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createSkill } from "@/app/(shell)/skills/actions";

const NAME_RE = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$|^[a-z0-9]$/;

export function SkillCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");

  function submit() {
    setErr(null);
    const n = name.trim().toLowerCase();
    if (!NAME_RE.test(n)) {
      setErr("Use a short slug: lowercase letters, digits, and hyphens (1–64 characters).");
      return;
    }
    startTransition(() => {
      void (async () => {
        const r = await createSkill({ name: n, category, description });
        if (!r.ok) {
          setErr("error" in r ? r.error : "Could not create skill.");
          return;
        }
        router.push(`/skills/${r.id}`);
        router.refresh();
      })();
    });
  }

  return (
    <div className="max-w-2xl space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={pending}
          placeholder="e.g. customer-onboarding"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Category</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={pending}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Short description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={pending}
          rows={4}
          placeholder="What this skill helps with"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      {err ? <p className="text-sm text-red-700 dark:text-red-300">{err}</p> : null}
      <button
        type="button"
        disabled={pending || !name.trim()}
        onClick={submit}
        className="inline-flex min-h-10 min-w-[7.5rem] items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "Creating…" : "Create draft"}
      </button>
    </div>
  );
}
