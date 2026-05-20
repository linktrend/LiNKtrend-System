"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { saveAgentRuntimeSettingsAction } from "@/app/(shell)/workers/[id]/runtime-settings-actions";
import {
  APPROVED_MODEL_CATALOG,
  MODEL_CATEGORY_LABELS,
  serialiseRuntimeSettings,
  type AgentRuntimeSettings,
  type ModelCategoryId,
} from "@/lib/agent-runtime-settings";
import { BUTTON, FIELD } from "@/lib/ui-standards";

const PRIMARY_MODEL_ROWS: ModelCategoryId[] = ["heartbeat", "context_lt_100k", "context_gt_100k", "execution"];

function jsonSig(s: AgentRuntimeSettings): string {
  return JSON.stringify(serialiseRuntimeSettings(s));
}

function ModelSelect(props: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const cloud = APPROVED_MODEL_CATALOG.filter((m) => m.kind === "cloud");
  const local = APPROVED_MODEL_CATALOG.filter((m) => m.kind === "local");
  return (
    <select
      disabled={props.disabled}
      className="max-w-[14rem] rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 shadow-sm disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 sm:max-w-[15rem]"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
    >
      <optgroup label="Cloud (API cost)">
        {cloud.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </optgroup>
      <optgroup label="Local (no API cost)">
        {local.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </optgroup>
    </select>
  );
}

function NullableModelSelect(props: {
  value: string | null;
  onChange: (v: string | null) => void;
  disabled?: boolean;
  cloudOnly?: boolean;
  localOnly?: boolean;
}) {
  const cloud = APPROVED_MODEL_CATALOG.filter((m) => m.kind === "cloud");
  const local = APPROVED_MODEL_CATALOG.filter((m) => m.kind === "local");
  const groups = props.cloudOnly
    ? [{ label: "Cloud (API cost)", items: cloud }]
    : props.localOnly
      ? [{ label: "Local (no API cost)", items: local }]
      : [
          { label: "Cloud (API cost)", items: cloud },
          { label: "Local (no API cost)", items: local },
        ];
  return (
    <select
      disabled={props.disabled}
      className="max-w-[14rem] rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 shadow-sm disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 sm:max-w-[15rem]"
      value={props.value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        props.onChange(v === "" ? null : v);
      }}
    >
      <option value="">None</option>
      {groups.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.items.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function CategoryPill(props: { label: string }) {
  return (
    <span className="inline-flex shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
      {props.label}
    </span>
  );
}

function KindBadge(props: { modelId: string }) {
  const m = APPROVED_MODEL_CATALOG.find((x) => x.id === props.modelId);
  if (!m) {
    return (
      <span className="shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        Unknown
      </span>
    );
  }
  const cloud = m.kind === "cloud";
  return (
    <span
      className={
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium " +
        (cloud
          ? "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200"
          : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200")
      }
    >
      {cloud ? "Cloud" : "Local"}
    </span>
  );
}

export function AgentModelsForm(props: { agentId: string; initial: AgentRuntimeSettings; readonly?: boolean }) {
  const router = useRouter();
  const serverSig = jsonSig(props.initial);
  const [state, setState] = useState(props.initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setState(props.initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-apply when server payload (signature) changes
  }, [serverSig]);

  const dirty = jsonSig(state) !== serverSig;

  const setPrimary = (key: ModelCategoryId, v: string) => {
    setState((s) => ({
      ...s,
      models: { ...s.models, primary: { ...s.models.primary, [key]: v } },
    }));
  };

  const setModels = (patch: Partial<AgentRuntimeSettings["models"]>) => {
    setState((s) => ({ ...s, models: { ...s.models, ...patch } }));
  };

  const setSpend = (patch: Partial<AgentRuntimeSettings["cloudSpend"]>) => {
    setState((s) => ({ ...s, cloudSpend: { ...s.cloudSpend, ...patch } }));
  };

  const setBehavior = (patch: Partial<AgentRuntimeSettings["behavior"]>) => {
    setState((s) => ({ ...s, behavior: { ...s.behavior, ...patch } }));
  };

  const onSave = () => {
    if (props.readonly) return;
    setMessage(null);
    startTransition(async () => {
      const res = await saveAgentRuntimeSettingsAction(props.agentId, serialiseRuntimeSettings(state));
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      setMessage("Saved.");
      router.refresh();
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Model selection for the LiNKbot and token usage limits.
      </p>

      {dirty && !props.readonly ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          You have unsaved changes. Select <span className="font-medium">Save models &amp; limits</span> before leaving
          this tab or your edits will be lost.
        </p>
      ) : null}

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {PRIMARY_MODEL_ROWS.map((key) => (
          <li key={key} className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <CategoryPill label={MODEL_CATEGORY_LABELS[key]} />
              <KindBadge modelId={state.models.primary[key]} />
            </div>
            <ModelSelect
              disabled={props.readonly || pending}
              value={state.models.primary[key]}
              onChange={(v) => setPrimary(key, v)}
            />
          </li>
        ))}
        <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <CategoryPill label="Fallback (Cloud)" />
            {state.models.fallbackOnline ? (
              <KindBadge modelId={state.models.fallbackOnline} />
            ) : (
              <span className="text-[10px] font-medium text-zinc-500">None</span>
            )}
          </div>
          <NullableModelSelect
            disabled={props.readonly || pending}
            cloudOnly
            value={state.models.fallbackOnline}
            onChange={(v) => setModels({ fallbackOnline: v })}
          />
        </li>
        <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <CategoryPill label="Fallback (Local)" />
            {state.models.fallbackLocal ? (
              <KindBadge modelId={state.models.fallbackLocal} />
            ) : (
              <span className="text-[10px] font-medium text-zinc-500">None</span>
            )}
          </div>
          <NullableModelSelect
            disabled={props.readonly || pending}
            localOnly
            value={state.models.fallbackLocal}
            onChange={(v) => setModels({ fallbackLocal: v })}
          />
        </li>
      </ul>

      <fieldset className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <legend className="px-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Cloud token spend</legend>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Alert when usage crosses the threshold; hard cap stops further cloud calls so the worker can use local models.
        </p>
        <label className="flex max-w-xs flex-col gap-1">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Alert threshold (tokens)</span>
          <input
            type="number"
            min={0}
            step={1}
            disabled={props.readonly || pending}
            placeholder="e.g. 500000"
            className={FIELD.controlCompact}
            value={state.cloudSpend.tokenAlertThreshold ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") {
                setSpend({ tokenAlertThreshold: null });
                return;
              }
              const n = Number(v);
              setSpend({ tokenAlertThreshold: Number.isFinite(n) && n >= 0 ? Math.floor(n) : null });
            }}
          />
        </label>
        <label className="flex max-w-xs flex-col gap-1">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Hard cap (tokens)</span>
          <input
            type="number"
            min={0}
            step={1}
            disabled={props.readonly || pending}
            placeholder="e.g. 2000000"
            className={FIELD.controlCompact}
            value={state.cloudSpend.tokenHardCap ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") {
                setSpend({ tokenHardCap: null });
                return;
              }
              const n = Number(v);
              setSpend({ tokenHardCap: Number.isFinite(n) && n >= 0 ? Math.floor(n) : null });
            }}
          />
        </label>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <legend className="px-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Resilience behaviour</legend>
        <label className="flex items-start gap-2 text-sm text-zinc-800 dark:text-zinc-200">
          <input
            type="checkbox"
            disabled={props.readonly || pending}
            checked={state.behavior.autoFallbackOnlineOnPrimaryError}
            onChange={(e) => setBehavior({ autoFallbackOnlineOnPrimaryError: e.target.checked })}
            className="mt-1"
          />
          <span>Automatically try the fallback online model when the primary cloud model errors.</span>
        </label>
        <label className="flex items-start gap-2 text-sm text-zinc-800 dark:text-zinc-200">
          <input
            type="checkbox"
            disabled={props.readonly || pending}
            checked={state.behavior.forceLocalOnHardCap}
            onChange={(e) => setBehavior({ forceLocalOnHardCap: e.target.checked })}
            className="mt-1"
          />
          <span>When the cloud token hard cap is reached, stop cloud models and use local fallbacks only.</span>
        </label>
        <label className="flex items-start gap-2 text-sm text-zinc-800 dark:text-zinc-200">
          <input
            type="checkbox"
            disabled={props.readonly || pending}
            checked={state.behavior.cascadeToLocalOnCloudFailure}
            onChange={(e) => setBehavior({ cascadeToLocalOnCloudFailure: e.target.checked })}
            className="mt-1"
          />
          <span>If all cloud options fail or are exhausted, cascade to the local fallback model.</span>
        </label>
      </fieldset>

      {message ? (
        <p className={message === "Saved." ? "text-sm text-emerald-700 dark:text-emerald-400" : "text-sm text-red-600"}>
          {message}
        </p>
      ) : null}

      {!props.readonly ? (
        <button type="button" disabled={pending || !dirty} onClick={onSave} className={BUTTON.primaryRow}>
          {pending ? "Saving…" : "Save models & limits"}
        </button>
      ) : (
        <p className="text-xs text-zinc-400">
          Demo state for <span className="font-mono">{props.agentId}</span> — not persisted.
        </p>
      )}
    </div>
  );
}
