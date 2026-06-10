"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";

import { saveAgentRuntimeSettingsAction } from "@/app/(shell)/workers/[id]/runtime-settings-actions";
import { TitledCardHeader } from "@/components/titled-card-header";
import {
  APPROVED_MODEL_CATALOG,
  MODEL_CATEGORY_LABELS,
  serialiseRuntimeSettings,
  type AgentRuntimeSettings,
  type ModelCategoryId,
} from "@/lib/agent-runtime-settings";
import { InsetSelect } from "@/components/forms";
import { BUTTON, CARD, FIELD, formatCardTitle, TYPE, WORKER_DETAIL } from "@/lib/ui-standards";

const PRIMARY_MODEL_ROWS: ModelCategoryId[] = ["heartbeat", "context_lt_100k", "context_gt_100k", "execution"];

/** Fixed width for every model picker — wrapper ensures fallback rows match primary rows. */
const MODEL_SELECT_WRAP = "w-[15rem] max-w-full shrink-0";

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
    <div className={MODEL_SELECT_WRAP}>
      <InsetSelect
        fullWidth
        disabled={props.disabled}
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
    </InsetSelect>
    </div>
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
    <div className={MODEL_SELECT_WRAP}>
      <InsetSelect
        fullWidth
        disabled={props.disabled}
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
    </InsetSelect>
    </div>
  );
}

function CategoryLabel(props: { label: string }) {
  return <span className={`min-w-0 sm:w-40 sm:shrink-0 ${WORKER_DETAIL.fieldLabel}`}>{props.label}</span>;
}

function KindBadge(props: { modelId: string }) {
  const m = APPROVED_MODEL_CATALOG.find((x) => x.id === props.modelId);
  if (!m) {
    return (
      <span className={`shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 ${TYPE.caption} font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300`}>
        Unknown
      </span>
    );
  }
  const cloud = m.kind === "cloud";
  return (
    <span
      className={
        `shrink-0 rounded-full px-2 py-0.5 ${TYPE.caption} font-medium ` +
        (cloud
          ? "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200"
          : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200")
      }
    >
      {cloud ? "Cloud" : "Local"}
    </span>
  );
}

function ModelKindSlot(props: { modelId: string | null }) {
  return (
    <span className="inline-flex w-14 shrink-0 justify-end">
      {props.modelId ? (
        <KindBadge modelId={props.modelId} />
      ) : (
        <span className={`${TYPE.caption} font-medium text-zinc-500`}>None</span>
      )}
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
    <div className="space-y-6">
      <p className={WORKER_DETAIL.bodyMuted}>Model selection for the LiNKbot and token usage limits.</p>

      {dirty && !props.readonly ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          You have unsaved changes. Select <span className="font-medium">Save Models &amp; Limits</span> before leaving
          this tab or your edits will be lost.
        </p>
      ) : null}

      {!props.readonly ? (
        <p className={WORKER_DETAIL.metaNote}>
          Live registry — changes persist to <span className="font-mono">linkaios.agents.runtime_settings</span>.
        </p>
      ) : null}

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {PRIMARY_MODEL_ROWS.map((key) => (
          <li key={key} className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:gap-4">
            <CategoryLabel label={MODEL_CATEGORY_LABELS[key]} />
            <div className="flex min-w-0 items-center gap-2 sm:ml-auto">
              <ModelKindSlot modelId={state.models.primary[key]} />
              <ModelSelect
                disabled={props.readonly || pending}
                value={state.models.primary[key]}
                onChange={(v) => setPrimary(key, v)}
              />
            </div>
          </li>
        ))}
        <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
          <CategoryLabel label="Fallback (Cloud)" />
          <div className="flex min-w-0 items-center gap-2 sm:ml-auto">
            <ModelKindSlot modelId={state.models.fallbackOnline} />
            <NullableModelSelect
              disabled={props.readonly || pending}
              cloudOnly
              value={state.models.fallbackOnline}
              onChange={(v) => setModels({ fallbackOnline: v })}
            />
          </div>
        </li>
        <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
          <CategoryLabel label="Fallback (Local)" />
          <div className="flex min-w-0 items-center gap-2 sm:ml-auto">
            <ModelKindSlot modelId={state.models.fallbackLocal} />
            <NullableModelSelect
              disabled={props.readonly || pending}
              localOnly
              value={state.models.fallbackLocal}
              onChange={(v) => setModels({ fallbackLocal: v })}
            />
          </div>
        </li>
      </ul>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <TitledCardHeader
          icon={CreditCard}
          title={formatCardTitle("Cloud token spend")}
          description="Alert when usage crosses the threshold; hard cap stops further cloud calls so the worker can use local models."
          titleClassName={CARD.titleMd}
        />
        <div className="mt-4 space-y-3">
          <label className="flex max-w-xs flex-col gap-1">
            <span className={WORKER_DETAIL.fieldLabel}>Alert Threshold (Tokens)</span>
            <input
              type="number"
              min={0}
              step={10000}
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
            <span className={WORKER_DETAIL.fieldLabel}>Hard Cap (Tokens)</span>
            <input
              type="number"
              min={0}
              step={10000}
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
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <TitledCardHeader
          icon={ShieldCheck}
          title={formatCardTitle("Resilience behaviour")}
          titleClassName={CARD.titleMd}
        />
        <div className="mt-4 space-y-3">
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
        </div>
      </section>

      {message ? (
        <p className={message === "Saved." ? "text-sm text-emerald-700 dark:text-emerald-400" : "text-sm text-red-600"}>
          {message}
        </p>
      ) : null}

      {!props.readonly ? (
        <div className="flex justify-end">
          <button type="button" disabled={pending || !dirty} onClick={onSave} className={BUTTON.primaryRow}>
            {pending ? "Saving…" : "Save Models & Limits"}
          </button>
        </div>
      ) : (
        <p className={WORKER_DETAIL.metaNote}>
          Demo state for <span className="font-mono">{props.agentId}</span> — not persisted.
        </p>
      )}
    </div>
  );
}
