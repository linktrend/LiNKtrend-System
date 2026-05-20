"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { updateLegalEntityFromForm } from "@/app/(shell)/company/actions";
import { COMPANY_INDUSTRY_OPTIONS, COMPANY_SECTION_COPY } from "@/lib/company-page-copy";
import type { CompanyFixture } from "@/lib/company-fixtures";
import { BUTTON, FIELD } from "@/lib/ui-standards";

import type { BrainLegalEntityRow } from "@linktrend/linklogic-sdk";

export function CompanyProfilePanel(props: {
  company: CompanyFixture;
  orgLoadFailed: boolean;
  primaryEntity?: BrainLegalEntityRow;
}) {
  const [displayName, setDisplayName] = useState(props.company.displayName);
  const [description, setDescription] = useState(props.company.description);
  const [industry, setIndustry] = useState(props.company.industry);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setDisplayName(props.company.displayName);
    setDescription(props.company.description);
    setIndustry(props.company.industry);
    setSavedFlash(false);
  }, [props.company.id, props.company.displayName, props.company.description, props.company.industry]);

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    // TODO(UIUX-COMP): persist display name, description, industry to company profile table
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 4000);
  }

  return (
    <section className="space-y-6" aria-labelledby="company-profile-heading">
      <h2
        id="company-profile-heading"
        className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
      >
        {COMPANY_SECTION_COPY.profile.title}
      </h2>

      {savedFlash ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          Profile preview saved locally — database wiring pending.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleProfileSave}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Brand &amp; industry</h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{COMPANY_SECTION_COPY.profile.saveNote}</p>

          <label className="mt-4 block">
            <span className={FIELD.label}>{COMPANY_SECTION_COPY.profile.displayName}</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={`mt-1 ${FIELD.control}`}
            />
          </label>
          <label className="mt-3 block">
            <span className={FIELD.label}>{COMPANY_SECTION_COPY.profile.description}</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`mt-1 ${FIELD.wide}`}
            />
          </label>
          <label className="mt-3 block">
            <span className={FIELD.label}>{COMPANY_SECTION_COPY.profile.industry}</span>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={`mt-1 ${FIELD.control}`}
            >
              {COMPANY_INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-4">
            <button type="submit" className={BUTTON.primaryRow}>
              Save profile (preview)
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {COMPANY_SECTION_COPY.profile.legalIdentity}
            </h3>
            {props.orgLoadFailed ? (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Legal identity is unavailable until organization data loads.
              </p>
            ) : props.primaryEntity ? (
              <form action={updateLegalEntityFromForm} className="mt-4 space-y-3">
                <input type="hidden" name="id" value={props.primaryEntity.id} />
                <label className="block">
                  <span className={FIELD.label}>Legal name</span>
                  <input
                    name="name"
                    required
                    defaultValue={props.primaryEntity.name}
                    className={`mt-1 ${FIELD.control}`}
                  />
                </label>
                <label className="block">
                  <span className={FIELD.label}>Short code</span>
                  <input name="code" defaultValue={props.primaryEntity.code} className={`mt-1 ${FIELD.control}`} />
                </label>
                <button type="submit" className={BUTTON.primaryRow}>
                  Save legal identity
                </button>
              </form>
            ) : (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Legal profile is not set up for this workspace yet. Fixture: {props.company.name}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {COMPANY_SECTION_COPY.profile.website}
            </h3>
            <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
              <Link
                href={props.company.website}
                className="font-medium text-sky-700 underline dark:text-sky-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                {props.company.website}
              </Link>
            </p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{COMPANY_SECTION_COPY.profile.websiteHint}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
