import Link from "next/link";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { BUTTON } from "@/lib/ui-standards";

export default function ShellNotFound() {
  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title="Page Not Found"
        subtitle="That route does not exist or was moved. Return to the LiNKaios overview."
      />
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Check the URL or use the sidebar to find the screen you need.
        </p>
        <div className="mt-4">
          <Link href="/" className={BUTTON.primaryRow}>
            Back to overview
          </Link>
        </div>
      </section>
    </main>
  );
}
