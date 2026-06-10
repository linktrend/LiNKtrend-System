"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Play } from "lucide-react";

import { BUTTON } from "@/lib/ui-standards";

export function LinkguardRunCleanupButton(props: { disabled?: boolean; disabledReason?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runCleanup() {
    if (props.disabled || pending) return;
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/linkguard/run-cleanup", { method: "POST" });
      const body = (await res.json().catch(() => null)) as { acknowledged?: number; error?: string } | null;
      if (!res.ok) {
        setError(body?.error ?? "Cleanup request failed");
        return;
      }
      const n = typeof body?.acknowledged === "number" ? body.acknowledged : 0;
      setMessage(n > 0 ? `Acknowledged ${n} closed session${n === 1 ? "" : "s"}.` : "No pending residue — system is clean.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cleanup request failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => void runCleanup()}
        disabled={props.disabled || pending}
        className={`${BUTTON.primaryRow} inline-flex items-center gap-2 self-start`}
        title={props.disabled ? props.disabledReason : undefined}
      >
        <Play className="h-4 w-4 shrink-0" aria-hidden />
        {pending ? "Running cleanup…" : "Run cleanup now"}
      </button>
      {props.disabled && props.disabledReason ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{props.disabledReason}</p>
      ) : null}
      {message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
