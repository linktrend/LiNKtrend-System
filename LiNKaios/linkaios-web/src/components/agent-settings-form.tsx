"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Files, Fingerprint, User } from "lucide-react";

import { saveAgentRuntimeSettingsAction } from "@/app/(shell)/workers/[id]/runtime-settings-actions";
import { CompanyEditableCard } from "@/components/company-editable-card";
import { TitledCardHeader } from "@/components/titled-card-header";
import { serialiseRuntimeSettings, type AgentRuntimeSettings } from "@/lib/agent-runtime-settings";
import { isDemoAgentId } from "@/lib/ui-mocks/entities";
import { demoBrainAgentSlugForId, resolveDemoBrainAgentId } from "@/lib/ui-mocks/linkbrain-demo-agents";
import { BUTTON, CARD, FIELD, formatCardTitle } from "@/lib/ui-standards";

function jsonSig(s: AgentRuntimeSettings): string {
  return JSON.stringify(serialiseRuntimeSettings(s));
}

function memoryAgentHref(agentId: string): string {
  const param = isDemoAgentId(agentId)
    ? demoBrainAgentSlugForId(resolveDemoBrainAgentId(agentId) ?? agentId) ?? agentId
    : agentId;
  return `/memory?tab=agent&agent=${encodeURIComponent(param)}`;
}

export function AgentSettingsForm(props: {
  agentId: string;
  initial: AgentRuntimeSettings;
  readonly?: boolean;
}) {
  const router = useRouter();
  const initialRef = useRef(props.initial);
  const [state, setState] = useState(props.initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const serverSig = jsonSig(props.initial);
  useEffect(() => {
    initialRef.current = props.initial;
    setState(props.initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-apply when server payload (signature) changes
  }, [serverSig]);

  const setProfile = (patch: Partial<AgentRuntimeSettings["linkaiosProfile"]>) => {
    setState((s) => ({ ...s, linkaiosProfile: { ...s.linkaiosProfile, ...patch } }));
  };

  const persist = () => {
    if (props.readonly) {
      setMessage("Saved locally — demo LiNKbot settings are not persisted.");
      return Promise.resolve();
    }
    setMessage(null);
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        const res = await saveAgentRuntimeSettingsAction(props.agentId, serialiseRuntimeSettings(state));
        if (!res.ok) {
          setMessage(res.error);
          reject(new Error(res.error));
          return;
        }
        setMessage("Saved.");
        router.refresh();
        resolve();
      });
    });
  };

  const onResetProfile = () => {
    setState((s) => ({
      ...s,
      linkaiosProfile: { ...initialRef.current.linkaiosProfile },
    }));
    setMessage(null);
  };

  const profile = state.linkaiosProfile;
  const brainHref = memoryAgentHref(props.agentId);

  return (
    <div className="space-y-4">
      <CompanyEditableCard
        icon={Fingerprint}
        title="LiNKbot ID"
        description="Stable identifier used in sessions, LiNKbrain partitions, and capability leases."
        editContent={undefined}
      >
        <p className="font-mono text-sm text-zinc-800 dark:text-zinc-200">{props.agentId}</p>
      </CompanyEditableCard>

      <CompanyEditableCard
        icon={User}
        title="Organisation profile"
        description="How this LiNKbot appears in the directory: job title and a short description."
        editContent={
          <div className="space-y-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Position / title</span>
              <input
                type="text"
                disabled={pending}
                value={profile.title}
                onChange={(e) => setProfile({ title: e.target.value })}
                placeholder="e.g. Principal analyst"
                className={FIELD.control}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Description</span>
              <textarea
                disabled={pending}
                value={profile.description}
                onChange={(e) => setProfile({ description: e.target.value })}
                rows={3}
                placeholder="What this LiNKbot is responsible for."
                className={FIELD.control}
              />
            </label>
            {!props.readonly ? (
              <button type="button" disabled={pending} onClick={onResetProfile} className={BUTTON.secondaryCompact}>
                Reset profile fields
              </button>
            ) : null}
          </div>
        }
        onSave={persist}
      >
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Position / title</dt>
            <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{profile.title || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Description</dt>
            <dd className="mt-1 text-zinc-700 dark:text-zinc-300">{profile.description || "—"}</dd>
          </div>
        </dl>
      </CompanyEditableCard>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <TitledCardHeader
          icon={Files}
          title={formatCardTitle("Files")}
          description="Persona layers (base persona, soul, identity) and agent-scoped journals live in LiNKbrain under this LiNKbot's partition. Edit proposals publish through Inbox approval."
          titleClassName={CARD.titleMd}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={brainHref} className={BUTTON.secondaryCompact}>
            Open in LiNKbrain
          </Link>
        </div>
      </section>

      {message ? (
        <p
          role="status"
          className={
            message === "Saved." || message.startsWith("Saved locally")
              ? "text-sm text-emerald-700 dark:text-emerald-400"
              : "text-sm text-red-600"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
