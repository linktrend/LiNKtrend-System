/** Presets and form options for Settings → API Access (external credentials). */

import type { ValidationRule } from "@/lib/form-validation";

export type IntegrationSecretProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "zulip"
  | "gateway"
  | "bank"
  | "payment"
  | "crm"
  | "software"
  | "other";

export type IntegrationSecretCategoryId = "llm" | "banking" | "messaging" | "other";

export type IntegrationSecretKind =
  | "api_key"
  | "secret_key"
  | "bearer_token"
  | "webhook_secret"
  | "login_password"
  | "other";

export type IntegrationSecretProviderOption = {
  key: string;
  label: string;
  categoryId: IntegrationSecretCategoryId;
  slug: string;
  provider: IntegrationSecretProvider;
  defaultSecretKind: IntegrationSecretKind;
  secretHint: string;
  placeholder: string;
  validationRules?: ValidationRule[];
};

export const INTEGRATION_SECRET_CATEGORIES: { id: IntegrationSecretCategoryId; label: string }[] = [
  { id: "llm", label: "AI language models" },
  { id: "banking", label: "Banks & payments" },
  { id: "messaging", label: "Messaging" },
  { id: "other", label: "Other" },
];

export const INTEGRATION_SECRET_KIND_OPTIONS: { value: IntegrationSecretKind; label: string }[] = [
  { value: "api_key", label: "API key" },
  { value: "secret_key", label: "Secret key" },
  { value: "bearer_token", label: "Bearer token" },
  { value: "webhook_secret", label: "Webhook secret" },
  { value: "login_password", label: "Username & password" },
  { value: "other", label: "Other" },
];

const OPENAI_KEY_RULES: ValidationRule[] = [
  { id: "openai-prefix", label: "Starts with sk-", test: (v) => v.startsWith("sk-") },
  { id: "openai-length", label: "At least 20 characters", test: (v) => v.length >= 20 },
];

const ANTHROPIC_KEY_RULES: ValidationRule[] = [
  { id: "anthropic-prefix", label: "Starts with sk-ant-", test: (v) => v.startsWith("sk-ant-") },
  { id: "anthropic-length", label: "At least 20 characters", test: (v) => v.length >= 20 },
];

const GOOGLE_KEY_RULES: ValidationRule[] = [
  { id: "google-prefix", label: "Starts with AIza", test: (v) => v.startsWith("AIza") },
  { id: "google-length", label: "At least 20 characters", test: (v) => v.length >= 20 },
];

const OPENROUTER_KEY_RULES: ValidationRule[] = [
  { id: "or-prefix", label: "Starts with sk-or-", test: (v) => v.startsWith("sk-or-") },
  { id: "or-length", label: "At least 20 characters", test: (v) => v.length >= 20 },
];

const STRIPE_SECRET_RULES: ValidationRule[] = [
  {
    id: "stripe-prefix",
    label: "Starts with sk_live_ or sk_test_",
    test: (v) => v.startsWith("sk_live_") || v.startsWith("sk_test_"),
  },
  { id: "stripe-length", label: "At least 24 characters", test: (v) => v.length >= 24 },
];

const HUBSPOT_KEY_RULES: ValidationRule[] = [
  { id: "hubspot-prefix", label: "Starts with pat-", test: (v) => v.startsWith("pat-") },
  { id: "hubspot-length", label: "At least 20 characters", test: (v) => v.length >= 20 },
];

