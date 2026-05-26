"use client";

import { useEffect, useState } from "react";

const EVENT = "linkaios-toast";

/** Lightweight toast for approval-request feedback (MVO — no backend yet). */
export function AppToastListener() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (typeof detail === "string" && detail.trim()) {
        setMessage(detail);
        window.setTimeout(() => setMessage(null), 6000);
      }
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  if (!message) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950 shadow-lg dark:border-emerald-900/50 dark:bg-emerald-950/90 dark:text-emerald-100"
    >
      {message}
    </div>
  );
}
