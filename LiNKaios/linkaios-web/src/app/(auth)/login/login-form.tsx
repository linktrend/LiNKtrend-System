"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { LOGIN_LEGAL_COPY, LOGIN_LEGAL_ROUTES, LOGIN_LOST_ACCESS_PATH } from "@/lib/login-legal-copy";
import { BUTTON } from "@/lib/ui-standards";

function resolveDestination(nextPath: string, fallback: string, apiDestination?: string): string {
  if (apiDestination?.startsWith("/")) return apiDestination;
  if (nextPath.startsWith("/")) return nextPath;
  return fallback;
}

export function LoginForm(props: {
  defaultNext: string;
  legalAccepted: boolean;
  onLegalAcceptedChange: (value: boolean) => void;
}) {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || props.defaultNext;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!props.legalAccepted) {
      setError("Accept the Terms & Conditions and Privacy Policy to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const submittedUsername = String(formData.get("username") ?? username).trim();
      const submittedPassword = String(formData.get("password") ?? password);

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: submittedUsername, password: submittedPassword, next: nextPath }),
      });

      const body = (await loginRes.json()) as { destination?: string; error?: string };
      if (!loginRes.ok) {
        setError(body.error ?? "Sign in failed");
        return;
      }

      window.location.assign(resolveDestination(nextPath, props.defaultNext, body.destination));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form method="post" action="#" onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Username
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>

      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={props.legalAccepted}
          onChange={(e) => props.onLegalAcceptedChange(e.target.checked)}
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

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={loading || !props.legalAccepted}
        className={BUTTON.primaryRow}
      >
        {loading ? "Logging in…" : "Log in"}
      </button>

      <p className="text-center">
        <Link
          href={LOGIN_LOST_ACCESS_PATH}
          className="text-sm font-medium text-sky-700 underline dark:text-sky-400"
        >
          {LOGIN_LEGAL_COPY.lostAccessLink}
        </Link>
      </p>
    </form>
  );
}
