"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAppSurface } from "@/components/app-surface-provider";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { useLicensorSuiteStore } from "@/hooks/use-licensor-suite-store";
import { BUTTON } from "@/lib/ui-standards";

export default function LicensorNewSuitePage() {
  const { href: appHref } = useAppSurface();
  const router = useRouter();
  const { createDraftSuite } = useLicensorSuiteStore();
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedSummary = summary.trim();
    const slug =
      trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-suite";
    createDraftSuite({ id: slug, name: trimmedName, summary: trimmedSummary });
    router.push(appHref(`/suites/${slug}/builder`));
  };

  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title="Add Suite"
        subtitle="Start a draft product — assemble modules, phases, issues, LiNKbots, and automations before publishing."
      />

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Suite name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            placeholder="e.g. Venture Media"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Summary</span>
          <textarea
            required
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            placeholder="One line for operators and the marketplace listing."
          />
        </label>
        <div className="flex flex-wrap gap-2 pt-2">
          <button type="submit" className={BUTTON.primaryRow}>
            Create Draft & Open Builder
          </button>
          <Link href={appHref("/suites")} className={BUTTON.secondaryCardAction}>
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
