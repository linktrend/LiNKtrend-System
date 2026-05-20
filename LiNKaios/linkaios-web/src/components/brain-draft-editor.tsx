"use client";

import { useFormStatus } from "react-dom";

import { saveBrainDraftFromForm } from "@/app/(shell)/memory/brain-actions";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      {pending ? "Saving…" : "Save draft"}
    </button>
  );
}

export function BrainDraftEditor(props: { versionId: string; initialBody: string }) {
  return (
    <form action={saveBrainDraftFromForm} className="space-y-3">
      <input type="hidden" name="versionId" value={props.versionId} />
      <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="brain-draft-body">
        Body
      </label>
      <textarea
        id="brain-draft-body"
        name="body"
        defaultValue={props.initialBody}
        rows={22}
        className="w-full rounded-lg border border-zinc-200 bg-white p-3 font-mono text-sm text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        spellCheck={false}
      />
      <SaveButton />
    </form>
  );
}
