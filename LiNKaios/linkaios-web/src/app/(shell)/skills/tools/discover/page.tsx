import Link from "next/link";
import { listTools } from "@linktrend/linklogic-sdk";

import { LinkskillsToolDiscoverPanel } from "@/components/linkskills-discover-panel";
import { LinkskillsHubNav } from "@/components/linkskills-hub-nav";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { discoverRepoTools } from "@/lib/linkskills-repo-discovery";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DiscoverToolsPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await listTools(supabase, { limit: 600 });
  const registered = new Set((data ?? []).map((t) => t.name));
  const candidates = discoverRepoTools(registered);

  return (
    <main className="space-y-8">
      <div>
        <Link href="/skills/tools" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          ← Tools catalogue
        </Link>
      </div>
      <ShellPageHeaderClient
        title="Add Tool from Repo"
        subtitle="Tools are built in LiNKskills/tools/definitions/ after off-platform integration. This list shows repo definitions not yet registered in the catalogue."
      />
      <LinkskillsHubNav />
      <LinkskillsToolDiscoverPanel candidates={candidates} />
    </main>
  );
}
