"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { InsetSelect } from "@/components/forms";
import { INBOX_SUBMISSION_SOURCES, type InboxSubmissionSource } from "@/components/linkbrain/linkbrain-labels";
import { useMemoryHref } from "@/hooks/use-memory-href";
import {
  COLLECTIVE_SUBMISSION_FILTER_OPTIONS,
  COLLECTIVE_TAG_OPTIONS,
  type CollectiveTagFilters,
} from "@/lib/collective-linkbrain";
import type { LinkbrainTab } from "@/lib/linkbrain-data";
import { FIELD, FORM } from "@/lib/ui-standards";

export function CollectiveMemoryTagFilters(props: {
  tab: LinkbrainTab;
  filters: CollectiveTagFilters;
  mission?: string;
  agent?: string;
  org?: string;
  scope?: "recent" | "all";
  inboxSort?: "asc" | "desc";
}) {
  const router = useRouter();
  const hrefForTab = useMemoryHref();

  const base = {
    mission: props.mission,
    agent: props.agent,
    org: props.org,
    scope: props.scope === "all" ? ("all" as const) : undefined,
    inboxSort: props.inboxSort === "asc" ? ("asc" as const) : undefined,
    cIndustry: props.filters.industry,
    cPattern: props.filters.pattern,
    cUseCase: props.filters.useCase,
    cSubmission: props.filters.submissionSource,
  };

  function navigate(next: CollectiveTagFilters) {
    router.push(
      hrefForTab(props.tab, {
        ...base,
        cIndustry: next.industry,
        cPattern: next.pattern,
        cUseCase: next.useCase,
        cSubmission: next.submissionSource,
      }),
    );
  }

  const hasFilters = Boolean(
    props.filters.industry ||
      props.filters.pattern ||
      props.filters.useCase ||
      props.filters.submissionSource,
  );

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COLLECTIVE_TAG_OPTIONS.map((group) => (
          <label key={group.key} className={FORM.fieldStack}>
            <span className={`${FIELD.label} text-xs text-zinc-600 dark:text-zinc-400`}>{group.label}</span>
            <InsetSelect
              fullWidth
              value={props.filters[group.key] ?? ""}
              aria-label={`Filter by ${group.label}`}
              onChange={(e) => {
                const v = e.target.value.trim();
                navigate({ ...props.filters, [group.key]: v || undefined });
              }}
            >
              <option value="">{group.allLabel}</option>
              {group.values.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </InsetSelect>
          </label>
        ))}
        <label className={FORM.fieldStack}>
          <span className={`${FIELD.label} text-xs text-zinc-600 dark:text-zinc-400`}>Submission</span>
          <InsetSelect
            fullWidth
            value={props.filters.submissionSource ?? ""}
            aria-label="Filter by submission type"
            onChange={(e) => {
              const v = e.target.value.trim() as InboxSubmissionSource;
              navigate({
                ...props.filters,
                submissionSource: v && v !== "all" ? (v as Exclude<InboxSubmissionSource, "all">) : undefined,
              });
            }}
          >
            <option value="">{INBOX_SUBMISSION_SOURCES[0]!.label}</option>
            {COLLECTIVE_SUBMISSION_FILTER_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </InsetSelect>
        </label>
      </div>
      {hasFilters ? (
        <Link
          href={hrefForTab(props.tab, {
            mission: props.mission,
            agent: props.agent,
            org: props.org,
            scope: props.scope === "all" ? "all" : undefined,
            inboxSort: props.inboxSort === "asc" ? "asc" : undefined,
          })}
          className="mt-2 inline-block text-xs font-medium text-sky-700 underline dark:text-sky-400"
        >
          Clear filters
        </Link>
      ) : null}
    </div>
  );
}
