"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  addSkillAsset,
  addSkillReference,
  addSkillScript,
  approveSkill,
  archiveSkillFile,
  deleteSkillScript,
  saveSkillAssets,
  saveSkillDeclaredTools,
  saveSkillPrompt,
  saveSkillReferences,
  saveSkillScripts,
  saveSkillStructuredMetadata,
  type SkillActionResult,
} from "@/app/(shell)/skills/actions";
import { useRegisterBreadcrumbLabel } from "@/components/breadcrumb-label-registry";
import { LifecyclePill } from "@/components/catalog-ui";
import type {
  SkillAssetTableRow,
  SkillReferenceTableRow,
  SkillScriptRow,
} from "@/lib/skills-admin";
import { BUTTON, FIELD } from "@/lib/ui-standards";
import type { SkillStepRecipeEntry } from "@linktrend/linklogic-sdk";
import type { SkillStatus } from "@linktrend/shared-types";

const BTN_PRIMARY = BUTTON.primaryRow;
const BTN_SECONDARY = BUTTON.secondaryRow;
const BTN_GHOST = BUTTON.ghostRow;
const BTN_APPROVE = BUTTON.approveRow;

type SkillMode = "simple" | "stepped";

export type SkillStepDraft = SkillStepRecipeEntry;

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

function nextOrdinal(steps: SkillStepDraft[]): number {
  if (steps.length === 0) return 1;
  return Math.max(...steps.map((s) => Number(s.ordinal) || 0)) + 1;
}

