/** Copy and helpers for `/settings/two-factor`. */

export type TwoFactorMethodId = "totp";

export type TwoFactorState = {
  enabled: boolean;
  method: TwoFactorMethodId | null;
  verifiedAt: string | null;
  backupCodes: string[];
};

export const TWO_FACTOR_COPY = {
  pageNote:
    "Demo 2FA — no live QR enrollment yet. Verification is stored locally for MVO proof. Production uses Supabase Auth MFA (TOTP) with a scannable QR and hashed backup codes.",
  disabledTitle: "Two-factor authentication is off",
  disabledBody: "Add a second step at sign-in so a password or magic link alone is not enough to access your workspace.",
  enabledTitle: "Two-factor authentication is on",
  enabledBody: "You will be asked for a code from your authenticator app when signing in.",
  setupTitle: "Set up authenticator app",
  setupSteps: [
    "Install an authenticator app (1Password, Authy, Google Authenticator, or similar).",
    "Scan the QR code or enter the setup key manually.",
    "Enter the 6-digit code from the app to confirm.",
  ],
  demoSecret: "JBSW Y3DP EHPK 3PXP",
  demoQrLabel: "Demo setup key (scan in production via Supabase MFA enrollment)",
  verifyHint: "Enter any 6-digit code in this preview to complete setup.",
  backupTitle: "Backup codes",
  backupBody: "Save these one-time codes somewhere safe. Each code works once if you lose access to your authenticator.",
  enableSuccess: "Two-factor authentication is now enabled.",
  disableSuccess: "Two-factor authentication has been turned off.",
  disableConfirm: "Turn off 2FA? You will only need your primary sign-in method after this.",
} as const;

export const STORAGE_2FA_KEY = "linkaios-2fa-v1";
export const EVENT_2FA_CHANGED = "linkaios-2fa-changed";

export function emptyTwoFactorState(): TwoFactorState {
  return { enabled: false, method: null, verifiedAt: null, backupCodes: [] };
}

export function readTwoFactorState(): TwoFactorState {
  if (typeof window === "undefined") return emptyTwoFactorState();
  try {
    const raw = window.localStorage.getItem(STORAGE_2FA_KEY);
    if (!raw) return emptyTwoFactorState();
    return { ...emptyTwoFactorState(), ...(JSON.parse(raw) as Partial<TwoFactorState>) };
  } catch {
    return emptyTwoFactorState();
  }
}

export function writeTwoFactorState(state: TwoFactorState) {
  window.localStorage.setItem(STORAGE_2FA_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT_2FA_CHANGED));
}

export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const part = Math.random().toString(36).slice(2, 6).toUpperCase();
    const part2 = Math.random().toString(36).slice(2, 6).toUpperCase();
    codes.push(`${part}-${part2}`);
  }
  return codes;
}
