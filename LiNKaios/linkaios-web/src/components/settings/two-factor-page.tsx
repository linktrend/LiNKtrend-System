"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, Shield, ShieldCheck, ShieldOff, Smartphone } from "lucide-react";

import { TitledCardHeader } from "@/components/titled-card-header";
import {
  emptyTwoFactorState,
  EVENT_2FA_CHANGED,
  generateBackupCodes,
  readTwoFactorState,
  TWO_FACTOR_COPY,
  writeTwoFactorState,
  type TwoFactorState,
} from "@/lib/two-factor-copy";
import { BUTTON, FIELD } from "@/lib/ui-standards";

function StatusBadge(props: { enabled: boolean }) {
  const tone = props.enabled
    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    : "bg-red-500/15 text-red-600 dark:text-red-300";
  return (
    <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {props.enabled ? "Enabled" : "Disabled"}
    </span>
  );
}

function BackupCodesList(props: { codes: string[]; onCopy: () => void }) {
  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-amber-950 dark:text-amber-100">{TWO_FACTOR_COPY.backupTitle}</p>
        <button type="button" className={BUTTON.secondaryCompact} onClick={props.onCopy}>
          <Copy className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Copy all
        </button>
      </div>
      <p className="mt-2 text-xs text-amber-900/90 dark:text-amber-200/90">{TWO_FACTOR_COPY.backupBody}</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {props.codes.map((code) => (
          <li key={code} className="rounded-md bg-white/80 px-3 py-2 font-mono text-sm text-zinc-900 dark:bg-zinc-950/60 dark:text-zinc-100">
            {code}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SetupPanel(props: { onEnabled: (state: TwoFactorState) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function verify() {
    if (!/^\d{6}$/.test(code)) {
      setError("Enter a 6-digit code from your authenticator app.");
      return;
    }
    props.onEnabled({
      enabled: true,
      method: "totp",
      verifiedAt: new Date().toISOString(),
      backupCodes: generateBackupCodes(),
    });
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <TitledCardHeader icon={Smartphone} title={TWO_FACTOR_COPY.setupTitle} description="Use a time-based one-time password (TOTP) app." />
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
        {TWO_FACTOR_COPY.setupSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
          <span className="px-2 text-center text-xs text-zinc-500">QR preview</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className={FIELD.label}>{TWO_FACTOR_COPY.demoQrLabel}</p>
          <p className="mt-2 font-mono text-lg tracking-widest text-zinc-900 dark:text-zinc-100">{TWO_FACTOR_COPY.demoSecret}</p>
          <label className="mt-4 block">
            <span className={FIELD.label}>Verification code</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError(null);
              }}
              className={`mt-1 ${FIELD.control} max-w-[12rem] font-mono tracking-widest`}
              placeholder="000000"
            />
          </label>
          <p className="mt-2 text-xs text-zinc-500">{TWO_FACTOR_COPY.verifyHint}</p>
          {error ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <button type="button" className={`${BUTTON.primaryCompact} mt-4`} onClick={verify}>
            Enable 2FA
          </button>
        </div>
      </div>
    </section>
  );
}

function EnabledPanel(props: {
  state: TwoFactorState;
  onRegenerate: () => void;
  onDisable: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <TitledCardHeader
          icon={ShieldCheck}
          title="Authenticator app"
          description="Active method — TOTP codes are required after your primary sign-in step."
          action={<StatusBadge enabled />}
        />
        {props.state.verifiedAt ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Enabled {new Date(props.state.verifiedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
          </p>
        ) : null}
      </section>

      {props.state.backupCodes.length > 0 ? (
        <BackupCodesList
          codes={props.state.backupCodes}
          onCopy={() => {
            void navigator.clipboard.writeText(props.state.backupCodes.join("\n"));
          }}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" className={BUTTON.secondaryCompact} onClick={props.onRegenerate}>
          Regenerate backup codes
        </button>
        <button type="button" className={BUTTON.rejectCompact} onClick={props.onDisable}>
          Turn off 2FA
        </button>
      </div>
    </div>
  );
}

export function TwoFactorPage() {
  const [state, setState] = useState<TwoFactorState>(emptyTwoFactorState);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setState(readTwoFactorState());
    sync();
    window.addEventListener(EVENT_2FA_CHANGED, sync);
    return () => window.removeEventListener(EVENT_2FA_CHANGED, sync);
  }, []);

  function persist(next: TwoFactorState, message?: string) {
    writeTwoFactorState(next);
    setState(next);
    if (message) {
      setFlash(message);
      window.setTimeout(() => setFlash(null), 5000);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <TitledCardHeader
            icon={state.enabled ? ShieldCheck : ShieldOff}
            title={state.enabled ? TWO_FACTOR_COPY.enabledTitle : TWO_FACTOR_COPY.disabledTitle}
            description={state.enabled ? TWO_FACTOR_COPY.enabledBody : TWO_FACTOR_COPY.disabledBody}
          />
          <StatusBadge enabled={state.enabled} />
        </div>
      </section>

      {flash ? (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
          {flash}
        </p>
      ) : null}

      {state.enabled ? (
        <EnabledPanel
          state={state}
          onRegenerate={() => {
            persist({ ...state, backupCodes: generateBackupCodes() }, "New backup codes generated.");
          }}
          onDisable={() => {
            if (!window.confirm(TWO_FACTOR_COPY.disableConfirm)) return;
            persist(emptyTwoFactorState(), TWO_FACTOR_COPY.disableSuccess);
          }}
        />
      ) : (
        <SetupPanel onEnabled={(next) => persist(next, TWO_FACTOR_COPY.enableSuccess)} />
      )}

      <section className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex gap-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            2FA is separate from your primary sign-in method. Configure password, magic link, or passkey under{" "}
            <Link href="/settings/login-credentials" className="font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200">
              Login credentials
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
