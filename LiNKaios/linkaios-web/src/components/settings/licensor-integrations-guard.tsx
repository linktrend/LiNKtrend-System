"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAppSurface } from "@/components/app-surface-provider";
import { useAppRole } from "@/components/role-preview-provider";

/** Capability connectors live in LiNKskills — not licensee-style integration requests. */
export function LicensorIntegrationsGuard(props: { children: React.ReactNode }) {
  const { kind } = useAppRole();
  const router = useRouter();
  const { href: appHref } = useAppSurface();

  useEffect(() => {
    if (kind === "licensor") {
      router.replace(appHref("/skills/connectors"));
    }
  }, [kind, router, appHref]);

  if (kind === "licensor") {
    return <p className="text-sm text-zinc-500">Redirecting to LiNKskills capabilities…</p>;
  }

  return props.children;
}