export function SkillWorkspace(props: {
  skillId: string;
  dataRevision: string;
  name: string;
  version: number;
  /** Legacy display label from metadata (category title). */
  categoryLabel: string;
  description: string;
  usageTrigger: string;
  skillStatus: SkillStatus;
  initialDeclaredTools: string[];
  catalogToolNames: string[];
  initialPromptMarkdown: string;
  initialScripts: SkillScriptRow[];
  initialAssets: SkillAssetTableRow[];
  initialReferences: SkillReferenceTableRow[];
  previewOnlyFileIds?: string[];
  categories: { id: string; title: string }[];
  skillCategoryId: string | null;
  defaultModel: string;
  initialTags: string[];
  skillMode: SkillMode;
  initialSteps: SkillStepDraft[];
}) {
  const router = useRouter();
  useRegisterBreadcrumbLabel(props.skillId, props.name);
  const previewFileSet = useMemo(() => new Set(props.previewOnlyFileIds ?? []), [props.previewOnlyFileIds]);
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState<string | null>(props.skillCategoryId);
  const [descriptionDraft, setDescriptionDraft] = useState(props.description);
  const [usageTriggerDraft, setUsageTriggerDraft] = useState(props.usageTrigger);
  const [tagsDraft, setTagsDraft] = useState(() => props.initialTags.join(", "));
  const [defaultModelDraft, setDefaultModelDraft] = useState(props.defaultModel);
  const [skillModeDraft, setSkillModeDraft] = useState<SkillMode>(props.skillMode);
  const [stepsDraft, setStepsDraft] = useState<SkillStepDraft[]>(() =>
    [...props.initialSteps].sort((a, b) => (Number(a.ordinal) || 0) - (Number(b.ordinal) || 0)),
  );

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

  const [refRows, setRefRows] = useState<SkillReferenceTableRow[]>(props.initialReferences);
  const [assetRows, setAssetRows] = useState<SkillAssetTableRow[]>(props.initialAssets);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 3200);
    return () => window.clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    setPmDraft(props.initialPromptMarkdown);
    setScripts(props.initialScripts);
    setDeclaredDraft([...props.initialDeclaredTools].sort());
    setPmEditing(false);
    setEditingScriptId(null);
    setCategoryId(props.skillCategoryId);
    setDescriptionDraft(props.description);
    setUsageTriggerDraft(props.usageTrigger);
    setTagsDraft(props.initialTags.join(", "));
    setDefaultModelDraft(props.defaultModel);
    setSkillModeDraft(props.skillMode);
    setStepsDraft(
      [...props.initialSteps]
        .sort((a, b) => (Number(a.ordinal) || 0) - (Number(b.ordinal) || 0))
        .map((s) => ({
          ...s,
          script_ids: s.script_ids?.length ? s.script_ids : undefined,
          reference_ids: s.reference_ids?.length ? s.reference_ids : undefined,
          asset_ids: s.asset_ids?.length ? s.asset_ids : undefined,
        })),
    );
    setRefRows(props.initialReferences);
    setAssetRows(props.initialAssets);
  }, [
    props.dataRevision,
    props.skillId,
    props.version,
    props.initialPromptMarkdown,
    props.initialScripts,
    props.initialDeclaredTools,
    props.skillCategoryId,
    props.description,
    props.usageTrigger,
    props.initialTags,
    props.defaultModel,
    props.skillMode,
    props.initialSteps,
    props.initialReferences,
    props.initialAssets,
  ]);

  const refresh = () => router.refresh();

  const tagsArray = useMemo(
    () =>
      tagsDraft
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [tagsDraft],
  );

  const categoryTitle = useMemo(() => {
    if (categoryId) {
      const hit = props.categories.find((c) => c.id === categoryId);
      if (hit) return hit.title;
    }
    return props.categoryLabel;
  }, [categoryId, props.categories, props.categoryLabel]);

  const saveStructured = () => {
    if (skillModeDraft === "simple" && declaredDraft.length === 0) {
      setErr("Simple skills: declare at least one default tool before saving metadata.");
      return;
    }
    runAction(
      startTransition,
      () =>
        saveSkillStructuredMetadata(props.skillId, {
          categoryId,
          description: descriptionDraft,
          usageTrigger: usageTriggerDraft,
          tags: tagsArray,
          defaultModel: defaultModelDraft,
          skillMode: skillModeDraft,
          stepRecipe: stepsDraft,
        }),
      refresh,
      setErr,
      setFlash,
      "Structured metadata & step recipe saved.",
    );
  };

  const addStep = () => {
    setStepsDraft((s) => [...s, { ordinal: nextOrdinal(s), title: `Step ${nextOrdinal(s)}`, declared_tools: [] }]);
  };

  const removeStep = (ordinal: number) => {
    if (!window.confirm("Remove this step from the recipe?")) return;
    setStepsDraft((rows) => rows.filter((r) => Number(r.ordinal) !== ordinal));
  };

  const applyDefaultsToAllSteps = () => {
    if (!window.confirm("Copy skill-wide default model and declared tools into every step?")) return;
    setStepsDraft((rows) =>
      rows.map((r) => ({
        ...r,
        model: defaultModelDraft.trim() || r.model,
        declared_tools: [...declaredDraft],
      })),
    );
    setFlash("Defaults applied to all steps (save metadata to persist).");
  };

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

  const saveReferences = () => {
    runAction(startTransition, () => saveSkillReferences(props.skillId, refRows), refresh, setErr, setFlash, "References saved.");
  };

  const saveAssets = () => {
    runAction(startTransition, () => saveSkillAssets(props.skillId, assetRows), refresh, setErr, setFlash, "Assets saved.");
  };

  const onAddReference = () => {
    runAction(startTransition, () => addSkillReference(props.skillId), refresh, setErr, setFlash, "Reference added.");
  };

  const onAddAsset = () => {
    runAction(startTransition, () => addSkillAsset(props.skillId), refresh, setErr, setFlash, "Asset added.");
  };

  const prePlainClass =
    "mt-2 max-w-3xl whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800";

  const subsectionTitleClass = "text-sm font-semibold text-zinc-900";

  const removeDeclared = (name: string) => {
    setDeclaredDraft((d) => d.filter((x) => x !== name));
  };

  const saveDeclaredTools = () => {
    if (skillModeDraft === "simple" && declaredDraft.length === 0) {
      setErr("Simple skills: declare at least one tool (no empty shortcut).");
      return;
    }
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
    if (skillModeDraft === "simple" && declaredDraft.length === 0) {
      setErr("Simple skills: declare at least one default tool, then save declared tools, before approval.");
      return;
    }
    if (
      skillModeDraft === "stepped" &&
      declaredDraft.length === 0 &&
      !stepsDraft.some((st) => (st.declared_tools?.length ?? 0) > 0)
    ) {
      setErr(
        "Stepped skills: declare tools on the skill-wide defaults and/or on at least one step, then save declared tools / metadata before approval.",
      );
      return;
    }
    if (!window.confirm("Approve this skill? Effective declared tools must pass catalog and org allowlist checks.")) return;
    runAction(
      startTransition,
      () => approveSkill(props.skillId),
      refresh,
      setErr,
      setFlash,
      "Skill approved.",
    );
  };

  const updateStep = (ordinal: number, patch: Partial<SkillStepDraft>) => {
    setStepsDraft((rows) => rows.map((r) => (Number(r.ordinal) === ordinal ? { ...r, ...patch } : r)));
  };

  const parseToolsCsv = (s: string) =>
    s
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);

  const toggleStepScript = (ordinal: number, scriptId: string, checked: boolean) => {
    setStepsDraft((rows) =>
      rows.map((r) => {
        if (Number(r.ordinal) !== ordinal) return r;
        const cur = [...(r.script_ids ?? [])];
        if (checked) {
          if (!cur.includes(scriptId)) cur.push(scriptId);
          return { ...r, script_ids: cur };
        }
        const next = cur.filter((x) => x !== scriptId);
        return { ...r, script_ids: next.length ? next : undefined };
      }),
    );
  };

  const toggleStepRef = (ordinal: number, refId: string, checked: boolean) => {
    setStepsDraft((rows) =>
      rows.map((r) => {
        if (Number(r.ordinal) !== ordinal) return r;
        const cur = [...(r.reference_ids ?? [])];
        if (checked) {
          if (!cur.includes(refId)) cur.push(refId);
          return { ...r, reference_ids: cur };
        }
        const next = cur.filter((x) => x !== refId);
        return { ...r, reference_ids: next.length ? next : undefined };
      }),
    );
  };

  const toggleStepAsset = (ordinal: number, assetId: string, checked: boolean) => {
    setStepsDraft((rows) =>
      rows.map((r) => {
        if (Number(r.ordinal) !== ordinal) return r;
        const cur = [...(r.asset_ids ?? [])];
        if (checked) {
          if (!cur.includes(assetId)) cur.push(assetId);
          return { ...r, asset_ids: cur };
        }
        const next = cur.filter((x) => x !== assetId);
        return { ...r, asset_ids: next.length ? next : undefined };
      }),
    );
  };

  const scriptSelectionUnrestricted = (step: SkillStepDraft) => !step.script_ids?.length;
  const scriptChecked = (step: SkillStepDraft, scriptId: string) =>
    !scriptSelectionUnrestricted(step) && Boolean(step.script_ids?.includes(scriptId));

  return (
    <div className="space-y-10">
      <section className="space-y-8">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">1. Overview & metadata</h2>
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{props.name}</h1>
            <LifecyclePill status={props.skillStatus} />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Category: <span className="font-medium text-zinc-800 dark:text-zinc-200">{categoryTitle}</span>
            {categoryId ? null : (
              <span className="text-amber-800 dark:text-amber-200"> — pick a category above (FK is authoritative).</span>
            )}
          </p>
          <dl className="grid max-w-3xl gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Lifecycle</dt>
              <dd className="mt-0.5 font-medium capitalize text-zinc-900">{props.skillStatus}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Version</dt>
              <dd className="mt-0.5 font-mono text-zinc-800">{props.version}</dd>
            </div>
          </dl>
          {props.skillStatus === "draft" ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" disabled={pending} onClick={runApproveSkill} className={BTN_APPROVE}>
                Approve skill
              </button>
              <p className="max-w-xl text-xs text-zinc-600 dark:text-zinc-400">
                Effective declared tools must be <strong>non-empty</strong> (skill-wide defaults ∪ stepped per-step lists).
                Every tool must exist in the catalog as <strong>approved</strong> and appear on the organization allowlist
                (Settings → Tools). The server runs the same checks as this copy describes.
              </p>
            </div>
          ) : null}
        </header>

        <div className="max-w-3xl space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div>
            <label className={`block text-xs font-medium text-zinc-600 dark:text-zinc-400`}>Category (FK)</label>
            <select
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value || null)}
              disabled={pending}
              className={`mt-1 block w-full ${FIELD.control}`}
            >
              <option value="">—</option>
              {props.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Description
            <textarea
              value={descriptionDraft}
              onChange={(e) => setDescriptionDraft(e.target.value)}
              disabled={pending}
              rows={3}
              className={`mt-1 block w-full ${FIELD.wide}`}
            />
          </label>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Usage trigger
            <input
              value={usageTriggerDraft}
              onChange={(e) => setUsageTriggerDraft(e.target.value)}
              disabled={pending}
              className={`mt-1 block w-full ${FIELD.control}`}
            />
          </label>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Tags (comma-separated)
            <input
              value={tagsDraft}
              onChange={(e) => setTagsDraft(e.target.value)}
              disabled={pending}
              className={`mt-1 block w-full ${FIELD.control}`}
            />
          </label>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Default model
            <input
              value={defaultModelDraft}
              onChange={(e) => setDefaultModelDraft(e.target.value)}
              disabled={pending}
              placeholder="e.g. gemini-2.0-flash"
              className={`mt-1 block w-full ${FIELD.control}`}
            />
          </label>
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Skill mode</legend>
            <label className="mr-4 inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="skill_mode"
                checked={skillModeDraft === "simple"}
                onChange={() => setSkillModeDraft("simple")}
                disabled={pending}
              />
              Simple
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="skill_mode"
                checked={skillModeDraft === "stepped"}
                onChange={() => setSkillModeDraft("stepped")}
                disabled={pending}
              />
              Stepped
            </label>
          </fieldset>
          <button type="button" disabled={pending} onClick={saveStructured} className={BTN_PRIMARY}>
            Save structured metadata &amp; step recipe
          </button>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            One save updates category, tags, model, mode, and the full <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">step_recipe</code> JSON
            (including per-step script / reference / asset picks).
          </p>
        </div>

        {skillModeDraft === "stepped" ? (
          <div className="max-w-3xl space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className={`${subsectionTitleClass} dark:text-zinc-100`}>Step recipe</h3>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={pending} onClick={addStep} className={BTN_SECONDARY}>
                  Add step
                </button>
                <button type="button" disabled={pending || stepsDraft.length === 0} onClick={applyDefaultsToAllSteps} className={BTN_GHOST}>
                  Apply defaults to all steps
                </button>
              </div>
            </div>
            {stepsDraft.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">No steps yet. Add a step or switch to Simple mode.</p>
            ) : (
              <ul className="space-y-4">
                {stepsDraft.map((step) => (
                  <li key={step.ordinal} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono text-zinc-500">ordinal {step.ordinal}</span>
                      <button type="button" className={BTN_GHOST} disabled={pending} onClick={() => removeStep(step.ordinal)}>
                        Remove step
                      </button>
                    </div>
                    <label className="mt-2 block text-xs font-medium text-zinc-600">
                      Title
                      <input
                        value={step.title ?? ""}
                        onChange={(e) => updateStep(step.ordinal, { title: e.target.value })}
                        disabled={pending}
                        className={`mt-1 block w-full ${FIELD.control}`}
                      />
                    </label>
                    <label className="mt-2 block text-xs font-medium text-zinc-600">
                      Model override
                      <input
                        value={step.model ?? ""}
                        onChange={(e) => updateStep(step.ordinal, { model: e.target.value })}
                        disabled={pending}
                        className={`mt-1 block w-full ${FIELD.control}`}
                      />
                    </label>
                    <label className="mt-2 block text-xs font-medium text-zinc-600">
                      Declared tools (comma-separated; union with skill defaults for governance)
                      <input
                        value={(step.declared_tools ?? []).join(", ")}
                        onChange={(e) => updateStep(step.ordinal, { declared_tools: parseToolsCsv(e.target.value) })}
                        disabled={pending}
                        className={`mt-1 block w-full ${FIELD.mono}`}
                      />
                    </label>
                    <div className="mt-3 space-y-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Scripts (optional)</p>
                      <p className="text-xs text-zinc-500">
                        Leave all unchecked to allow <strong>every</strong> skill script for this step. Check specific files to
                        restrict execution to that subset (stored as <code className="rounded bg-zinc-100 px-0.5 dark:bg-zinc-800">script_ids</code>).
                      </p>
                      <div className="max-h-36 space-y-1 overflow-y-auto rounded border border-zinc-100 p-2 dark:border-zinc-800">
                        {scripts.length === 0 ? (
                          <span className="text-xs text-zinc-500">No scripts on this skill yet.</span>
                        ) : (
                          scripts.map((sc) => (
                            <label key={sc.id} className="flex cursor-pointer items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={scriptChecked(step, sc.id)}
                                disabled={pending}
                                onChange={(e) => toggleStepScript(step.ordinal, sc.id, e.target.checked)}
                              />
                              <span className="font-mono text-zinc-800 dark:text-zinc-200">{sc.filename}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">References (optional)</p>
                      <p className="text-xs text-zinc-500">
                        Checked rows add to <code className="rounded bg-zinc-100 px-0.5 dark:bg-zinc-800">reference_ids</code>.
                        Rows with matching <code className="rounded bg-zinc-100 px-0.5 dark:bg-zinc-800">step_ordinal</code> in the
                        table are included even if not checked.
                      </p>
                      <div className="max-h-36 space-y-1 overflow-y-auto rounded border border-zinc-100 p-2 dark:border-zinc-800">
                        {refRows.length === 0 ? (
                          <span className="text-xs text-zinc-500">No references yet.</span>
                        ) : (
                          refRows.map((rf) => (
                            <label key={rf.id} className="flex cursor-pointer items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={Boolean(step.reference_ids?.includes(rf.id))}
                                disabled={pending}
                                onChange={(e) => toggleStepRef(step.ordinal, rf.id, e.target.checked)}
                              />
                              <span className="text-zinc-800 dark:text-zinc-200">{rf.label}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Assets (optional)</p>
                      <p className="text-xs text-zinc-500">
                        Same pattern as references: <code className="rounded bg-zinc-100 px-0.5 dark:bg-zinc-800">asset_ids</code>{" "}
                        plus table <code className="rounded bg-zinc-100 px-0.5 dark:bg-zinc-800">step_ordinal</code>.
                      </p>
                      <div className="max-h-36 space-y-1 overflow-y-auto rounded border border-zinc-100 p-2 dark:border-zinc-800">
                        {assetRows.length === 0 ? (
                          <span className="text-xs text-zinc-500">No assets yet.</span>
                        ) : (
                          assetRows.map((af) => (
                            <label key={af.id} className="flex cursor-pointer items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={Boolean(step.asset_ids?.includes(af.id))}
                                disabled={pending}
                                onChange={(e) => toggleStepAsset(step.ordinal, af.id, e.target.checked)}
                              />
                              <span className="text-zinc-800 dark:text-zinc-200">{af.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Persist with <strong>Save structured metadata &amp; step recipe</strong>. Skill-wide defaults still apply when a
              step omits tools or model. Save references/assets in section 5 before binding them here.
            </p>
          </div>
        ) : (
          <p className="max-w-3xl text-xs text-zinc-600 dark:text-zinc-400">
            Simple mode: use <strong>Default model</strong> above and <strong>Declared tools</strong> in section 3 as
            whole-skill defaults (required before approval).
          </p>
        )}
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
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Prose only. Legacy YAML frontmatter in stored bodies is ignored here and stripped on save.
        </p>
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
              Skill-wide default declared tools (stored in <code className="rounded bg-zinc-100 px-0.5 dark:bg-zinc-800">default_declared_tools</code>
              ). For stepped skills you can leave this empty only if per-step lists make the <strong>union</strong> non-empty;
              approval still requires that union.
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
          <p className="text-sm text-zinc-500">None declared (simple mode requires tools before approval).</p>
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
            Development preview: sample rows are listed because this skill has no stored references/assets yet. Archive is
            disabled for these rows.
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
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">5. Resources (tables)</h2>
        <p className="max-w-3xl text-xs text-zinc-600 dark:text-zinc-400">
          Rows map to <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">linkaios.skill_references</code> and{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">linkaios.skill_assets</code>.{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">step_ordinal</code> null means skill-wide; set 1-based
          ordinal to scope a row to a stepped step.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className={subsectionTitleClass}>References</h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={pending} onClick={onAddReference} className={BTN_SECONDARY}>
                Add reference
              </button>
              <button type="button" disabled={pending} onClick={saveReferences} className={BTN_PRIMARY}>
                Save references
              </button>
            </div>
          </div>
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white text-sm">
            {refRows.length === 0 ? (
              <li className="px-4 py-6 text-zinc-500">No references.</li>
            ) : (
              refRows.map((r, idx) => (
                <li key={r.id} className="space-y-2 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs text-zinc-500">{r.id}</span>
                    <button
                      type="button"
                      disabled={pending || previewFileSet.has(r.id)}
                      onClick={() => archiveFile(r.id, "reference")}
                      className={BTN_GHOST}
                    >
                      Delete
                    </button>
                  </div>
                  <label className="block text-xs font-medium text-zinc-600">
                    Label
                    <input
                      value={r.label}
                      onChange={(e) => {
                        const v = e.target.value;
                        setRefRows((rows) => rows.map((x, i) => (i === idx ? { ...x, label: v } : x)));
                      }}
                      disabled={pending}
                      className={`mt-1 block w-full ${FIELD.control}`}
                    />
                  </label>
                  <label className="block text-xs font-medium text-zinc-600">
                    Kind
                    <select
                      value={r.kind}
                      onChange={(e) => {
                        const v = e.target.value as SkillReferenceTableRow["kind"];
                        setRefRows((rows) => rows.map((x, i) => (i === idx ? { ...x, kind: v } : x)));
                      }}
                      disabled={pending}
                      className={`mt-1 block w-full ${FIELD.control}`}
                    >
                      <option value="brain_path">brain_path</option>
                      <option value="storage_uri">storage_uri</option>
                      <option value="tool_name">tool_name</option>
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-zinc-600">
                    Target
                    <input
                      value={r.target}
                      onChange={(e) => {
                        const v = e.target.value;
                        setRefRows((rows) => rows.map((x, i) => (i === idx ? { ...x, target: v } : x)));
                      }}
                      disabled={pending}
                      className={`mt-1 block w-full ${FIELD.control}`}
                    />
                  </label>
                  <label className="block text-xs font-medium text-zinc-600">
                    step_ordinal (blank = skill-wide)
                    <input
                      type="number"
                      value={r.step_ordinal ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const n = raw === "" ? null : Math.floor(Number(raw));
                        setRefRows((rows) => rows.map((x, i) => (i === idx ? { ...x, step_ordinal: n } : x)));
                      }}
                      disabled={pending}
                      className={`mt-1 block w-full ${FIELD.control}`}
                    />
                  </label>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className={subsectionTitleClass}>Assets</h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={pending} onClick={onAddAsset} className={BTN_SECONDARY}>
                Add asset
              </button>
              <button type="button" disabled={pending} onClick={saveAssets} className={BTN_PRIMARY}>
                Save assets
              </button>
            </div>
          </div>
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white text-sm">
            {assetRows.length === 0 ? (
              <li className="px-4 py-6 text-zinc-500">No assets.</li>
            ) : (
              assetRows.map((a, idx) => (
                <li key={a.id} className="space-y-2 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs text-zinc-500">{a.id}</span>
                    <button
                      type="button"
                      disabled={pending || previewFileSet.has(a.id)}
                      onClick={() => archiveFile(a.id, "asset")}
                      className={BTN_GHOST}
                    >
                      Delete
                    </button>
                  </div>
                  <label className="block text-xs font-medium text-zinc-600">
                    Name
                    <input
                      value={a.name}
                      onChange={(e) => {
                        const v = e.target.value;
                        setAssetRows((rows) => rows.map((x, i) => (i === idx ? { ...x, name: v } : x)));
                      }}
                      disabled={pending}
                      className={`mt-1 block w-full ${FIELD.control}`}
                    />
                  </label>
                  <label className="block text-xs font-medium text-zinc-600">
                    storage_uri
                    <input
                      value={a.storage_uri}
                      onChange={(e) => {
                        const v = e.target.value;
                        setAssetRows((rows) => rows.map((x, i) => (i === idx ? { ...x, storage_uri: v } : x)));
                      }}
                      disabled={pending}
                      className={`mt-1 block w-full ${FIELD.control}`}
                    />
                  </label>
                  <label className="block text-xs font-medium text-zinc-600">
                    byte_size
                    <input
                      type="number"
                      value={a.byte_size ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const n = raw === "" ? null : Math.floor(Number(raw));
                        setAssetRows((rows) => rows.map((x, i) => (i === idx ? { ...x, byte_size: n } : x)));
                      }}
                      disabled={pending}
                      className={`mt-1 block w-full ${FIELD.control}`}
                    />
                  </label>
                  <label className="block text-xs font-medium text-zinc-600">
                    step_ordinal (blank = skill-wide)
                    <input
                      type="number"
                      value={a.step_ordinal ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const n = raw === "" ? null : Math.floor(Number(raw));
                        setAssetRows((rows) => rows.map((x, i) => (i === idx ? { ...x, step_ordinal: n } : x)));
                      }}
                      disabled={pending}
                      className={`mt-1 block w-full ${FIELD.control}`}
                    />
                  </label>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
