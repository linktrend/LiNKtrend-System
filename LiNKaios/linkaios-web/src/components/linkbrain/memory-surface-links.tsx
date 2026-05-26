"use client";

import Link from "next/link";

import { useMemoryHref, useMemoryPath } from "@/hooks/use-memory-href";
import type { LinkbrainTab } from "@/lib/linkbrain-data";

export function MemoryTabLink(props: {
  tab: LinkbrainTab;
  className?: string;
  children: React.ReactNode;
}) {
  const hrefForTab = useMemoryHref();
  return (
    <Link href={hrefForTab(props.tab)} className={props.className}>
      {props.children}
    </Link>
  );
}

export function MemoryPathLink(props: {
  path: string;
  className?: string;
  children: React.ReactNode;
}) {
  const hrefForPath = useMemoryPath();
  return (
    <Link href={hrefForPath(props.path)} className={props.className}>
      {props.children}
    </Link>
  );
}
