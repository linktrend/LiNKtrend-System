"use client";

import { useEffect } from "react";

export type InboxModalAction = {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  onClick?: () => void | Promise<void>;
};

const actionBtn =
  "inline-flex h-10 min-w-[7rem] items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors";

export function WorkInboxModal(props: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: InboxModalAction[];
}) {
  const { open, onClose, title, subtitle, children, actions } = props;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[1px]" aria-hidden />
      <div
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col rounded-t-2xl border border-zinc-200 bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
          <div className="min-w-0 pr-2">
            <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Close"
          >
            <span className="block text-xl leading-none">×</span>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm text-zinc-700">{children}</div>
        {actions?.length ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-100 px-5 py-4">
            {actions.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={async () => {
                  await a.onClick?.();
                  onClose();
                }}
                className={
                  a.variant === "danger"
                    ? `${actionBtn} border border-red-200 bg-red-50 text-red-900 hover:bg-red-100`
                    : a.variant === "primary"
                      ? `${actionBtn} bg-zinc-900 text-white hover:bg-zinc-800`
                      : `${actionBtn} border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50`
                }
              >
                {a.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex justify-end border-t border-zinc-100 px-5 py-4">
            <button type="button" onClick={onClose} className={`${actionBtn} bg-zinc-900 text-white hover:bg-zinc-800`}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
