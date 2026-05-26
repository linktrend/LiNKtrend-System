"use client";

import { ShellMainFrame } from "@/components/shell-main-frame";
import { ShellSidebar, type SidebarUser } from "@/components/shell-sidebar";
import { AppSurfaceProvider } from "@/components/app-surface-provider";
import { AppToastListener } from "@/components/app-toast-listener";
import { ThemeRoot } from "@/components/theme-root";
import { Menu } from "lucide-react";
import { Suspense, useState } from "react";
import type { AppSurface } from "@/lib/app-surface";

export function ShellLayout(props: {
  children: React.ReactNode;
  sidebarUser: SidebarUser | null;
  uiMocksEnabled: boolean;
  surface?: AppSurface;
}) {
  const surface = props.surface ?? "licensee";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <ThemeRoot>
      <AppSurfaceProvider surface={surface}>
        <div className="flex min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
          <Suspense fallback={null}>
            <ShellSidebar
              user={props.sidebarUser}
              mobileOpen={mobileNavOpen}
              onMobileOpenChange={setMobileNavOpen}
              surface={surface}
            />
          </Suspense>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8">
            <div className="mb-4 md:hidden">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Open navigation"
                aria-expanded={mobileNavOpen}
                aria-controls="shell-sidebar"
              >
                <Menu className="h-4 w-4" aria-hidden />
                Menu
              </button>
            </div>
            <ShellMainFrame uiMocksEnabled={props.uiMocksEnabled}>{props.children}</ShellMainFrame>
          </div>
        <AppToastListener />
        </div>
        </div>
      </AppSurfaceProvider>
    </ThemeRoot>
  );
}
