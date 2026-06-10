"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";

/** Copy-to-clipboard control for UUIDs and other identifiers. */
export function CopyIdButton(props: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(props.value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [props.value]);

  const aria = props.label ?? "Copy project ID";

  return (
    <button
      type="button"
      onClick={() => void copy()}
      title={copied ? "Copied" : aria}
      aria-label={aria}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
    </button>
  );
}
