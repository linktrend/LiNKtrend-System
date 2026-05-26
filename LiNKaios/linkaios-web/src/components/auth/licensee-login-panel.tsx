"use client";

import { Suspense } from "react";

import { LoginForm } from "@/app/(auth)/login/login-form";
import { useLoginLegalAcceptance } from "@/components/auth/login-legal-section";
import { LOGIN_LEGAL_COPY } from "@/lib/login-legal-copy";
import { LICENSEE_HOME_PATH } from "@/lib/app-surface";

function LicenseeLoginPanelInner() {
  const [accepted, setAccepted] = useLoginLegalAcceptance(true);
  const year = new Date().getFullYear();

  return (
    <>
      <LoginForm
        defaultNext={LICENSEE_HOME_PATH}
        legalAccepted={accepted}
        onLegalAcceptedChange={setAccepted}
      />
      <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        {LOGIN_LEGAL_COPY.copyright(year)}
      </p>
    </>
  );
}

export function LicenseeLoginPanel() {
  return (
    <Suspense fallback={<p className="mt-8 text-sm text-zinc-500">Loading…</p>}>
      <LicenseeLoginPanelInner />
    </Suspense>
  );
}
