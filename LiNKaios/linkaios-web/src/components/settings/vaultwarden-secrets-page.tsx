"use client";

import { ExternalLink, KeyRound } from "lucide-react";

import { StubBadge } from "@/components/stub-badge";
import { TitledCardHeader } from "@/components/titled-card-header";
import {
  VAULTWARDEN_CAPABILITY_SCOPE,
  VAULTWARDEN_REPO,
  VAULTWARDEN_SECRETS_COPY,
  vaultwardenPublicUrl,
} from "@/lib/vaultwarden-config";
import { BUTTON } from "@/lib/ui-standards";

export function VaultwardenSecretsPage() {
  const vaultUrl = vaultwardenPublicUrl();

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <TitledCardHeader
        icon={KeyRound}
        title={VAULTWARDEN_SECRETS_COPY.title}
        description={VAULTWARDEN_SECRETS_COPY.subtitle}
        action={<StubBadge label={`${VAULTWARDEN_REPO} · ${VAULTWARDEN_CAPABILITY_SCOPE}`} />}
        flushContent
      />

      <p className="mt-4 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
        LiNKtrend operators use{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-900">{VAULTWARDEN_REPO}</code> for team
        credential sharing. LiNKaios loads production values from Google Secret Manager — this page does not store
        secrets.
      </p>

      {vaultUrl ? (
        <a
          href={vaultUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BUTTON.secondaryRow} mt-6 inline-flex items-center gap-2`}
        >
          {VAULTWARDEN_SECRETS_COPY.openAction}
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      ) : (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{VAULTWARDEN_SECRETS_COPY.missingUrlNote}</p>
      )}
    </section>
  );
}
