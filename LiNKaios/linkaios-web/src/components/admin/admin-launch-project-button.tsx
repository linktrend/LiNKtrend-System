"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { UiButton } from "@/components/ui/button-bridge";

/** Launch a Draft vendor project — provisions Plane and advances orchestration. */
export function AdminLaunchProjectButton(props: { projectId: string; disabled?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function launch() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(props.projectId)}/plane-sync`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Plane launch did not complete.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach LiNKaios.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <UiButton buttonKey="approveRow" type="button" disabled={props.disabled || loading} onClick={() => void launch()}>
        {loading ? "Launching…" : "Launch project"}
      </UiButton>
      {error ? (
        <p className="max-w-xs text-right text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
