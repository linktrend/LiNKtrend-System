import Link from "next/link";

import { isCommandCentreAdmin } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin =
    user?.id != null ? await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email }) : false;

  return (
    <main>
      <h1 className="text-xl font-semibold text-zinc-900">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Workspace preferences and administration. More sections can be added here as the product grows.
      </p>

      <ul className="mt-10 space-y-4">
        <li>
          <Link
            href="/settings/access"
            className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300"
          >
            <h2 className="text-sm font-semibold text-zinc-900">Command centre access</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Manage operator, viewer, and admin roles (<code className="text-xs">linkaios.user_access</code>).
            </p>
            {!isAdmin ? (
              <p className="mt-2 text-xs text-amber-800">Requires admin. You can open the page to see the explanation.</p>
            ) : null}
          </Link>
        </li>
      </ul>
    </main>
  );
}
