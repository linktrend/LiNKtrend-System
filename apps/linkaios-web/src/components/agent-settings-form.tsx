"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { saveAgentRuntimeSettingsAction } from "@/app/(shell)/workers/[id]/runtime-settings-actions";
import { serialiseRuntimeSettings, type AgentRuntimeSettings } from "@/lib/agent-runtime-settings";
import { BUTTON, FIELD, STACK } from "@/lib/ui-standards";

function jsonSig(s: AgentRuntimeSettings): string {
  return JSON.stringify(serialiseRuntimeSettings(s));
}

export function AgentSettingsForm(props: {
  agentId: string;
  initial: AgentRuntimeSettings;
  readonly?: boolean;
}) {
  const router = useRouter();
  const initialRef = useRef(props.initial);
  const [state, setState] = useState(props.initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const serverSig = jsonSig(props.initial);
  useEffect(() => {
    initialRef.current = props.initial;
    setState(props.initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-apply when server payload (signature) changes
  }, [serverSig]);

  const setProfile = (patch: Partial<AgentRuntimeSettings["linkaiosProfile"]>) => {
    setState((s) => ({ ...s, linkaiosProfile: { ...s.linkaiosProfile, ...patch } }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (props.readonly) return;
    setMessage(null);
    startTransition(async () => {
      const res = await saveAgentRuntimeSettingsAction(props.agentId, serialiseRuntimeSettings(state));
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      setMessage("Saved.");
      router.refresh();
    });
  };

  const onReset = () => {
    setState(initialRef.current);
    setMessage(null);
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-8">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Organisation</legend>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          How this LiNKbot appears in the directory: job title and a short description.
        </p>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Position / title</span>
          <input
            type="text"
            disabled={props.readonly}
            value={state.linkaiosProfile.title}
            onChange={(e) => setProfile({ title: e.target.value })}
            placeholder="e.g. Principal analyst"
            className={FIELD.control}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Description</span>
          <textarea
            disabled={props.readonly}
            value={state.linkaiosProfile.description}
            onChange={(e) => setProfile({ description: e.target.value })}
            rows={3}
            placeholder="What this LiNKbot is responsible for."
            className={FIELD.control}
          />
        </label>
      </fieldset>

      {message ? (
        <p className={message === "Saved." ? "text-sm text-emerald-700 dark:text-emerald-400" : "text-sm text-red-600"}>
          {message}
        </p>
      ) : null}

      {!props.readonly ? (
        <div className={STACK.actions}>
          <button type="submit" disabled={pending} className={BUTTON.primaryBlock}>
            {pending ? "Saving…" : "Save settings"}
          </button>
          <button type="button" disabled={pending} onClick={onReset} className={BUTTON.secondaryBlock}>
            Reset form to defaults
          </button>
        </div>
      ) : (
        <p className="text-xs text-zinc-400">Demo LiNKbot — settings are not persisted.</p>
      )}
    </form>
  );
}
