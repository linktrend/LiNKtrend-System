"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Check, Fingerprint, KeyRound, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { TitledCardHeader, CardBodyInset } from "@/components/titled-card-header";
import { StatusPill } from "@/components/ui/status-pill";
import {
  LOGIN_CREDENTIALS_COPY,
  LOGIN_METHODS,
  loginMethodHref,
  parseLoginMethod,
  type LoginMethodId,
} from "@/lib/login-credentials-copy";
import { BUTTON, FIELD, SUMMARY_METRIC_CARD, formatUiLabel } from "@/lib/ui-standards";

const STORAGE_METHOD_KEY = "linkaios-login-method";
const STORAGE_PASSKEYS_KEY = "linkaios-passkeys-v1";

type PasskeyRecord = {
  id: string;
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
};

const METHOD_ICONS: Record<LoginMethodId, LucideIcon> = {
  password: KeyRound,
  "magic-link": Mail,
  passkey: Fingerprint,
};

function readStoredMethod(): LoginMethodId {
  if (typeof window === "undefined") return "password";
  const raw = window.localStorage.getItem(STORAGE_METHOD_KEY);
  return parseLoginMethod(raw);
}

function writeStoredMethod(method: LoginMethodId) {
  window.localStorage.setItem(STORAGE_METHOD_KEY, method);
}

function readPasskeys(): PasskeyRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_PASSKEYS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PasskeyRecord[];
  } catch {
    return [];
  }
}

function writePasskeys(keys: PasskeyRecord[]) {
  window.localStorage.setItem(STORAGE_PASSKEYS_KEY, JSON.stringify(keys));
}

const METHOD_STATUS_LABELS = ["Active", "Inactive"] as const;

const PASSWORD_INPUT_CLASS =
  "w-full max-w-xs rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100";

type PasswordRequirement = {
  id: string;
  label: string;
  met: boolean;
};

