import Link from "next/link";

import { PageIntro } from "@/components/page-intro";
import { CompanyOrgEditor } from "@/components/company-org-editor";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { listBrainOrgNodes } from "@linktrend/linklogic-sdk";

export const dynamic = "force-dynamic";

/** @deprecated Prefer the in-app Company screen; this route remains for old bookmarks. */
export default async function CompanyStructurePage() {
  const supabase = await createSupabaseServerClient();
  const { data: nodes } = await listBrainOrgNodes(supabase);

  return (
    <main className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Company structure (legacy)</h1>
        <PageIntro className="mt-2">
          Org editing now lives on the <Link href="/company" className="font-medium text-sky-700 underline dark:text-sky-400">Company</Link> page.
          This URL is kept for bookmarks only.
        </PageIntro>
      </div>
      <CompanyOrgEditor nodes={nodes} />
    </main>
  );
}
