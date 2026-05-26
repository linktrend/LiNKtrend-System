"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import {
  deleteIntegrationSecretAction,
  listIntegrationSecretsAction,
  upsertIntegrationSecretAction,
  type IntegrationSecretRow,
} from "@/components/settings/integration-secrets-actions";
import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { FormField, FormSelect, FormTextInput } from "@/components/forms";
import {
  allRulesMet,
  type FieldValidationState,
} from "@/lib/form-validation";
import {
  defaultSlugForCustomProvider,
  encodeLoginSecret,
  findProviderOption,
  INTEGRATION_SECRET_CATEGORIES,
  INTEGRATION_SECRET_KIND_OPTIONS,
  INTEGRATION_SECRET_PROVIDER_OTHER_KEY,
  providerLabel,
  providerOptionsForCategory,
  providersForCategory,
  validationRulesForSecret,
  type IntegrationSecretCategoryId,
  type IntegrationSecretKind,
  type IntegrationSecretProvider,
  type IntegrationSecretProviderOption,
} from "@/lib/integration-secret-presets";
import { BUTTON, formatUiLabel } from "@/lib/ui-standards";

function firstProviderKey(categoryId: IntegrationSecretCategoryId): string {
  const list = providersForCategory(categoryId);
  return list[0]?.key ?? INTEGRATION_SECRET_PROVIDER_OTHER_KEY;
}

function applyProviderOption(option: IntegrationSecretProviderOption | null, secretKind?: IntegrationSecretKind) {
  if (!option) {
    return {
      label: "",
      slug: "",
      provider: "other" as IntegrationSecretProvider,
      secretKind: secretKind ?? ("api_key" as IntegrationSecretKind),
    };
  }
  return {
    label: option.label,
    slug: option.slug,
    provider: option.provider,
    secretKind: secretKind ?? option.defaultSecretKind,
  };
}