function passwordRequirements(password: string): PasswordRequirement[] {
  return [
    { id: "length", label: "At least 8 characters", met: password.length >= 8 },
    { id: "lower", label: "One lowercase letter", met: /[a-z]/.test(password) },
    { id: "upper", label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { id: "number", label: "One number", met: /\d/.test(password) },
  ];
}

function confirmRequirements(password: string, confirm: string): PasswordRequirement[] {
  return [
    {
      id: "match",
      label: "Passwords match",
      met: confirm.length > 0 && password === confirm,
    },
  ];
}

function RequirementHint(props: { items: PasswordRequirement[] }) {
  return (
    <ul className="space-y-1 text-xs leading-5" aria-live="polite">
      {props.items.map((item) => (
        <li
          key={item.id}
          className={
            item.met
              ? "flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300"
              : "flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400"
          }
        >
          <Check className={`h-3.5 w-3.5 shrink-0 ${item.met ? "opacity-100" : "opacity-30"}`} aria-hidden />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function PasswordFieldRow(props: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  hint?: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-x-4 gap-y-2 sm:grid-cols-[11rem_minmax(0,16rem)_minmax(0,1fr)]">
      <label htmlFor={props.id} className={`sm:pt-2 ${FIELD.label}`}>
        {props.label}
      </label>
      <input
        id={props.id}
        type="password"
        autoComplete={props.autoComplete}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className={PASSWORD_INPUT_CLASS}
      />
      {props.hint ? <div className="sm:pt-1.5">{props.hint}</div> : <div className="hidden sm:block" aria-hidden />}
    </div>
  );
}

function MethodPicker(props: {
  activeMethod: LoginMethodId;
  viewMethod: LoginMethodId;
  onView: (method: LoginMethodId) => void;
  onActivate: (method: LoginMethodId) => void;
}) {
  return (
    <div className="grid auto-rows-fr items-stretch gap-3 md:grid-cols-3" aria-label="Sign-in methods">
      {LOGIN_METHODS.map((method) => {
        const isActive = props.activeMethod === method.id;
        const isViewing = props.viewMethod === method.id;
        const Icon = METHOD_ICONS[method.id];
        return (
          <article
            key={method.id}
            role="button"
            tabIndex={0}
            aria-current={isViewing ? "true" : undefined}
            onClick={() => props.onView(method.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                props.onView(method.id);
              }
            }}
            className={[
              SUMMARY_METRIC_CARD.shell,
              SUMMARY_METRIC_CARD.surfaceDefault,
              "w-full cursor-pointer text-left",
              isViewing ? "ring-2 ring-zinc-900/10 dark:ring-zinc-100/15" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={SUMMARY_METRIC_CARD.badgeWrap}>
              <StatusPill
                label={isActive ? "Active" : "Inactive"}
                tone={isActive ? "success" : "neutral"}
                equalWidthLabels={METHOD_STATUS_LABELS}
              />
            </div>
            <div className={SUMMARY_METRIC_CARD.titleRow}>
              <Icon className={SUMMARY_METRIC_CARD.titleIcon} aria-hidden />
              <span className={SUMMARY_METRIC_CARD.titleText}>{method.label}</span>
            </div>
            <div className={SUMMARY_METRIC_CARD.body}>
              <div className={SUMMARY_METRIC_CARD.preview}>{method.description}</div>
              <div className={SUMMARY_METRIC_CARD.footer}>
                <button
                  type="button"
                  className={`${BUTTON.secondaryCardAction} w-full`}
                  disabled={isActive}
                  onClick={(event) => {
                    event.stopPropagation();
                    props.onActivate(method.id);
                  }}
                >
                  {isActive ? "Active" : "Activate"}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function PasswordPanel(props: { onSaved: (message: string) => void }) {
  const currentId = useId();
  const nextId = useId();
  const confirmId = useId();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const nextRequirements = useMemo(() => passwordRequirements(next), [next]);
  const confirmChecks = useMemo(() => confirmRequirements(next, confirm), [confirm, next]);
  const nextValid = nextRequirements.every((req) => req.met);
  const confirmValid = confirmChecks.every((req) => req.met);
  const canSave = current.trim().length > 0 && nextValid && confirmValid;

  function save() {
    if (!canSave) return;
    props.onSaved(LOGIN_CREDENTIALS_COPY.passwordSaved);
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <TitledCardHeader icon={KeyRound} title="Password" description="Update the password for your operator account." />
      <div className="mt-6 space-y-4">
        <PasswordFieldRow
          id={currentId}
          label="Current password"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
        />
        <PasswordFieldRow
          id={nextId}
          label="New password"
          value={next}
          onChange={setNext}
          autoComplete="new-password"
          hint={<RequirementHint items={nextRequirements} />}
        />
        <PasswordFieldRow
          id={confirmId}
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          hint={<RequirementHint items={confirmChecks} />}
        />
      </div>
      <button type="button" className={`${BUTTON.primaryCompact} mt-6`} onClick={save} disabled={!canSave}>
        Save password
      </button>
    </section>
  );
}

function MagicLinkPanel(props: { email: string }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <TitledCardHeader
        icon={Mail}
        title="Magic link"
        description="When this method is active, sign-in requests a one-time link to your email — no password required."
      />
      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className={FIELD.label}>{formatUiLabel("Sign-in email")}</dt>
          <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{props.email}</dd>
        </div>
        <div>
          <dt className={FIELD.label}>{formatUiLabel("How it works")}</dt>
          <dd className="mt-1 text-zinc-600 dark:text-zinc-400">
            Enter this email on the sign-in screen and choose &quot;Email me a link&quot;. Links expire after a short window for security.
          </dd>
        </div>
      </dl>
    </section>
  );
}

function AddPasskeyModal(props: { open: boolean; onClose: () => void; onAdd: (label: string) => void }) {
  const titleId = useId();
  const [label, setLabel] = useState("MacBook Touch ID");

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-zinc-900/50 dark:bg-black/60" aria-label="Close dialog" onClick={props.onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
        <h2 id={titleId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Add passkey
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Demo registration only — production uses WebAuthn through Supabase Auth.
        </p>
        <label className="mt-4 block">
          <span className={FIELD.label}>Passkey label</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} className={`mt-1 ${FIELD.control}`} />
        </label>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className={BUTTON.secondaryRow} onClick={props.onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={BUTTON.primaryRow}
            onClick={() => {
              props.onAdd(label.trim() || "Passkey");
              props.onClose();
            }}
          >
            Register passkey
          </button>
        </div>
      </div>
    </div>
  );
}

function PasskeyPanel(props: { onSaved: (message: string) => void }) {
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setPasskeys(readPasskeys());
  }, []);

  function addPasskey(label: string) {
    const now = new Date().toISOString();
    const next = [{ id: `pk_${Date.now()}`, label, createdAt: now, lastUsedAt: null }, ...passkeys];
    setPasskeys(next);
    writePasskeys(next);
    props.onSaved(LOGIN_CREDENTIALS_COPY.passkeySaved);
  }

  function removePasskey(id: string) {
    const next = passkeys.filter((p) => p.id !== id);
    setPasskeys(next);
    writePasskeys(next);
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <TitledCardHeader icon={Fingerprint} title="Passkeys" description="Register trusted devices or security keys for passwordless sign-in." />
        <button type="button" className={BUTTON.primaryCompact} onClick={() => setModalOpen(true)}>
          Add passkey
        </button>
      </div>

      {passkeys.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          No passkeys registered yet. Add one to use biometrics or a security key at sign-in.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {passkeys.map((pk) => (
            <li key={pk.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{pk.label}</p>
                <p className="text-xs text-zinc-500">Added {new Date(pk.createdAt).toLocaleDateString()}</p>
              </div>
              <button type="button" className={BUTTON.rejectCompact} onClick={() => removePasskey(pk.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <AddPasskeyModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={addPasskey} />
    </section>
  );
}

export function LoginCredentialsPage(props: { email: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const methodFromUrl = parseLoginMethod(searchParams.get("method"));
  const [activeMethod, setActiveMethod] = useState<LoginMethodId>(() => readStoredMethod());
  const [viewMethod, setViewMethod] = useState<LoginMethodId>(methodFromUrl);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    setActiveMethod(readStoredMethod());
  }, []);

  useEffect(() => {
    if (searchParams.get("method")) {
      setViewMethod(methodFromUrl);
      return;
    }
    setViewMethod(readStoredMethod());
  }, [methodFromUrl, searchParams]);

  const viewMethodPanel = useCallback(
    (method: LoginMethodId) => {
      setViewMethod(method);
      router.replace(loginMethodHref(method), { scroll: false });
      setFlash(null);
    },
    [router],
  );

  const activateMethod = useCallback((method: LoginMethodId) => {
    setActiveMethod(method);
    writeStoredMethod(method);
    const message =
      method === "password"
        ? LOGIN_CREDENTIALS_COPY.passwordActivated
        : method === "magic-link"
          ? LOGIN_CREDENTIALS_COPY.magicLinkActivated
          : LOGIN_CREDENTIALS_COPY.passkeyActivated;
    setFlash(message);
    window.setTimeout(() => setFlash(null), 5000);
  }, []);

  function showFlash(message: string) {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 5000);
  }

  return (
    <div className="space-y-6">
      <MethodPicker
        activeMethod={activeMethod}
        viewMethod={viewMethod}
        onView={viewMethodPanel}
        onActivate={activateMethod}
      />

      {flash ? (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
          {flash}
        </p>
      ) : null}

      {viewMethod === "password" ? <PasswordPanel onSaved={showFlash} /> : null}
      {viewMethod === "magic-link" ? <MagicLinkPanel email={props.email} /> : null}
      {viewMethod === "passkey" ? <PasskeyPanel onSaved={showFlash} /> : null}
    </div>
  );
}
