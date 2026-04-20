"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { createAgentAction } from "@/app/(shell)/workers/actions";
import { BUTTON, FIELD } from "@/lib/ui-standards";

export const ADD_LINKBOT_OPEN_EVENT = "linktrend:add-linkbot-open";

export function AddLinkbotRoot() {
  const router = useRouter();
  const dlg = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const close = useCallback(() => {
    dlg.current?.close();
    setErr(null);
  }, []);

  useEffect(() => {
    const onOpen = () => {
      setErr(null);
      formRef.current?.reset();
      dlg.current?.showModal();
    };
    window.addEventListener(ADD_LINKBOT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(ADD_LINKBOT_OPEN_EVENT, onOpen);
  }, []);

  return (
    <dialog
      ref={dlg}
      aria-labelledby="add-linkbot-title"
      className="fixed left-1/2 top-1/2 z-[200] m-0 max-h-[min(90dvh,calc(100dvh-2rem))] w-[min(100vw-2rem,26rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 text-sm shadow-2xl backdrop:bg-black/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id="add-linkbot-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Add LiNKbot
        </h2>
        <button
          type="button"
          className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          onClick={close}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        Choose a unique display name and initial status. You will continue in Settings to finish profile and policy.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Inactive</span> keeps the LiNKbot idle in the
        registry until you finish setup. <span className="font-medium text-zinc-700 dark:text-zinc-300">Active</span>{" "}
        marks it ready for normal use once gateways and models are configured.
      </p>
      <form
        ref={formRef}
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setErr(null);
          start(() => {
            void (async () => {
              const r = await createAgentAction(fd);
              if (!r.ok) {
                setErr(r.error);
                return;
              }
              close();
              router.push(`/workers/${encodeURIComponent(r.id)}/settings`);
              router.refresh();
            })();
          });
        }}
      >
        {err ? <p className="text-sm text-red-700 dark:text-red-400">{err}</p> : null}
        <label className="block">
          <span className={FIELD.label}>Display name</span>
          <input
            name="display_name"
            required
            autoComplete="off"
            placeholder="e.g. Field LiNKbot — Acme"
            className={`mt-1 w-full ${FIELD.control}`}
          />
        </label>
        <label className="block max-w-[13rem]">
          <span className={FIELD.label}>Initial status</span>
          <select name="status" defaultValue="inactive" className={`mt-1 w-full ${FIELD.controlCompact}`}>
            <option value="inactive">Inactive</option>
            <option value="active">Active</option>
          </select>
        </label>
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <button type="button" className={BUTTON.secondaryRow} onClick={close} disabled={pending}>
            Cancel
          </button>
          <button type="submit" className={BUTTON.primaryRow} disabled={pending}>
            {pending ? "Creating…" : "Next"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function AddLinkbotOpenButton(props: { className?: string; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className={props.className}
      onClick={() => window.dispatchEvent(new Event(ADD_LINKBOT_OPEN_EVENT))}
    >
      {props.children ?? "Add LiNKbot"}
    </button>
  );
}
