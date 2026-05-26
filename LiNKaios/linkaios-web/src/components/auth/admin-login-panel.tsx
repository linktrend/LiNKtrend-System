"use client";

import { Suspense } from "react";

import { LoginForm } from "@/app/(auth)/login/login-form";
import { LoginLegalSection, useLoginLegalAcceptance } from "@/components/auth/login-legal-section";
import { ADMIN_BASE_PATH } from "@/lib/app-surface";

function AdminLoginPanelInner() {
  const [accepted, setAccepted] = useLoginLegalAcceptance(true);

  return (
    <>
      <LoginForm defaultNext={ADMIN_BASE_PATH} legalAccepted={accepted} />
      <LoginLegalSection accepted={accepted} onAcceptedChange={setAccepted} />
    </>
  );
}

export function AdminLoginPanel() {
  return (
    <Suspense fallback={<p className="mt-8 text-sm text-zinc-500">Loading…</p>}>
      <AdminLoginPanelInner />
    </Suspense>
  );
}