export const INTEGRATION_SECRET_PROVIDERS: IntegrationSecretProviderOption[] = [
  {
    key: "openai",
    label: "OpenAI",
    categoryId: "llm",
    slug: "OPENAI_API_KEY",
    provider: "openai",
    defaultSecretKind: "api_key",
    secretHint: "API key from the OpenAI developer dashboard.",
    placeholder: "sk-…",
    validationRules: OPENAI_KEY_RULES,
  },
  {
    key: "anthropic",
    label: "Anthropic",
    categoryId: "llm",
    slug: "ANTHROPIC_API_KEY",
    provider: "anthropic",
    defaultSecretKind: "api_key",
    secretHint: "API key from console.anthropic.com.",
    placeholder: "sk-ant-…",
    validationRules: ANTHROPIC_KEY_RULES,
  },
  {
    key: "google",
    label: "Google AI (Gemini)",
    categoryId: "llm",
    slug: "GOOGLE_AI_API_KEY",
    provider: "google",
    defaultSecretKind: "api_key",
    secretHint: "API key from Google AI Studio or Cloud.",
    placeholder: "AIza…",
    validationRules: GOOGLE_KEY_RULES,
  },
  {
    key: "openrouter",
    label: "OpenRouter",
    categoryId: "llm",
    slug: "OPENROUTER_API_KEY",
    provider: "other",
    defaultSecretKind: "api_key",
    secretHint: "Routing key for multi-model access.",
    placeholder: "sk-or-…",
    validationRules: OPENROUTER_KEY_RULES,
  },
  {
    key: "plaid",
    label: "Plaid",
    categoryId: "banking",
    slug: "PLAID_SECRET",
    provider: "bank",
    defaultSecretKind: "secret_key",
    secretHint: "Secret from Plaid for bank account linking.",
    placeholder: "Plaid secret",
  },
  {
    key: "stripe",
    label: "Stripe",
    categoryId: "banking",
    slug: "STRIPE_SECRET_KEY",
    provider: "payment",
    defaultSecretKind: "secret_key",
    secretHint: "Secret key from the Stripe dashboard.",
    placeholder: "sk_live_… or sk_test_…",
    validationRules: STRIPE_SECRET_RULES,
  },
  {
    key: "zulip",
    label: "Zulip",
    categoryId: "messaging",
    slug: "ZULIP_API_KEY",
    provider: "zulip",
    defaultSecretKind: "api_key",
    secretHint: "Bot API key from Zulip realm settings.",
    placeholder: "Zulip bot key",
  },
  {
    key: "hubspot",
    label: "HubSpot",
    categoryId: "other",
    slug: "HUBSPOT_API_KEY",
    provider: "crm",
    defaultSecretKind: "api_key",
    secretHint: "Private app or API key for HubSpot CRM.",
    placeholder: "pat-…",
    validationRules: HUBSPOT_KEY_RULES,
  },
  {
    key: "n8n_gateway",
    label: "Workflow gateway",
    categoryId: "other",
    slug: "N8N_WEBHOOK_SECRET",
    provider: "gateway",
    defaultSecretKind: "webhook_secret",
    secretHint: "Shared secret for LiNKautowork or webhook gateways.",
    placeholder: "Webhook secret",
  },
];

export const INTEGRATION_SECRET_PROVIDER_OTHER_KEY = "other";

export function providersForCategory(categoryId: IntegrationSecretCategoryId): IntegrationSecretProviderOption[] {
  return INTEGRATION_SECRET_PROVIDERS.filter((p) => p.categoryId === categoryId);
}

export function providerOptionsForCategory(categoryId: IntegrationSecretCategoryId): { value: string; label: string }[] {
  const options = providersForCategory(categoryId).map((p) => ({ value: p.key, label: p.label }));
  options.push({ value: INTEGRATION_SECRET_PROVIDER_OTHER_KEY, label: "Other" });
  return options;
}

export function findProviderOption(key: string): IntegrationSecretProviderOption | null {
  return INTEGRATION_SECRET_PROVIDERS.find((p) => p.key === key) ?? null;
}

export function slugFromName(name: string): string {
  const base = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return (base || "EXTERNAL_CREDENTIAL").slice(0, 120);
}

export function defaultSlugForCustomProvider(name: string, secretKind: IntegrationSecretKind): string {
  const base = slugFromName(name);
  if (secretKind === "api_key") return `${base}_API_KEY`.slice(0, 120);
  if (secretKind === "secret_key") return `${base}_SECRET_KEY`.slice(0, 120);
  if (secretKind === "webhook_secret") return `${base}_WEBHOOK_SECRET`.slice(0, 120);
  if (secretKind === "bearer_token") return `${base}_BEARER_TOKEN`.slice(0, 120);
  if (secretKind === "login_password") return `${base}_LOGIN`.slice(0, 120);
  return base;
}

/** Legacy map for saved-credentials table display. */
export const INTEGRATION_SECRET_PROVIDER_OPTIONS: { value: IntegrationSecretProvider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google AI" },
  { value: "zulip", label: "Zulip" },
  { value: "gateway", label: "Gateway / webhook" },
  { value: "bank", label: "Banking API" },
  { value: "payment", label: "Payments" },
  { value: "crm", label: "CRM" },
  { value: "software", label: "External software" },
  { value: "other", label: "Other" },
];

export function providerLabel(provider: string): string {
  const match = INTEGRATION_SECRET_PROVIDER_OPTIONS.find((o) => o.value === provider);
  return match?.label ?? provider;
}

export function validationRulesForSecret(
  providerOption: IntegrationSecretProviderOption | null,
  secretKind: IntegrationSecretKind,
): ValidationRule[] | undefined {
  if (secretKind !== "api_key" && secretKind !== "secret_key") return undefined;
  return providerOption?.validationRules;
}

export function encodeLoginSecret(username: string, password: string): string {
  return JSON.stringify({ username: username.trim(), password });
}
