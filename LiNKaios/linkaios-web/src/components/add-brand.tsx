"use client";

import { useCallback, useEffect, useRef } from "react";

import { useAppRole } from "@/components/role-preview-provider";
import { canAddLegalEntity } from "@/lib/app-roles";
import { BUTTON, FIELD } from "@/lib/ui-standards";

export const ADD_BRAND_OPEN_EVENT = "linktrend:add-brand-open";

function notifyBrandProposal() {
  window.dispatchEvent(
    new CustomEvent("linkaios-toast", {
      detail: "Brand proposal sent to Super Admin for confirmation.",
    }),
  );
}

export function AddBrandRoot() {
  const dlg = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { kind, role } = useAppRole();
  const canAdd = canAddLegalEntity(kind, role);

  const close = useCallback(() => {
    dlg.current?.close();
  }, []);

  useEffect(() => {
    const onOpen = () => {
      formRef.current?.reset();
      dlg.current?.showModal();
    };
    window.addEventListener(ADD_BRAND_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(ADD_BRAND_OPEN_EVENT, onOpen);
  }, []);

  return (
    <dialog
      ref={dlg}
      aria-labelledby="add-brand-title"
      className="fixed left-1/2 top-1/2 z-[200] m-0 max-h-[min(90dvh,calc(100dvh-2rem))] w-[min(100vw-2rem,26rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 text-sm shadow-2xl backdrop:bg-black/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id="add-brand-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Add brand
        </h2>
        <button type="button" className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={close} aria-label="Close">
          ✕
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        {canAdd
          ? "Register a new market brand under the active company. When your plan has no spare brand slots, you will confirm a plan upgrade before this is saved. Preview only — persistence not wired yet."
          : "Fill in the brand details. A Super Admin must confirm before it is added to your workspace topology."}
      </p>
      <form
        ref={formRef}
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canAdd) notifyBrandProposal();
          close();
        }}
      >
        <label className="block">
          <span className={FIELD.label}>Brand name</span>
          <input name="name" required className={`mt-1 ${FIELD.control}`} placeholder="Consumer-facing brand name" />
        </label>
        <label className="block">
          <span className={FIELD.label}>Short code</span>
          <input name="code" className={`mt-1 ${FIELD.control}`} placeholder="e.g. ACME-S" />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={BUTTON.secondaryRow} onClick={close}>
            Cancel
          </button>
          <button type="submit" className={BUTTON.primaryRow}>
            {canAdd ? "Continue (preview)" : "Submit for Super Admin approval"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function AddBrandOpenButton(props: { className?: string; children?: React.ReactNode }) {
  const { kind, role } = useAppRole();
  const canAdd = canAddLegalEntity(kind, role);
  const label = props.children ?? (canAdd ? "Add brand" : "Propose brand");

  return (
    <button
      type="button"
      className={props.className}
      onClick={() => window.dispatchEvent(new Event(ADD_BRAND_OPEN_EVENT))}
    >
      {label}
    </button>
  );
}
