"use client";

import Link from "next/link";
import { useState } from "react";

import { LOGIN_LEGAL_COPY, LOGIN_LEGAL_ROUTES } from "@/lib/login-legal-copy";

export function LoginLegalSection(props: {
  accepted: boolean;
  onAcceptedChange: (value: boolean) => void;
}) {
  const year = new Date().getFullYear();

  return (
    <div className="mt-6 space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={props.accepted}
          onChange={(e) => props.onAcceptedChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900"
        />
        <span>
          I agree to the{" "}
          <Link href={LOGIN_LEGAL_ROUTES.terms} className="font-medium text-sky-700 underline dark:text-sky-400">
            {LOGIN_LEGAL_COPY.termsLink}
          </Link>{" "}
          and{" "}
          <Link href={LOGIN_LEGAL_ROUTES.privacy} className="font-medium text-sky-700 underline dark:text-sky-400">
            {LOGIN_LEGAL_COPY.privacyLink}
          </Link>
          .
        </span>
      </label>

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">{LOGIN_LEGAL_COPY.copyright(year)}</p>
    </div>
  );
}

/** Pre-checked legal acceptance state for login forms. */
export function useLoginLegalAcceptance(initial = true) {
  return useState(initial);
}
