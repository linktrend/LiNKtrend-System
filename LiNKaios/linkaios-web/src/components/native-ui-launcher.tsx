"use client";

import { useEffect, useRef } from "react";

import { openExternalPopup } from "@/lib/zulip-links";

export function NativeUiLauncher(props: { href: string; agentId: string }) {
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) return;
    if (props.href.startsWith("http")) {
      opened.current = true;
      openExternalPopup(props.href);
    }
  }, [props.href]);

  const external = props.href.startsWith("http");

  return (
    <main className="mx-auto max-w-lg space-y-6 px-6 py-16 text-center">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Native UI</h1>
      {external ? (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            The LiNKbot native operator shell should open in a new browser tab. If it did not, use the button below.
          </p>
          <button
            type="button"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            onClick={() => openExternalPopup(props.href)}
          >
            Open Native UI
          </button>
        </>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Set{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">NEXT_PUBLIC_LINKBOT_NATIVE_UI_BASE_URL</code>{" "}
          in the LiNKaios deployment so this tab opens your runtime instead of the placeholder.
        </p>
      )}
      <p className="font-mono text-xs text-zinc-500 dark:text-zinc-500">Agent id: {props.agentId}</p>
    </main>
  );
}
