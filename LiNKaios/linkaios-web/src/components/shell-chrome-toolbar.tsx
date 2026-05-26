"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SupportAssistantPanel } from "@/components/support-assistant-panel";
import { AppSurfaceSwitch } from "@/components/app-surface-switch";
import { RolePreviewSelect } from "@/components/sidebar-role-preview";
import { ThemeToggleButton } from "@/components/theme-switcher";
import { useLicenseeContext } from "@/hooks/use-licensee-context";
import { resolvePageHelp } from "@/lib/page-help-copy";
import { RefreshCw, Sparkles } from "lucide-react";

function ShellChromeToolbarInner() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const { companyId, brandId } = useLicenseeContext();
  const [helpOpen, setHelpOpen] = useState(false);

  const helpContent = useMemo(() => resolvePageHelp(pathname, searchParams), [pathname, searchParams]);

  const openHelp = useCallback(() => setHelpOpen(true), []);
  const closeHelp = useCallback(() => setHelpOpen(false), []);

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        <AppSurfaceSwitch />
        <RolePreviewSelect />
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
          aria-label="Open help and support"
          title="Help & support"
        >
          <Sparkles className="h-4 w-4 text-[#FF8C42]" aria-hidden />
        </button>
      </div>
      <SupportAssistantPanel
        open={helpOpen}
        onClose={closeHelp}
        content={helpContent}
        companyId={companyId}
        brandId={brandId}
      />
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
