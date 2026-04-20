import { ShellMainFrame } from "@/components/shell-main-frame";
import { ShellSidebar, type SidebarUser } from "@/components/shell-sidebar";
import { ThemeRoot } from "@/components/theme-root";

export function ShellLayout(props: {
  children: React.ReactNode;
  sidebarUser: SidebarUser | null;
  uiMocksEnabled: boolean;
}) {
  return (
    <ThemeRoot>
      <div className="flex min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <ShellSidebar user={props.sidebarUser} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8">
            <ShellMainFrame uiMocksEnabled={props.uiMocksEnabled}>{props.children}</ShellMainFrame>
          </div>
        </div>
      </div>
    </ThemeRoot>
  );
}