export function ApiKeysPanel(props: { initialRows: IntegrationSecretRow[]; canManage: boolean }) {
  const [rows, setRows] = useState<IntegrationSecretRow[]>(props.initialRows);
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [categoryId, setCategoryId] = useState<IntegrationSecretCategoryId>("llm");
  const [providerKey, setProviderKey] = useState(() => firstProviderKey("llm"));
  const [customProviderName, setCustomProviderName] = useState("");
  const [slug, setSlug] = useState(() => providersForCategory("llm")[0]?.slug ?? "");
  const [label, setLabel] = useState(() => providersForCategory("llm")[0]?.label ?? "");
  const [provider, setProvider] = useState<IntegrationSecretProvider>(
    () => providersForCategory("llm")[0]?.provider ?? "other",
  );
  const [secretKind, setSecretKind] = useState<IntegrationSecretKind>(
    () => providersForCategory("llm")[0]?.defaultSecretKind ?? "api_key",
  );
  const [secretValue, setSecretValue] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const isOtherProvider = providerKey === INTEGRATION_SECRET_PROVIDER_OTHER_KEY;
  const selectedProvider = useMemo(
    () => (isOtherProvider ? null : findProviderOption(providerKey)),
    [isOtherProvider, providerKey],
  );

  const secretValidationRules = useMemo(
    () => validationRulesForSecret(selectedProvider, secretKind),
    [selectedProvider, secretKind],
  );

  const secretValidationState: FieldValidationState = { touched: submitted, submitted };

  useEffect(() => {
    if (isOtherProvider) return;
    const option = findProviderOption(providerKey);
    if (!option) return;
    const next = applyProviderOption(option);
    setLabel(next.label);
    setSlug(next.slug);
    setProvider(next.provider);
    setSecretKind(next.secretKind);
    setSecretValue("");
    setLoginUsername("");
    setLoginPassword("");
  }, [providerKey, isOtherProvider]);

  useEffect(() => {
    if (!isOtherProvider || !customProviderName.trim()) return;
    setLabel(customProviderName.trim());
    setSlug(defaultSlugForCustomProvider(customProviderName, secretKind));
    setProvider("other");
  }, [isOtherProvider, customProviderName, secretKind]);

  const refresh = useCallback(() => {
    startTransition(() => {
      void (async () => {
        setErr(null);
        const r = await listIntegrationSecretsAction();
        if (!r.ok) {
          setErr(r.error);
          return;
        }
        setRows(r.rows);
      })();
    });
  }, []);

  function onCategoryChange(nextCategory: IntegrationSecretCategoryId) {
    setCategoryId(nextCategory);
    const nextKey = firstProviderKey(nextCategory);
    setProviderKey(nextKey);
    setCustomProviderName("");
    setSecretValue("");
    setLoginUsername("");
    setLoginPassword("");
    if (nextKey === INTEGRATION_SECRET_PROVIDER_OTHER_KEY) {
      setLabel("");
      setSlug("");
      setProvider("other");
      setSecretKind("api_key");
      return;
    }
    const option = findProviderOption(nextKey);
    const next = applyProviderOption(option);
    setLabel(next.label);
    setSlug(next.slug);
    setProvider(next.provider);
    setSecretKind(next.secretKind);
  }

  function onProviderChange(nextKey: string) {
    setProviderKey(nextKey);
    setCustomProviderName("");
    setSecretValue("");
    setLoginUsername("");
    setLoginPassword("");
  }

  function onSecretKindChange(nextKind: IntegrationSecretKind) {
    setSecretKind(nextKind);
    setSecretValue("");
    setLoginUsername("");
    setLoginPassword("");
    if (isOtherProvider && customProviderName.trim()) {
      setSlug(defaultSlugForCustomProvider(customProviderName, nextKind));
    } else if (selectedProvider) {
      setSlug(
        nextKind === selectedProvider.defaultSecretKind
          ? selectedProvider.slug
          : defaultSlugForCustomProvider(selectedProvider.label, nextKind),
      );
    }
  }

  function resetForm() {
    setSubmitted(false);
    setCategoryId("llm");
    const key = firstProviderKey("llm");
    setProviderKey(key);
    setCustomProviderName("");
    setSecretValue("");
    setLoginUsername("");
    setLoginPassword("");
    const option = findProviderOption(key);
    const next = applyProviderOption(option);
    setLabel(next.label);
    setSlug(next.slug);
    setProvider(next.provider);
    setSecretKind(next.secretKind);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setFlash(null);
    setErr(null);

    if (isOtherProvider && !customProviderName.trim()) {
      setErr("Enter a provider name when Other is selected.");
      return;
    }
    if (!slug.trim() || !label.trim()) {
      setErr("Identifier and display name are required.");
      return;
    }

    let payload = secretValue.trim();
    if (secretKind === "login_password") {
      if (!loginUsername.trim() || !loginPassword.trim()) {
        setErr("Username and password are required.");
        return;
      }
      payload = encodeLoginSecret(loginUsername, loginPassword);
    } else if (!payload) {
      setErr("Secret value is required.");
      return;
    }

    if (secretValidationRules && !allRulesMet(payload, secretValidationRules)) {
      setErr("Fix the secret format hints before saving.");
      return;
    }

    startTransition(() => {
      void (async () => {
        const r = await upsertIntegrationSecretAction({ slug, label, provider, secretValue: payload });
        if (!r.ok) {
          setErr(r.error);
          return;
        }
        setFlash("Credential saved. The secret value is not shown again after save.");
        window.setTimeout(() => setFlash(null), 5000);
        resetForm();
        refresh();
      })();
    });
  }

  function remove(id: string) {
    if (
      !confirm(
        "Remove this credential? LiNKbots and automations that use it may fail until you add a replacement.",
      )
    ) {
      return;
    }
    setFlash(null);
    setErr(null);
    startTransition(() => {
      void (async () => {
        const r = await deleteIntegrationSecretAction(id);
        if (!r.ok) {
          setErr(r.error);
          return;
        }
        setFlash("Credential removed.");
        window.setTimeout(() => setFlash(null), 4000);
        refresh();
      })();
    });
  }

  if (!props.canManage) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        <p className="font-medium">Admins only</p>
        <p className="mt-2 text-amber-900/90 dark:text-amber-100/90">
          Workspace admins add and rotate external provider credentials here. Ask an admin if you need a key or secret
          connected to LiNKaios.
        </p>
      </div>
    );
  }

  const secretHint =
    secretKind === "login_password"
      ? "Stored securely for LiNKbots and capabilities — not shown again after save."
      : selectedProvider?.secretHint ?? "Paste the key or secret from the external provider.";

  const secretPlaceholder =
    secretKind === "login_password"
      ? ""
      : selectedProvider?.placeholder ?? "Paste key or secret";

  return (
    <div className="space-y-6">
      {flash ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100"
        >
          {flash}
        </p>
      ) : null}
      {err ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
        >
          {err}
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatUiLabel("Saved credentials")}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Keys and secrets from external services. Values are stored securely and never shown again after save.
        </p>
        <DataTableShell scrollableBody>
          <DataTable>
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[22%]" />
              <col className="w-[18%]" />
              <col className="w-[20%]" />
              <col className="w-[16%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>{formatUiLabel("Service")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Identifier")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Type")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Updated")}</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Action")}</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {rows.length === 0 ? (
                <DataTableEmptyRow colSpan={5}>No external credentials yet — add one below.</DataTableEmptyRow>
              ) : (
                rows.map((row) => (
                  <DataTableRow key={row.id} compact>
                    <td className={`${DT.tdClipCompactInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                      <span className={DT.tdTextSpan}>{row.label}</span>
                    </td>
                    <td className={`${DT.tdClipCompactInset} font-mono text-xs`}>
                      <span className={DT.tdTextSpan}>{row.slug}</span>
                    </td>
                    <td className={DT.tdClipCompactInset}>
                      <span className={DT.tdTextSpan}>{providerLabel(row.provider)}</span>
                    </td>
                    <td className={`${DT.tdClipCompactInset} font-mono text-xs text-zinc-500 dark:text-zinc-400`}>
                      <span className={DT.tdTextSpan}>{row.updated_at.replace("T", " ").slice(0, 16)}</span>
                    </td>
                    <td className={DT.tdControlCompact}>
                      <div className={DT.controlInner}>
                        <button
                          type="button"
                          disabled={pending}
                          className={BUTTON.rejectCompact}
                          onClick={() => remove(row.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatUiLabel("Add or rotate")}</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Choose a category and provider, then paste the credential from that external service.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="cred-category" label="Category">
              {({ id, invalid, describedBy }) => (
                <FormSelect
                  id={id}
                  invalid={invalid}
                  describedBy={describedBy}
                  value={categoryId}
                  onChange={(value) => onCategoryChange(value as IntegrationSecretCategoryId)}
                  options={INTEGRATION_SECRET_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
                />
              )}
            </FormField>

            <FormField id="cred-provider-pick" label="Provider">
              {({ id, invalid, describedBy }) => (
                <FormSelect
                  id={id}
                  invalid={invalid}
                  describedBy={describedBy}
                  value={providerKey}
                  onChange={onProviderChange}
                  options={providerOptionsForCategory(categoryId)}
                />
              )}
            </FormField>

            {isOtherProvider ? (
              <div className="sm:col-span-2">
                <FormField id="cred-custom-provider" label="Provider name" required>
                  {({ id, invalid, describedBy }) => (
                    <FormTextInput
                      id={id}
                      required
                      invalid={invalid || (submitted && !customProviderName.trim())}
                      describedBy={describedBy}
                      value={customProviderName}
                      onChange={setCustomProviderName}
                      placeholder="e.g. Salesforce, Notion, regional bank"
                    />
                  )}
                </FormField>
              </div>
            ) : null}

            <FormField id="cred-slug" label="Identifier" hint="Uppercase name used inside LiNKaios (e.g. OPENAI_API_KEY).">
              {({ id, invalid, describedBy }) => (
                <FormTextInput
                  id={id}
                  invalid={invalid}
                  describedBy={describedBy}
                  value={slug}
                  onChange={setSlug}
                  placeholder="OPENAI_API_KEY"
                />
              )}
            </FormField>

            <FormField id="cred-label" label="Display name">
              {({ id, invalid, describedBy }) => (
                <FormTextInput
                  id={id}
                  invalid={invalid}
                  describedBy={describedBy}
                  value={label}
                  onChange={setLabel}
                  placeholder="OpenAI production"
                />
              )}
            </FormField>

            <FormField id="cred-secret-kind" label="Secret type">
              {({ id, invalid, describedBy }) => (
                <FormSelect
                  id={id}
                  invalid={invalid}
                  describedBy={describedBy}
                  value={secretKind}
                  onChange={(value) => onSecretKindChange(value as IntegrationSecretKind)}
                  options={INTEGRATION_SECRET_KIND_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                />
              )}
            </FormField>
          </div>

          {secretKind === "login_password" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="cred-username" label="Username" required>
                {({ id, invalid, describedBy }) => (
                  <FormTextInput
                    id={id}
                    required
                    invalid={invalid || (submitted && !loginUsername.trim())}
                    describedBy={describedBy}
                    value={loginUsername}
                    onChange={setLoginUsername}
                    placeholder="service-account@company.com"
                  />
                )}
              </FormField>
              <FormField id="cred-password" label="Password" required>
                {({ id, invalid, describedBy }) => (
                  <FormTextInput
                    id={id}
                    required
                    type="password"
                    invalid={invalid || (submitted && !loginPassword.trim())}
                    describedBy={describedBy}
                    value={loginPassword}
                    onChange={setLoginPassword}
                    placeholder="••••••••"
                  />
                )}
              </FormField>
            </div>
          ) : (
            <FormField
              id="cred-secret"
              label={
                secretKind === "api_key"
                  ? "API key"
                  : secretKind === "secret_key"
                    ? "Secret key"
                    : secretKind === "bearer_token"
                      ? "Bearer token"
                      : secretKind === "webhook_secret"
                        ? "Webhook secret"
                        : "Secret value"
              }
              required
              hint={secretHint}
              value={secretValue}
              validationState={secretValidationState}
              validationRules={secretValidationRules}
              showValidationHints={submitted && Boolean(secretValidationRules?.length)}
            >
              {({ id, invalid, describedBy }) => (
                <FormTextInput
                  id={id}
                  required
                  type="password"
                  invalid={
                    invalid ||
                    (submitted &&
                      Boolean(secretValidationRules?.length) &&
                      !allRulesMet(secretValue, secretValidationRules ?? []))
                  }
                  describedBy={describedBy}
                  value={secretValue}
                  onChange={setSecretValue}
                  placeholder={secretPlaceholder}
                />
              )}
            </FormField>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button type="submit" disabled={pending} className={BUTTON.primaryRow}>
              {pending ? "Saving…" : "Save credential"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
