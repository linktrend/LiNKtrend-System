"use client";

import { Suspense } from "react";

import { LoginForm } from "@/app/(auth)/login/login-form";
import { LoginLegalSection, useLoginLegalAcceptance } from "@/components/auth/login-legal-section";
import { LICENSEE_HOME_PATH } from "@/lib/app-surface";

function LicenseeLoginPanelInner() {
  const [accepted, setAccepted] = useLoginLegalAcceptance(true);

  return (
    <>
      <LoginForm defaultNext={LICENSEE_HOME_PATH} legalAccepted={accepted} />
      <LoginLegalSection accepted={accepted} onAcceptedChange={setAccepted} />
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
