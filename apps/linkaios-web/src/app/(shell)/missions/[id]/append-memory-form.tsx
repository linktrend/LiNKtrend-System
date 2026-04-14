"use client";

import { useActionState } from "react";

import type { AppendMissionMemoryState } from "./actions";
import { appendMissionMemory } from "./actions";

export function AppendMemoryForm({ missionId }: { missionId: string }) {
  const [state, formAction, pending] = useActionState<AppendMissionMemoryState, FormData>(
    appendMissionMemory,
    null,
  );

  return (
    <form action={formAction} className="mt-4 max-w-xl space-y-3">
      <input type="hidden" name="mission_id" value={missionId} />
      <label className="block text-sm font-medium text-zinc-800">
        Add memory entry
        <textarea
          name="body"
          required
          rows={4}
          disabled={pending}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-60"
          placeholder="Short note for LiNKbrain (operators only; viewers cannot insert)."
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save memory"}
      </button>
      {state?.ok === true && (
        <p className="text-sm text-emerald-700" role="status">
          Saved.
        </p>
      )}
      {state?.ok === false && state.error && (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
