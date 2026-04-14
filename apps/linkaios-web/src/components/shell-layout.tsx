import { ShellNav } from "@/components/shell-nav";
import { SignOutButton } from "@/components/sign-out-button";

export function ShellLayout(props: {
  children: React.ReactNode;
  showDevtools?: boolean;
  userEmail?: string | null;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <ShellNav showDevtools={props.showDevtools} />
          <div className="flex shrink-0 items-center gap-2">
            {props.userEmail ? (
              <span className="hidden max-w-[220px] truncate text-xs text-zinc-500 sm:inline">
                {props.userEmail}
              </span>
            ) : null}
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{props.children}</div>
    </div>
  );
}
