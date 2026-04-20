"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  addSkillScript,
  approveSkill,
  archiveSkillFile,
  deleteSkillScript,
  saveSkillDeclaredTools,
  saveSkillFrontmatter,
  saveSkillPrompt,
  saveSkillScripts,
  type SkillActionResult,
} from "@/app/(shell)/skills/actions";
import { useRegisterBreadcrumbLabel } from "@/components/breadcrumb-label-registry";
import { LifecyclePill } from "@/components/catalog-ui";
import type { SkillFileRow, SkillScriptRow } from "@/lib/skills-admin";
import { BUTTON, FIELD } from "@/lib/ui-standards";
import type { SkillStatus } from "@linktrend/shared-types";

const BTN_PRIMARY = BUTTON.primaryRow;
const BTN_SECONDARY = BUTTON.secondaryRow;
const BTN_GHOST = BUTTON.ghostRow;
const BTN_APPROVE = BUTTON.approveRow;

function runAction(
  startTransition: (fn: () => void) => void,
  fn: () => Promise<SkillActionResult>,
  onOk: () => void,
  setErr: (s: string | null) => void,
  setFlash: (s: string | null) => void,
  flashMessage = "Saved.",
) {
  startTransition(() => {
    void (async () => {
      setErr(null);
      const r = await fn();
      if (r.ok) {
        setFlash(flashMessage);
        onOk();
      } else {
        setErr(r.error ?? "Something went wrong.");
      }
    })();
  });
}

