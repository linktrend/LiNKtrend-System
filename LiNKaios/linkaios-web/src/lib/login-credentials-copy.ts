/** Copy and types for `/settings/login-credentials`. */

export const LOGIN_METHODS = [
  {
    id: "password",
    label: "Password",
    description: "Sign in with email and a password you set and rotate here.",
  },
  {
    id: "magic-link",
    label: "Magic link",
    description: "Passwordless email link — we send a one-time sign-in link when you request access.",
  },
  {
    id: "passkey",
    label: "Passkey",
    description: "Device biometrics or security key — fastest sign-in on trusted devices.",
  },
] as const;

export type LoginMethodId = (typeof LOGIN_METHODS)[number]["id"];

export const LOGIN_CREDENTIALS_COPY = {
  pageNote:
    "Demo sign-in preferences — only one primary method is active at a time. Production wiring uses Supabase Auth (password, magic link, and WebAuthn passkeys).",
  activeMethodTitle: "Active sign-in method",
  activeMethodHint: "Select exactly one method. Other methods are disabled until you switch.",
  passwordSaved: "Password updated (demo — no Supabase call in this preview).",
  methodActivated: "Sign-in method updated.",
  passwordActivated: "Password is now your active sign-in method.",
  magicLinkActivated: "Magic link is now your active sign-in method.",
  passkeyActivated: "Passkey is now your active sign-in method.",
  passkeySaved: "Passkey registered (demo — WebAuthn not invoked in this preview).",
} as const;

const LOGIN_METHOD_IDS = new Set<string>(LOGIN_METHODS.map((m) => m.id));

export function parseLoginMethod(raw: string | null | undefined): LoginMethodId {
  if (raw && LOGIN_METHOD_IDS.has(raw)) return raw as LoginMethodId;
  return "password";
}

export function loginMethodHref(method: LoginMethodId): string {
  if (method === "password") return "/settings/login-credentials";
  return `/settings/login-credentials?method=${method}`;
}
