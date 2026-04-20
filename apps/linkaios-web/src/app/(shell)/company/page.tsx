import Link from "next/link";

import { listBrainLegalEntities, listBrainOrgNodes } from "@linktrend/linklogic-sdk";

import { updateLegalEntityFromForm } from "@/app/(shell)/company/actions";
import { CompanyOrgEditor } from "@/components/company-org-editor";
import { CompanyUiMockStrip } from "@/components/company-ui-mock-strip";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { BUTTON, FIELD, STACK } from "@/lib/ui-standards";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const uiMocks = isUiMocksEnabled();
  const supabase = await createSupabaseServerClient();

  const [legalRes, nodesRes] = await Promise.all([listBrainLegalEntities(supabase), listBrainOrgNodes(supabase)]);
  const orgLoadFailed = Boolean(legalRes.error || nodesRes.error);
  const legalRows = orgLoadFailed ? undefined : legalRes.data;
  const nodes = orgLoadFailed ? null : nodesRes.data;
  const primaryEntity = legalRows?.[0];

  return (
    <main className="space-y-12">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Company</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Company profile, structure, and where to manage who can change sensitive settings.
        </p>
      </div>

      {uiMocks ? <CompanyUiMockStrip /> : null}

      {orgLoadFailed ? (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100"
        >
          <p className="font-medium">Company data could not be loaded right now.</p>
          <p className="mt-1 text-xs leading-relaxed opacity-90">
            This is usually a temporary connectivity or permissions issue, not an empty company profile. Try again shortly, confirm you are signed in, and verify LiNKbrain organization migrations are applied.
          </p>
        </div>
      ) : null}

      <section className="space-y-6" aria-labelledby="company-profile-heading">
        <h2 id="company-profile-heading" className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Company profile
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Legal identity</h3>
            {orgLoadFailed ? (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Legal identity is unavailable until the data above loads.</p>
            ) : primaryEntity ? (
              <form action={updateLegalEntityFromForm} className="mt-4 space-y-3">
                <input type="hidden" name="id" value={primaryEntity.id} />
                <label className="block">
                  <span className={FIELD.label}>Legal name</span>
                  <input name="name" required defaultValue={primaryEntity.name} className={`mt-1 ${FIELD.control}`} />
                </label>
                <label className="block">
                  <span className={FIELD.label}>Short code</span>
                  <input name="code" defaultValue={primaryEntity.code} className={`mt-1 ${FIELD.control}`} />
                </label>
                <div className={STACK.actions}>
                  <button type="submit" className={BUTTON.primaryBlock}>
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Legal profile is not set up for this workspace yet.</p>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Primary web domain</h3>
            <p className="mt-3 rounded-lg border border-dashed border-zinc-200 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700">
              linktrend.example
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950" aria-labelledby="org-structure-heading">
        <h2 id="org-structure-heading" className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Organization
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
          Add teams or regions so people can filter LiNKbrain content the way your company works.
        </p>
        <div className="mt-6">
          <CompanyOrgEditor nodes={nodes} />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950" aria-labelledby="roles-heading">
        <h2 id="roles-heading" className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Roles
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
          Change who can publish skills, approve tools, and manage access in Settings.
        </p>
        <div className="mt-4">
          <Link
            href="/settings/access"
            className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Open access in Settings
          </Link>
        </div>
      </section>
    </main>
  );
}
