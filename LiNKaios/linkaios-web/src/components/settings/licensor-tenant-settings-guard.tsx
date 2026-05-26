"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAppSurface } from "@/components/app-surface-provider";
import { useAppRole } from "@/components/role-preview-provider";

/** Blocks licensee-only settings routes when the actor is a platform licensor operator. */
export function LicensorTenantSettingsGuard(props: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { kind } = useAppRole();
  const router = useRouter();
  const { href: appHref } = useAppSurface();
  const redirectTo = props.redirectTo ?? "/settings?tab=security";

  useEffect(() => {
    if (kind === "licensor") {
      router.replace(appHref(redirectTo));
    }
  }, [kind, router, appHref, redirectTo]);

  if (kind === "licensor") {
    return <p className="text-sm text-zinc-500">Redirecting…</p>;
  }

  return props.children;
}
