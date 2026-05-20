"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  approveTool,
  archiveTool,
  deleteTool,
  restoreTool,
  updateToolDetails,
  updateToolImplementation,
  updateToolPublishFlags,
  type ToolActionResult,
} from "@/app/(shell)/skills/tools/actions";
import { useRegisterBreadcrumbLabel } from "@/components/breadcrumb-label-registry";
import { CatalogueBoolToggle, LifecyclePill } from "@/components/catalog-ui";
import { readToolAdminFlags, TOOL_TYPE_HELP, TOOL_TYPE_LABELS } from "@/lib/tools-admin";
import { BUTTON, FIELD } from "@/lib/ui-standards";
import type { ToolRecord, ToolStatus } from "@linktrend/shared-types";

const BTN_PRIMARY = BUTTON.primaryRow;
const BTN_SECONDARY = BUTTON.secondaryRow;
const BTN_GHOST = BUTTON.ghostRow;
const BTN_DANGER = BUTTON.dangerRow;
const BTN_APPROVE = BUTTON.approveRow;

function runAction(
  startTransition: (fn: () => void) => void,
  fn: () => Promise<ToolActionResult>,
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

export type DeclaringSkillRow = { id: string; name: string; version: number };

export function ToolWorkspace(props: {
  toolId: string;
  dataRevision: string;
  record: ToolRecord;
  declaringSkills?: DeclaringSkillRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const flags = useMemo(() => readToolAdminFlags(props.record), [props.record]);

  useRegisterBreadcrumbLabel(props.toolId, props.record.name);

  const [detEditing, setDetEditing] = useState(false);
  const [catDraft, setCatDraft] = useState(props.record.category);
  const [descDraft, setDescDraft] = useState(props.record.description);

  const [implEditing, setImplEditing] = useState(false);
  const [implDraft, setImplDraft] = useState(() => JSON.stringify(props.record.implementation ?? {}, null, 2));

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 3200);
    return () => window.clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    setCatDraft(props.record.category);
    setDescDraft(props.record.description);
    setImplDraft(JSON.stringify(props.record.implementation ?? {}, null, 2));
    setDetEditing(false);
    setImplEditing(false);
  }, [props.dataRevision, props.toolId, props.record]);

  const refresh = () => router.refresh();
  const declaring = props.declaringSkills ?? [];
  const status = props.record.status as ToolStatus;

  const runDeleteTool = () => {
    if (!window.confirm("Permanently delete this draft tool? This cannot be undone.")) return;
    startTransition(() => {
      void (async () => {
        setErr(null);
        const r = await deleteTool(props.toolId);
        if (r.ok) {
          router.push("/skills/tools");
          router.refresh();
        } else {
          setErr(r.error ?? "Delete failed.");
        }
      })();
    });
  };

  const saveDetails = () => {
    runAction(
      startTransition,
      () => updateToolDetails(props.toolId, { category: catDraft, description: descDraft }),
      () => {
        setDetEditing(false);
        refresh();
      },
      setErr,
      setFlash,
    );
  };

  const saveImpl = () => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(implDraft) as Record<string, unknown>;
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        setErr("Implementation must be a JSON object.");
        return;
      }
    } catch {
      setErr("Invalid JSON.");
      return;
    }
    runAction(
      startTransition,
      () => updateToolImplementation(props.toolId, parsed),
      () => {
        setImplEditing(false);
        refresh();
      },
      setErr,
      setFlash,
    );
  };

  const applyFlags = (published: boolean, runtimeEnabled: boolean) => {
    runAction(
      startTransition,
      () => updateToolPublishFlags(props.toolId, published, runtimeEnabled),
      refresh,
      setErr,
      setFlash,
    );
  };

  return (
    <div className="space-y-10">
      <div>
        <Link href="/skills/tools" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          ← Tools catalogue
        </Link>
      </div>
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{props.record.name}</h1>
          <LifecyclePill status={status} />
        </div>
        {props.record.description?.trim() ? (
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{props.record.description}</p>
        ) : null}
        <p className="max-w-3xl text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Technical type:</span>{" "}
          {TOOL_TYPE_LABELS[props.record.tool_type] ?? props.record.tool_type}
          {" — "}
          {TOOL_TYPE_HELP[props.record.tool_type] ?? "Custom capability registered in LiNKaios."}
        </p>
        <dl className="grid max-w-3xl gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Category</dt>
            <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100">{props.record.category}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Version</dt>
            <dd className="mt-0.5 font-mono text-zinc-800 dark:text-zinc-200">{props.record.version}</dd>
          </div>
        </dl>
      </header>

      {(flash || err) && (
        <div className="flex flex-wrap gap-4 text-sm">
          {flash ? <span className="text-emerald-700">{flash}</span> : null}
          {err ? <span className="text-red-700">{err}</span> : null}
        </div>
      )}

      <section className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Actions</h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Approve when implementation is ready, archive when retired, or restore from archive.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {status === "draft" ? (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  runAction(startTransition, () => approveTool(props.toolId), refresh, setErr, setFlash, "Tool approved.")
                }
                className={BTN_APPROVE}
              >
                Approve
              </button>
              <button type="button" disabled={pending} onClick={runDeleteTool} className={BTN_DANGER}>
                Delete draft
              </button>
            </>
          ) : null}
          {status === "approved" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                runAction(startTransition, () => archiveTool(props.toolId), refresh, setErr, setFlash, "Tool archived.")
              }
              className={BTN_DANGER}
            >
              Archive
            </button>
          ) : null}
          {status === "archived" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                runAction(startTransition, () => restoreTool(props.toolId), refresh, setErr, setFlash, "Tool restored.")
              }
              className={BTN_PRIMARY}
            >
              Restore
            </button>
          ) : null}
        </div>
      </section>

      {status === "approved" ? (
        <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Availability &amp; runtime</h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">Turn on availability before enabling runtime (same pattern as skills).</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
              <CatalogueBoolToggle
                on={flags.published}
                disabled={pending}
                onToggle={(next) => applyFlags(next, next ? flags.runtimeEnabled : false)}
                ariaLabel="Available in governed catalogue"
              />
              <span>Available</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
              <CatalogueBoolToggle
                on={flags.runtimeEnabled}
                disabled={pending || !flags.published}
                onToggle={(next) => applyFlags(flags.published, next)}
                ariaLabel="Runtime enabled"
              />
              <span>Runtime enabled</span>
            </label>
          </div>
        </section>
      ) : null}

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-900">Details</h2>
          {!detEditing ? (
            <button
              type="button"
              disabled={pending || status === "archived"}
              onClick={() => {
                setCatDraft(props.record.category);
                setDescDraft(props.record.description);
                setDetEditing(true);
              }}
              className={BTN_GHOST}
            >
              Edit
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={pending} onClick={saveDetails} className={BTN_PRIMARY}>
                Save
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setCatDraft(props.record.category);
                  setDescDraft(props.record.description);
                  setDetEditing(false);
                }}
                className={BTN_SECONDARY}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {detEditing ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-800">
              Category
              <input
                value={catDraft}
                onChange={(e) => setCatDraft(e.target.value)}
                disabled={pending}
                className={`mt-1 ${FIELD.control}`}
              />
            </label>
            <label className="block text-sm font-medium text-zinc-800">
              Description
              <textarea
                value={descDraft}
                onChange={(e) => setDescDraft(e.target.value)}
                disabled={pending}
                rows={5}
                className="mt-1 w-full max-w-3xl rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800">
            <div>
              <span className="text-xs font-medium uppercase text-zinc-500">Category</span>
              <p className="mt-0.5">{props.record.category}</p>
            </div>
            <div className="mt-3">
              <span className="text-xs font-medium uppercase text-zinc-500">Description</span>
              <p className="mt-0.5 text-zinc-700">{props.record.description}</p>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-900">Implementation</h2>
          {!implEditing ? (
            <button
              type="button"
              disabled={pending || status === "archived"}
              onClick={() => {
                setImplDraft(JSON.stringify(props.record.implementation ?? {}, null, 2));
                setImplEditing(true);
              }}
              className={BTN_GHOST}
            >
              Edit
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={pending} onClick={saveImpl} className={BTN_PRIMARY}>
                Save
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setImplDraft(JSON.stringify(props.record.implementation ?? {}, null, 2));
                  setImplEditing(false);
                }}
                className={BTN_SECONDARY}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {implEditing ? (
          <textarea
            value={implDraft}
            onChange={(e) => setImplDraft(e.target.value)}
            disabled={pending}
            rows={16}
            spellCheck={false}
            className={`${FIELD.mono} text-xs text-zinc-900 dark:text-zinc-100`}
          />
        ) : (
          <pre className="max-w-3xl overflow-x-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white p-4 font-mono text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            {JSON.stringify(props.record.implementation ?? {}, null, 2)}
          </pre>
        )}
      </section>

      <section className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">LiNKskills using this tool</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Approved skills that list this tool in their allowed tools metadata.
        </p>
        {declaring.length === 0 ? (
          <p className="text-sm text-zinc-500">No approved skills declare this tool.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-100 text-sm dark:divide-zinc-800 dark:border-zinc-800">
            {declaring.map((s) => (
              <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2">
                <Link href={`/skills/${s.id}`} className="text-sm font-medium text-violet-800 hover:underline dark:text-violet-300">
                  {s.name}
                </Link>
                <span className="text-xs text-zinc-500">v{s.version}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
