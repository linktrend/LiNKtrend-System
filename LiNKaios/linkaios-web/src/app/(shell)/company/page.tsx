import Link from "next/link";

import { listBrainLegalEntities, listBrainOrgNodes, listBrainVirtualFilesByScope } from "@linktrend/linklogic-sdk";

import { updateLegalEntityFromForm } from "@/app/(shell)/company/actions";
import { CompanyGlossary } from "@/components/company-glossary";
import { CompanyOrgEditor } from "@/components/company-org-editor";
import { CompanyUiMockStrip } from "@/components/company-ui-mock-strip";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { COMPANY_PAGE_HEADER, COMPANY_SECTION_COPY } from "@/lib/company-page-copy";
import { memoryHref } from "@/lib/memory-href";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { BUTTON, FIELD, STACK } from "@/lib/ui-standards";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const uiMocks = isUiMocksEnabled();
  const supabase = await createSupabaseServerClient();

  const [legalRes, nodesRes, companyFilesRes] = await Promise.all([
    listBrainLegalEntities(supabase),
    listBrainOrgNodes(supabase),
    listBrainVirtualFilesByScope(supabase, "company"),
  ]);
  const orgLoadFailed = Boolean(legalRes.error || nodesRes.error);
  const legalRows = orgLoadFailed ? undefined : legalRes.data;
  const nodes = orgLoadFailed ? null : nodesRes.data;
  const primaryEntity = legalRows?.[0];
  const companyKnowledgeCount = companyFilesRes.error ? null : (companyFilesRes.data?.length ?? 0);
  const inboxHref = memoryHref("inbox", {});
  const companyMemoryHref = memoryHref("company", {});

  return (
    <main className="space-y-6">
      <ShellPageHeaderClient title={COMPANY_PAGE_HEADER.title} subtitle={COMPANY_PAGE_HEADER.subtitle} />
      <CompanyGlossary />

      {uiMocks ? <CompanyUiMockStrip /> : null}

      {orgLoadFailed ? (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100"
        >
          <p className="font-medium">Company data could not be loaded right now.</p>
          <p className="mt-1 text-xs leading-relaxed opacity-90">
            This is usually a temporary connectivity or permissions issue, not an empty company profile. Try again
            shortly, confirm you are signed in, and verify LiNKbrain organization migrations are applied.
          </p>
        </div>
      ) : null}

      <section className="space-y-6" aria-labelledby="company-profile-heading">
        <h2
          id="company-profile-heading"
          className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          {COMPANY_SECTION_COPY.profile.title}
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {COMPANY_SECTION_COPY.profile.legalIdentity}
            </h3>
            {orgLoadFailed ? (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Legal identity is unavailable until the data above loads.
              </p>
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
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Legal profile is not set up for this workspace yet.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {COMPANY_SECTION_COPY.profile.website}
            </h3>
            <p className="mt-3 rounded-lg border border-dashed border-zinc-200 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              {COMPANY_SECTION_COPY.profile.websiteEmpty}
            </p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{COMPANY_SECTION_COPY.profile.websiteHint}</p>
          </div>
        </div>
      </section>

      <section
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        aria-labelledby="company-locations-heading"
      >
        <h2
          id="company-locations-heading"
          className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          {COMPANY_SECTION_COPY.locations.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{COMPANY_SECTION_COPY.locations.body}</p>
        <p className="mt-4 rounded-lg border border-dashed border-zinc-200 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          {COMPANY_SECTION_COPY.locations.empty}
        </p>
      </section>

      <section
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        aria-labelledby="org-structure-heading"
      >
        <h2
          id="org-structure-heading"
          className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          {COMPANY_SECTION_COPY.organization.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{COMPANY_SECTION_COPY.organization.body}</p>
        <div className="mt-6">
          <CompanyOrgEditor nodes={nodes} />
        </div>
      </section>

      <section
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        aria-labelledby="company-knowledge-heading"
      >
        <h2
          id="company-knowledge-heading"
          className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          {COMPANY_SECTION_COPY.knowledge.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{COMPANY_SECTION_COPY.knowledge.body}</p>
        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
          {companyKnowledgeCount == null ? (
            <span className="text-zinc-500">Published company files could not be counted right now.</span>
          ) : (
            <>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{companyKnowledgeCount}</span>
              <span className="text-zinc-600 dark:text-zinc-400">
                {" "}
                published company {companyKnowledgeCount === 1 ? "file" : "files"} in LiNKbrain
              </span>
            </>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={inboxHref}
            className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {COMPANY_SECTION_COPY.knowledge.addLabel}
          </Link>
          <Link
            href={companyMemoryHref}
            className="inline-flex rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            {COMPANY_SECTION_COPY.knowledge.viewLabel}
          </Link>
        </div>
      </section>

      <section
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        aria-labelledby="people-heading"
      >
        <h2
          id="people-heading"
          className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          {COMPANY_SECTION_COPY.people.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{COMPANY_SECTION_COPY.people.body}</p>
        <div className="mt-4">
          <Link
            href="/settings/user"
            className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {COMPANY_SECTION_COPY.people.cta}
          </Link>
        </div>
      </section>
    </main>
  );
}
