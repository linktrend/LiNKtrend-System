import { listSkills } from "@linktrend/linklogic-sdk";

import { EntityTable } from "@/components/entity-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await listSkills(supabase, { limit: 300 });

  if (error) {
    return (
      <main>
        <h1 className="text-xl font-semibold text-zinc-900">Skills</h1>
        <p className="mt-4 text-sm text-red-700">{error.message}</p>
      </main>
    );
  }

  return (
    <main>
      <h1 className="text-xl font-semibold text-zinc-900">LiNKskills</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Governed skill bodies resolved by <code className="text-xs">linklogic-sdk</code> for workers.
        Only <span className="font-mono text-xs">approved</span> versions are used for runtime governance
        when strict mode is on.
      </p>
      <div className="mt-8">
        <EntityTable
          title="Skills"
          rows={(data ?? []) as unknown as Record<string, unknown>[]}
          columns={["name", "version", "status", "updated_at"]}
        />
      </div>
    </main>
  );
}