export function SkillWorkspace(props: {
  skillId: string;
  dataRevision: string;
  name: string;
  version: number;
  category: string;
  description: string;
  skillStatus: SkillStatus;
  initialDeclaredTools: string[];
  /** Sorted tool names from `linkaios.tools` for the add-tool control. */
  catalogToolNames: string[];
  initialFrontmatterYaml: string;
  initialPromptMarkdown: string;
  initialScripts: SkillScriptRow[];
  initialAssets: SkillFileRow[];
  initialReferences: SkillFileRow[];
  /** Dev-only sample file ids; archive disabled so metadata stays in sync. */
  previewOnlyFileIds?: string[];
}) {
  const router = useRouter();
  useRegisterBreadcrumbLabel(props.skillId, props.name);
  const previewFileSet = useMemo(() => new Set(props.previewOnlyFileIds ?? []), [props.previewOnlyFileIds]);
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [fmEditing, setFmEditing] = useState(false);
  const [fmDraft, setFmDraft] = useState(props.initialFrontmatterYaml);

  const [pmEditing, setPmEditing] = useState(false);
  const [pmDraft, setPmDraft] = useState(props.initialPromptMarkdown);

  const [scripts, setScripts] = useState<SkillScriptRow[]>(props.initialScripts);
  const [editingScriptId, setEditingScriptId] = useState<string | null>(null);
  const [scriptFilename, setScriptFilename] = useState("");
  const [scriptContent, setScriptContent] = useState("");

  const [declaredDraft, setDeclaredDraft] = useState<string[]>(() => [...props.initialDeclaredTools].sort());
  const addableTools = useMemo(
    () => props.catalogToolNames.filter((n) => !declaredDraft.includes(n)),
    [props.catalogToolNames, declaredDraft],
  );

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 3200);
    return () => window.clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    setFmDraft(props.initialFrontmatterYaml);
    setPmDraft(props.initialPromptMarkdown);
    setScripts(props.initialScripts);
    setDeclaredDraft([...props.initialDeclaredTools].sort());
    setFmEditing(false);
    setPmEditing(false);
    setEditingScriptId(null);
  }, [
    props.dataRevision,
    props.skillId,
    props.version,
    props.initialFrontmatterYaml,
    props.initialPromptMarkdown,
    props.initialScripts,
    props.initialDeclaredTools,
  ]);

  const refresh = () => router.refresh();

  const startEditScript = (s: SkillScriptRow) => {
    setEditingScriptId(s.id);
    setScriptFilename(s.filename);
    setScriptContent(s.content);
  };

  const cancelEditScript = () => {
    setEditingScriptId(null);
    setScriptFilename("");
    setScriptContent("");
  };

  const saveScriptRow = () => {
    if (!editingScriptId) return;
    const next = scripts.map((s) =>
      s.id === editingScriptId ? { ...s, filename: scriptFilename.trim() || s.filename, content: scriptContent } : s,
    );
    runAction(
      startTransition,
      () => saveSkillScripts(props.skillId, next),
      () => {
        cancelEditScript();
        refresh();
      },
      setErr,
      setFlash,
    );
  };

  const archiveScript = (scriptId: string) => {
    runAction(
      startTransition,
      () => deleteSkillScript(props.skillId, scriptId),
      () => {
        if (editingScriptId === scriptId) cancelEditScript();
        refresh();
      },
      setErr,
      setFlash,
    );
  };

  const onAddScript = () => {
    runAction(startTransition, () => addSkillScript(props.skillId), refresh, setErr, setFlash, "Script added.");
  };

  const archiveFile = (fileId: string, kind: "asset" | "reference") => {
    runAction(startTransition, () => archiveSkillFile(props.skillId, fileId, kind), refresh, setErr, setFlash);
  };

  const saveFrontmatter = () => {
    runAction(
      startTransition,
      () => saveSkillFrontmatter(props.skillId, fmDraft),
      () => {
        setFmEditing(false);
        refresh();
      },
      setErr,
      setFlash,
    );
  };

  const savePrompt = () => {
    runAction(
      startTransition,
      () => saveSkillPrompt(props.skillId, pmDraft),
      () => {
        setPmEditing(false);
        refresh();
      },
      setErr,
      setFlash,
    );
  };

  const preMonoClass =
    "mt-2 max-w-3xl whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white px-4 py-3 font-mono text-sm text-zinc-800";
  const prePlainClass =
    "mt-2 max-w-3xl whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800";

  const subsectionTitleClass = "text-sm font-semibold text-zinc-900";

  const removeDeclared = (name: string) => {
    setDeclaredDraft((d) => d.filter((x) => x !== name));
  };

  const saveDeclaredTools = () => {
    runAction(
      startTransition,
      () => saveSkillDeclaredTools(props.skillId, declaredDraft),
      refresh,
      setErr,
      setFlash,
      "Declared tools saved.",
    );
  };

  const runApproveSkill = () => {
    if (!window.confirm("Approve this skill? It must pass declared-tools catalog checks.")) return;
    runAction(
      startTransition,
      () => approveSkill(props.skillId),
      refresh,
      setErr,
      setFlash,
      "Skill approved.",
    );
  };

  return (
    <div className="space-y-10">
      <section className="space-y-8">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">1. Overview</h2>
        <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{props.name}</h1>
          <LifecyclePill status={props.skillStatus} />
        </div>
        {props.description?.trim() ? (
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{props.description}</p>
        ) : null}
        <dl className="grid max-w-3xl gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Lifecycle</dt>
            <dd className="mt-0.5 font-medium capitalize text-zinc-900">{props.skillStatus}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Version</dt>
            <dd className="mt-0.5 font-mono text-zinc-800">{props.version}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Category</dt>
            <dd className="mt-0.5 font-medium text-zinc-900">{props.category}</dd>
          </div>
        </dl>
        {props.skillStatus === "draft" ? (
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" disabled={pending} onClick={runApproveSkill} className={BTN_APPROVE}>
              Approve skill
            </button>
            <p className="max-w-xl text-xs text-zinc-600 dark:text-zinc-400">
              Requires every declared tool to exist in the catalog, be approved and marked Available, and appear on the
              organization tool allowlist (Settings → Tools).
            </p>
          </div>
        ) : null}
        </header>

        <section className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className={`${subsectionTitleClass} dark:text-zinc-100`}>YAML metadata (frontmatter)</h3>
            {!fmEditing ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setFmDraft(props.initialFrontmatterYaml);
                  setFmEditing(true);
                }}
                className={BTN_GHOST}
              >
                Edit
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={pending} onClick={saveFrontmatter} className={BTN_PRIMARY}>
                  Save
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setFmDraft(props.initialFrontmatterYaml);
                    setFmEditing(false);
                  }}
                  className={BTN_SECONDARY}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          {fmEditing ? (
            <textarea
              rows={14}
              value={fmDraft}
              onChange={(e) => setFmDraft(e.target.value)}
              disabled={pending}
              className={`mt-2 ${FIELD.mono}`}
              spellCheck={false}
            />
          ) : (
            <pre className={preMonoClass}>{props.initialFrontmatterYaml.trim() ? props.initialFrontmatterYaml : "—"}</pre>
          )}
        </section>
      </section>

      {(flash || err) && (
        <div className="flex flex-wrap gap-4 text-sm">
          {flash ? <span className="text-emerald-700">{flash}</span> : null}
          {err ? <span className="text-red-700">{err}</span> : null}
        </div>
      )}

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">2. Behavior (prompt)</h2>
          {!pmEditing ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setPmDraft(props.initialPromptMarkdown);
                setPmEditing(true);
              }}
              className={BTN_GHOST}
            >
              Edit
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={pending} onClick={savePrompt} className={BTN_PRIMARY}>
                Save
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setPmDraft(props.initialPromptMarkdown);
                  setPmEditing(false);
                }}
                className={BTN_SECONDARY}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {pmEditing ? (
          <textarea
            rows={20}
            value={pmDraft}
            onChange={(e) => setPmDraft(e.target.value)}
            disabled={pending}
            className={`mt-2 ${FIELD.wide}`}
          />
        ) : (
          <pre className={prePlainClass}>{props.initialPromptMarkdown.trim() ? props.initialPromptMarkdown : "—"}</pre>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">3. Capabilities (tools)</h2>
            <p className="mt-1 max-w-2xl text-xs text-zinc-600 dark:text-zinc-400">
              Tools this skill may call at runtime. Add from the approved catalogue or remove entries, then save.
            </p>
          </div>
          <button type="button" disabled={pending} onClick={saveDeclaredTools} className={BTN_PRIMARY}>
            Save declared tools
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Add
            <select
              className="ml-2 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              disabled={pending || addableTools.length === 0}
              defaultValue=""
              onChange={(e) => {
                const v = e.target.value;
                e.target.value = "";
                if (!v) return;
                setDeclaredDraft((d) => (d.includes(v) ? d : [...d, v].sort()));
              }}
            >
              <option value="">{addableTools.length ? "Choose tool…" : "No more tools"}</option>
              {addableTools.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
        {declaredDraft.length === 0 ? (
          <p className="text-sm text-zinc-500">None declared (empty array).</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {[...declaredDraft].sort().map((n) => (
              <li
                key={n}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                {n}
                <button
                  type="button"
                  disabled={pending}
                  className="rounded px-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800"
                  aria-label={`Remove ${n}`}
                  onClick={() => removeDeclared(n)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-8">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">4. Execution (scripts)</h2>
        {previewFileSet.size > 0 ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Development preview: sample files are listed because this skill has no stored assets or references yet. Archive
            is disabled for these rows.
          </p>
        ) : null}

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className={subsectionTitleClass}>Scripts</span>
            <button type="button" disabled={pending} onClick={onAddScript} className={BTN_PRIMARY}>
              Add
            </button>
          </div>
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white text-sm">
            {scripts.length === 0 ? (
              <li className="px-4 py-6 text-zinc-500">No scripts yet.</li>
            ) : (
              scripts.map((s) => (
                <li key={s.id} className="px-4 py-3">
                  {editingScriptId === s.id ? (
                    <div className="space-y-3">
                      <label className="block text-xs font-medium text-zinc-600">
                        Filename
                        <input
                          value={scriptFilename}
                          onChange={(e) => setScriptFilename(e.target.value)}
                          disabled={pending}
                          className={`mt-1 block ${FIELD.control}`}
                        />
                      </label>
                      <label className="block text-xs font-medium text-zinc-600">
                        Content
                        <textarea
                          value={scriptContent}
                          onChange={(e) => setScriptContent(e.target.value)}
                          disabled={pending}
                          rows={12}
                          className={`mt-1 block ${FIELD.mono}`}
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" disabled={pending} onClick={saveScriptRow} className={BTN_PRIMARY}>
                          Save
                        </button>
                        <button type="button" disabled={pending} onClick={cancelEditScript} className={BTN_SECONDARY}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-zinc-900">{s.filename}</div>
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{s.content.replace(/\s+/g, " ").trim()}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button type="button" disabled={pending} onClick={() => startEditScript(s)} className={BTN_GHOST}>
                          Edit
                        </button>
                        <button type="button" disabled={pending} onClick={() => archiveScript(s.id)} className={BTN_GHOST}>
                          Archive
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">5. Resources</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className={subsectionTitleClass}>Assets</h3>
            <button type="button" disabled className={BTN_PRIMARY} title="Upload pipeline not wired yet.">
              Add
            </button>
          </div>
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white text-sm">
            {props.initialAssets.length === 0 ? (
              <li className="px-4 py-6 text-zinc-500">No assets recorded.</li>
            ) : (
              props.initialAssets.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <span className="font-medium text-zinc-900">{f.name}</span>
                    {previewFileSet.has(f.id) ? (
                      <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                        Preview
                      </span>
                    ) : null}
                    <span className="ml-2 text-xs text-zinc-500">{f.bytes != null ? `${f.bytes} B` : "—"}</span>
                  </div>
                  <button
                    type="button"
                    disabled={pending || previewFileSet.has(f.id)}
                    title={previewFileSet.has(f.id) ? "Sample row (not stored on this skill)" : undefined}
                    onClick={() => archiveFile(f.id, "asset")}
                    className={BTN_GHOST}
                  >
                    Archive
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className={subsectionTitleClass}>Reference Files</h3>
            <button type="button" disabled className={BTN_PRIMARY} title="Upload pipeline not wired yet.">
              Add
            </button>
          </div>
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white text-sm">
            {props.initialReferences.length === 0 ? (
              <li className="px-4 py-6 text-zinc-500">No reference files recorded.</li>
            ) : (
              props.initialReferences.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <span className="font-medium text-zinc-900">{f.name}</span>
                    {previewFileSet.has(f.id) ? (
                      <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                        Preview
                      </span>
                    ) : null}
                    <span className="ml-2 text-xs text-zinc-500">{f.bytes != null ? `${f.bytes} B` : "—"}</span>
                  </div>
                  <button
                    type="button"
                    disabled={pending || previewFileSet.has(f.id)}
                    title={previewFileSet.has(f.id) ? "Sample row (not stored on this skill)" : undefined}
                    onClick={() => archiveFile(f.id, "reference")}
                    className={BTN_GHOST}
                  >
                    Archive
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
