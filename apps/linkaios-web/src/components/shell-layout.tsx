import type { CommandCentreRole } from "@/lib/command-centre-access";
import { ShellNav } from "@/components/shell-nav";
import { SignOutButton } from "@/components/sign-out-button";

export function ShellLayout(props: {
  children: React.ReactNode;
  showDevtools?: boolean;
  userEmail?: string | null;
  commandCentreRole?: CommandCentreRole;
  canWrite?: boolean;
  showAdminNav?: boolean;
}) {
  const role = props.commandCentreRole;
  const roleBadge =
    role === "viewer" ? (
      <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-950">Read-only</span>
    ) : role === "admin" ? (
      <span className="rounded-md bg-violet-100 px-2 py-1 text-xs font-medium text-violet-950">Admin</span>
    ) : (
      <span className="rounded-md bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-800">Operator</span>
    );

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <ShellNav showDevtools={props.showDevtools} showAdminNav={props.showAdminNav} />
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {role ? (
              <span className="flex items-center gap-2 text-xs text-zinc-600" title="Command centre access level">
                Access {roleBadge}
                {props.canWrite === false ? (
                  <span className="hidden text-zinc-500 sm:inline">· writes disabled</span>
                ) : null}
              </span>
            ) : null}
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
