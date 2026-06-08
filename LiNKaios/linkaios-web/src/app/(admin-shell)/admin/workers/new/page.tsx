import Link from "next/link";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { BUTTON } from "@/lib/ui-standards";

export const dynamic = "force-dynamic";

/** Admin cannot create bare LiNKbot rows — suite composition provisions fleet roles. */
export default function AdminWorkersNewBlockedPage() {
  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title="Add LiNKbot"
        subtitle="LiNKbot roles are provisioned through suite composition, not from the Admin fleet monitor."
      />
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 dark:border-zinc-700 dark:bg-zinc-900/40">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Use Suite builder</p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Open a suite template, assign LiNKbots to module phases and issues, then publish. The Admin LiNKbots list is
          for monitoring and troubleshooting licensee fleets only.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/suites" className={BUTTON.addRow}>
            Open Suites
          </Link>
          <Link href="/admin/workers" className={BUTTON.secondaryRow}>
            Back to LiNKbots
          </Link>
        </div>
      </div>
    </main>
  );
}
