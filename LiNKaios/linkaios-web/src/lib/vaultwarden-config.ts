/** LiNKtrend operator secrets vault — canonical store is link-vaultwarden, not LiNKaios UI. */

export const VAULTWARDEN_REPO = "link-vaultwarden";
export const VAULTWARDEN_CAPABILITY_SCOPE = "cap.vaultwarden.secret_sharing";

/** Public operator URL when deployed — set `NEXT_PUBLIC_VAULTWARDEN_URL` in runtime env. */
export function vaultwardenPublicUrl(): string {
  const raw = process.env.NEXT_PUBLIC_VAULTWARDEN_URL?.trim() ?? "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return "";
}

export const VAULTWARDEN_SECRETS_COPY = {
  title: "Platform Secrets",
  subtitle:
    "LLM keys, Stripe, database credentials, and other secrets for operating LiNKaios live in Vaultwarden — not in this app.",
  cardDescription:
    "Platform operator secrets — LLM providers, Stripe, databases, and infrastructure credentials. Managed in Vaultwarden (link-vaultwarden).",
  openAction: "Open Vaultwarden",
  missingUrlNote:
    "Set NEXT_PUBLIC_VAULTWARDEN_URL to your operator Vaultwarden instance. LiNKaios reads secrets from Google Secret Manager at runtime; Vaultwarden is where operators store and rotate them.",
} as const;
