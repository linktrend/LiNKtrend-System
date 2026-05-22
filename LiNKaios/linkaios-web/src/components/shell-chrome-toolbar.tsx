"use client";

import { RefreshCw, Sparkles } from "lucide-react";
import { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PageHelpPanel } from "@/components/page-help-panel";
import { ThemeToggleButton } from "@/components/theme-switcher";
import { resolvePageHelp } from "@/lib/page-help-copy";
function ShellChromeToolbarInner() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const [helpOpen, setHelpOpen] = useState(false);

  const helpContent = useMemo(() => resolvePageHelp(pathname, searchParams), [pathname, searchParams]);

  const openHelp = useCallback(() => setHelpOpen(true), []);
  const closeHelp = useCallback(() => setHelpOpen(false), []);

  return (
    <>
      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggleButton />
        <button
          type="button"
          onClick={() => router.refresh()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          aria-label="Refresh page"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={openHelp}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          aria-label="Open page help"
          title="Page help"
        >
          <Sparkles className="h-4 w-4 text-[#FF8C42]" aria-hidden />
        </button>
      </div>
      <PageHelpPanel open={helpOpen} onClose={closeHelp} content={helpContent} />
    </>
  );
}

/** Refresh + Help icons aligned with breadcrumbs (GLOBAL-002 chrome). */
export function ShellChromeToolbar() {
  return (
    <Suspense fallback={null}>
      <ShellChromeToolbarInner />
    </Suspense>
  );
}
