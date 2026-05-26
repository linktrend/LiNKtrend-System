import Link from "next/link";
import { Suspense } from "react";

import { SessionFromHash } from "@/components/auth/session-from-hash";
import { TYPE } from "@/lib/ui-standards";

export function LoginPageShell(props: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  devAdminLoginHref?: string;
}) {
  const showDevAdminLink = props.devAdminLoginHref && process.env.NODE_ENV !== "production";

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <SessionFromHash />
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-700 dark:text-sky-400">{props.eyebrow}</p>
          <h1 className={`mt-3 ${TYPE.pageTitle}`}>{props.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{props.subtitle}</p>
          <Suspense fallback={<p className="mt-8 text-sm text-zinc-500">Loading…</p>}>{props.children}</Suspense>
        </div>
      </div>

      {showDevAdminLink ? (
        <Link
          href={props.devAdminLoginHref!}
          className="fixed bottom-4 right-4 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Admin login
        </Link>
      ) : null}
    </div>
  );
}
