"use client";

import { useState } from "react";
import { Factory, Play } from "lucide-react";

import { BUTTON, formatUiLabel } from "@/lib/ui-standards";

/** LiNKsuitegen factory controls for Admin (Wave 6.2 / 6.3). */
export function LinksuitegenFactoryPanel() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [detail, setDetail] = useState<string | null>(null);

  async function runCycle() {
    setStatus("running");
    setDetail(null);
    try {
      const res = await fetch("/api/admin/linksuitegen/orchestrator/cycle", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          variant: "simple_crm_lead_odoo_shadow",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setDetail(JSON.stringify(json).slice(0, 500));
        return;
      }
      setStatus("done");
      setDetail(
        `handoff=${String((json as { handoffId?: string }).handoffId ?? "—")} · bundle=${String((json as { bundlePath?: string }).bundlePath ?? "—")}`,
      );
    } catch (e: unknown) {
      setStatus("error");
      setDetail(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Factory className="mt-0.5 h-5 w-5 text-zinc-600 dark:text-zinc-400" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {formatUiLabel("LiNKsuitegen factory")}
            </h2>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Run orchestrator cycle (discovery → generate → validate → export → handoff). Publish writes{" "}
              <span className="font-mono">linkaios_kernel.plugins</span>.
            </p>
          </div>
        </div>
        <button
          type="button"
          className={`${BUTTON.primaryRow} inline-flex items-center gap-1.5 !mt-0 px-3 py-1.5 text-xs`}
          disabled={status === "running"}
          onClick={() => void runCycle()}
        >
          <Play className="h-3.5 w-3.5" aria-hidden />
          {status === "running" ? "Running cycle…" : "Run orchestrator cycle"}
        </button>
      </div>
      {detail ? (
        <p
          className={`text-xs ${status === "error" ? "text-red-700 dark:text-red-300" : "text-zinc-600 dark:text-zinc-400"}`}
          role="status"
        >
          {detail}
        </p>
      ) : null}
    </section>
  );
}
