"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppSurface } from "@/components/app-surface-provider";
import { LicensorSuitesIndex } from "@/components/admin/licensor-suites-index";

/** Routes licensees to My Suites; licensor admin sees the product builder index. */
export function SuitesIndexRouter() {
  const { isAdmin, href } = useAppSurface();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.replace(href("/suites/my-suites"));
    }
  }, [isAdmin, href, router]);

  if (!isAdmin) return null;

  return <LicensorSuitesIndex />;
}
