import { redirect } from "next/navigation";

import { TeamPermissionsSection } from "@/app/(shell)/settings/access/team-permissions-section";
import type { CommandCentreRole } from "@/lib/command-centre-access";
import { getCommandCentreRoleForUser, isCommandCentreAdmin } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function roleLabel(role: CommandCentreRole | undefined) {
  if (role === "admin") return "Admin";
  if (role === "viewer") return "Viewer";
  if (role === "operator") return "Operator";
  return "Unknown";
}

export default async function SettingsUserPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  const role = await getCommandCentreRoleForUser(supabase, { userId: user.id, email: user.email });
  const isAdmin = await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email });

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">User</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Human operators sign in with email. <strong>LiNKbot and other AI agent identities</strong> are provisioned on
          the Linktrend vendor side — they run missions under governance but are not listed as workspace users here.
        </p>
        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">Your access:</span>{" "}
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            {roleLabel(role)}
          </span>
          {user.email ? (
            <>
              <span className="text-zinc-400"> · </span>
              <span className="text-zinc-800 dark:text-zinc-200">{user.email}</span>
            </>
          ) : null}
        </p>
      </section>

      <section id="team-permissions" className="scroll-mt-8 space-y-4">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Team &amp; permissions</h3>
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Command centre roles for people in this workspace (<code className="text-xs">linkaios.user_access</code>).
          {!isAdmin ? (
            <span className="mt-1 block text-amber-800 dark:text-amber-200">
              Role changes require Admin. You can review the explanation below.
            </span>
          ) : null}
        </p>
        <TeamPermissionsSection />
      </section>

      <section id="help" className="scroll-mt-8">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Help</h3>
        <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Use the <strong>Help</strong> button in the page header for static guidance on any screen. An in-product LLM
          assistant will replace this later.
        </p>
      </section>
    </div>
  );
}
