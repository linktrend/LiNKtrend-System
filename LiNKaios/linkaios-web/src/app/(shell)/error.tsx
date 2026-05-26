"use client";

import Link from "next/link";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { LICENSEE_HOME_PATH } from "@/lib/app-surface";
import { BUTTON } from "@/lib/ui-standards";

export default function ShellError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title="Something Went Wrong"
        subtitle="This page hit an unexpected error. Retry the load or return to the LiNKaios overview."
      />
      <section className="rounded-xl border border-red-200 bg-red-50/80 p-5 shadow-sm dark:border-red-900/40 dark:bg-red-950/30">
        <p className="text-sm font-semibold text-red-900 dark:text-red-100">Error details</p>
        <p className="mt-2 text-sm text-red-800 dark:text-red-200">{props.error.message || "Unknown error"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={props.reset} className={BUTTON.secondaryRow}>
            Retry
          </button>
          <Link href={LICENSEE_HOME_PATH} className={BUTTON.primaryRow}>
            Back to overview
          </Link>
        </div>
      </section>
    </main>
  );
}
